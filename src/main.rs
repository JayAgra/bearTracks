use a2::{
    Client,
    client::ClientConfig,
    Endpoint,
};
use actix_files::NamedFile;
use actix_governor::{Governor, GovernorConfigBuilder};
use actix_http::StatusCode;
use actix_identity::{CookieIdentityPolicy, Identity, IdentityService};
use actix_session::{config::PersistentSession, Session, SessionMiddleware};
use actix_web::{
    cookie::Key,
    dev::Payload,
    error,
    http::header::ContentType,
    middleware::{self, DefaultHeaders},
    web, App, Error as AWError, FromRequest, HttpRequest, HttpResponse, HttpServer, Responder,
};
use actix_web_static_files::ResourceFiles;
use dotenv::dotenv;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use r2d2_sqlite::{self, SqliteConnectionManager};
use reqwest;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, env, f32::consts::E, fs, io, pin::Pin, sync::{Arc, RwLock}};
use tokio::sync::{mpsc, Mutex};
use webauthn_rs::prelude::*;

mod analyze;
mod auth;
mod casino;
mod db_auth;
mod db_main;
mod db_pit;
mod db_transact;
mod forward;
mod game_api;
mod passkey;
mod server_health;
mod session;
mod static_files;
mod stats;

// hashmap containing user session IDs
#[derive(Serialize, Deserialize, Default, Clone)]
struct Sessions {
    user_map: HashMap<String, db_auth::User>,
}

struct ApnClient {
    client: Arc<Mutex<Client>>
}

// gets a user object from requests. needed for db_auth::User param in handlers
impl FromRequest for db_auth::User {
    type Error = actix_web::Error;
    type Future = Pin<Box<dyn futures_util::Future<Output = Result<db_auth::User, Self::Error>>>>;

    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        let fut = Identity::from_request(req, payload);
        let session: Option<&web::Data<RwLock<Sessions>>> = req.app_data();
        if session.is_none() {
            return Box::pin(async { Err(error::ErrorUnauthorized("{\"status\": \"unauthorized\"}")) });
        }
        let session = session.unwrap().clone();
        Box::pin(async move {
            if let Some(identity) = fut.await?.identity() {
                if let Some(user) = session.read().unwrap().user_map.get(&identity).map(|x| x.clone()) {
                    return Ok(user);
                }
            };
            Err(error::ErrorUnauthorized("{\"status\": \"unauthorized\"}"))
        })
    }
}

// allows three separate pools in the single web::Data<Databases> parameter
struct Databases {
    main: db_main::Pool,
    auth: db_auth::Pool,
    transact: db_transact::Pool,
    pit: db_pit::Pool,
}

// create secret key. probably could/should be an environment variable
fn get_secret_key() -> Key {
    Key::generate()
}

// send a 401. used in many management endpoints
fn unauthorized_response() -> HttpResponse {
    HttpResponse::Unauthorized()
        .status(StatusCode::from_u16(401).unwrap())
        .insert_header(("Cache-Control", "no-cache"))
        .body("{\"status\": \"unauthorized\"}")
}

// pong!!
async fn misc_ping() -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().insert_header(("Cache-Control", "no-cache")).body("pong"))
}

// system is ok
async fn debug_ok() -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().insert_header(("Cache-Control", "no-cache")).body("true"))
}

// create account endpoint
async fn auth_post_create(db: web::Data<Databases>, data: web::Json<auth::CreateForm>) -> impl Responder {
    auth::create_account(&db.auth, data).await
}

// login endpoint
async fn auth_post_login(
    db: web::Data<Databases>,
    session: web::Data<RwLock<Sessions>>,
    identity: Identity,
    data: web::Json<auth::LoginForm>,
) -> impl Responder {
    auth::login(&db.auth, session, identity, data).await
}

// delete account endpoint required for apple platforms
async fn auth_post_delete(db: web::Data<Databases>, data: web::Json<auth::LoginForm>, session: web::Data<RwLock<crate::Sessions>>, identity: Identity) -> Result<HttpResponse, AWError> {
    Ok(auth::delete_account(&db.auth, data, session, identity).await?)
}

async fn auth_post_insert_token(db: web::Data<Databases>, data: web::Json<db_auth::ApnTokenInsertRequest>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(db_auth::insert_apn_token(&db.auth, data.clone(), user).await?)
    )
}

// destroy session endpoint
async fn auth_get_logout(session: web::Data<RwLock<Sessions>>, identity: Identity) -> impl Responder {
    auth::logout(session, identity).await
}

// create passkey
async fn auth_psk_create_start(
    db: web::Data<Databases>,
    user: db_auth::User,
    session: Session,
    webauthn: web::Data<Webauthn>,
) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(passkey::webauthn_start_registration(&db.auth, user, session, webauthn).await?))
}

// finish passkey creation
async fn auth_psk_create_finish(
    db: web::Data<Databases>,
    user: db_auth::User,
    data: web::Json<RegisterPublicKeyCredential>,
    session: Session,
    webauthn: web::Data<Webauthn>,
) -> Result<HttpResponse, AWError> {
    Ok(passkey::webauthn_finish_registration(&db.auth, user, data, session, webauthn).await?)
}

// get passkey auth challenge
async fn auth_psk_auth_start(
    db: web::Data<Databases>,
    username: web::Path<String>,
    session: Session,
    webauthn: web::Data<Webauthn>,
) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(passkey::webauthn_start_authentication(&db.auth, username.into_inner(), session, webauthn).await?))
}

// finish passkey authentication
async fn auth_psk_auth_finish(
    db: web::Data<Databases>,
    cred: web::Json<PublicKeyCredential>,
    session: Session,
    identity: Identity,
    webauthn: web::Data<Webauthn>,
    sessions: web::Data<RwLock<Sessions>>,
) -> Result<HttpResponse, AWError> {
    Ok(passkey::webauthn_finish_authentication(&db.auth, cred, session, identity, webauthn, sessions).await?)
}

#[derive(Serialize, Deserialize)]
pub struct DataMeta {
    pub seasons: Vec<String>,
    pub events: Vec<String>,
    pub teams: Vec<String>,
}

// valid entries metadata. iOS and web clients load from this.
async fn data_get_meta() -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().insert_header(("Cache-Control", "no-cache")).json(DataMeta {
        seasons: env::var("SEASONS")
            .unwrap_or_else(|_| "0".to_string())
            .split(",")
            .map(|s| s.to_string())
            .collect::<Vec<String>>(),
        events: env::var("EVENTS")
            .unwrap_or_else(|_| "0".to_string())
            .split(",")
            .map(|s| s.to_string())
            .collect::<Vec<String>>(),
        teams: env::var("TEAMS")
            .unwrap_or_else(|_| "0".to_string())
            .split(",")
            .map(|s| s.to_string())
            .collect::<Vec<String>>(),
    }))
}

// access denied template
fn access_denied_team() -> HttpResponse {
    HttpResponse::Unauthorized().insert_header(("Cache-Control", "no-cache")).body("you must be affiliated with a valid team to access data")
}

// get detailed data by submission id. used in /detail
async fn data_get_detailed(path: web::Path<String>, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.team != 0 {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_main::execute(&db.main, db_main::MainData::GetDataDetailed, path).await?))
    } else {
        Ok(access_denied_team())
    }
}

// check if a submission exists, by id. used in submit script to verify submission (verification is mostly a gimmick but whatever)
async fn data_get_exists(path: web::Path<String>, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.team != 0 {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_main::execute(&db.main, db_main::MainData::DataExists, path).await?))
    } else {
        Ok(access_denied_team())
    }
}

// get summary of all data for a given team at an event in a season. used on /browse
async fn data_get_main_brief_team(path: web::Path<String>, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.team != 0 {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_main::execute(&db.main, db_main::MainData::BriefTeam, path).await?))
    } else {
        Ok(access_denied_team())
    }
}

// get summary of all data for a given match at an event, in a specified season. used on /browsw
async fn data_get_main_brief_match(path: web::Path<String>, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.team != 0 {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_main::execute(&db.main, db_main::MainData::BriefMatch, path).await?))
    } else {
        Ok(access_denied_team())
    }
}

// get summary of all data from an event, given a season. used for /browse
async fn data_get_main_brief_event(path: web::Path<String>, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.team != 0 {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_main::execute(&db.main, db_main::MainData::BriefEvent, path).await?))
    } else {
        Ok(access_denied_team())
    }
}

async fn data_get_main_brief_season(path: web::Path<String>, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.team != 0 {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_main::execute(&db.main, db_main::MainData::BriefSeason, path).await?))
    } else {
        Ok(access_denied_team())
    }
}

// get summary of all submissions created by a certain user id. used for /browse
async fn data_get_main_brief_user(path: web::Path<String>, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.team != 0 {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_main::execute(&db.main, db_main::MainData::BriefUser, path).await?))
    } else {
        Ok(access_denied_team())
    }
}

async fn data_get_pit_data(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.team != 0 {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_pit::get_pit_data(&db.pit, req.match_info().get("season").unwrap().parse().unwrap(), req.match_info().get("event").unwrap().parse().unwrap(), req.match_info().get("team").unwrap().parse().unwrap(), user).await?))
    } else {
        Ok(access_denied_team())
    }
}

// get basic data about all teams at an event, in a season. used for event rankings. ** NO AUTH **
async fn data_get_main_teams(path: web::Path<String>, db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(db_main::execute(&db.main, db_main::MainData::GetTeams, path).await?))
}

async fn data_get_scouted_teams(req: HttpRequest, db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(db_main::get_team_numbers(&db.main, req.match_info().get("season").unwrap().parse().unwrap()).await?))
}

async fn data_get_pit_scouted_teams(req: HttpRequest, db: web::Data<Databases>, _user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(db_pit::get_pit_scouted_team_numbers_by_event(&db.pit, req.match_info().get("season").unwrap().parse::<String>().unwrap(), req.match_info().get("event").unwrap().parse::<String>().unwrap()).await?))
}

async fn data_get_pit_image(req: HttpRequest) -> impl Responder {
    NamedFile::open_async(format!("cache/images/2025/{}", req.match_info().get("id").unwrap().parse::<String>().unwrap())).await
}

// get POSTed data from form
async fn data_post_submit(data: web::Json<db_main::MainInsert>, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(db_main::execute_insert(&db.main, &db.transact, &db.auth, data, user).await?))
}

async fn data_post_submit_pit(data: web::Json<db_pit::PitInsert>, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(db_pit::execute_insert(&db.pit, &db.transact, &db.auth, data, user).await?))
}

async fn data_post_pit_image(data: web::Json::<db_pit::IncomingImage>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(db_pit::save_incoming_image(&data, user).await?))
}

// forward frc api data for teams [deprecated]
async fn event_get_frc_api(req: HttpRequest, path: web::Path<(String, String)>) -> HttpResponse {
    forward::forward_frc_api_event_teams(req, path).await
}

// forward frc api data for events. used on main form to ensure entered matches and teams are valid
async fn event_get_frc_api_matches(req: HttpRequest, path: web::Path<(String, String)> /*, user: db_auth::User*/) -> HttpResponse {
    // if user.team != 0 {
    forward::forward_frc_api_event_matches(req, path).await
    // } else {
    //     access_denied_team()
    // }
}

// get all valid submission IDs. used on /manage to create list of IDs that can be acted on
async fn manage_get_submission_ids(path: web::Path<String>, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_main::execute(&db.main, db_main::MainData::Id, path).await?))
    } else {
        Ok(unauthorized_response())
    }
}

// gets list of all valid user ids, used in /manageScouts
async fn manage_get_all_users(db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_auth::execute_get_users_mgmt(&db.auth, db_auth::UserQueryType::All, user).await?))
    } else {
        Ok(unauthorized_response())
    }
}

// gets list of users in a team, used in /manageTeam
async fn manage_get_all_users_in_team(db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" || user.team_admin != 0 {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_auth::execute_get_users_mgmt(&db.auth, db_auth::UserQueryType::Team, user).await?))
    } else {
        Ok(unauthorized_response())
    }
}

// gets all access keys, used for /manageTeams
async fn manage_get_all_keys(db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_auth::get_access_key(&db.auth, "".to_string(), db_auth::AccessKeyQuery::AllKeys).await?))
    } else {
        Ok(unauthorized_response())
    }
}

async fn manage_get_all_apn_tokens(db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_auth::get_all_apn_tokens(&db.auth).await?))
    } else {
        Ok(unauthorized_response())
    }
}

// data dump
async fn manage_data_dump(db: web::Data<Databases>, user: db_auth::User, path: web::Path<String>) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(db_main::execute(&db.main, db_main::MainData::GetAllData, path).await?))
    } else {
        Ok(unauthorized_response())
    }
}

async fn manage_refresh_cache(user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .json(cache_first_data().await?))
    } else {
        Ok(unauthorized_response())
    }
}

// DELETE endpoint to remove a submission. used in /manage
async fn manage_delete_submission(db: web::Data<Databases>, user: db_auth::User, path: web::Path<String>, client: web::Data<ApnClient>) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .body(db_main::delete_by_id(&db.main, &db.transact, &db.auth, path, client.client.lock().await).await?))
    } else {
        Ok(unauthorized_response())
    }
}

async fn manage_delete_pit_submission(db: web::Data<Databases>, user: db_auth::User, path: web::Path<String>) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .body(db_pit::delete_by_id(&db.pit, &db.transact, &db.auth, path).await?))
    } else {
        Ok(unauthorized_response())
    }
}

// DELETE endpoint to remove a user, used in /manageScouts
async fn manage_delete_user(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().insert_header(("Cache-Control", "no-cache")).body(
            db_auth::execute_manage_user(
                &db.auth,
                db_auth::UserManageAction::DeleteUser,
                [req.match_info().get("user_id").unwrap().parse().unwrap(), "".to_string()],
            )
            .await?,
        ))
    } else {
        Ok(unauthorized_response())
    }
}

// DELETE endpoint to remove a user, but for a team admin (requires that target user is member of team). used in /manageTeam
async fn manage_delete_user_team_admin(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" || user.team_admin != 0 {
        if user.admin == "true"
            || db_auth::get_user_id(&db.auth, req.match_info().get("user_id").unwrap().parse().unwrap())
                .await?
                .team
                == user.team_admin
        {
            Ok(HttpResponse::Ok().insert_header(("Cache-Control", "no-cache")).body(
                db_auth::execute_manage_user(
                    &db.auth,
                    db_auth::UserManageAction::DeleteUser,
                    [req.match_info().get("user_id").unwrap().parse().unwrap(), "".to_string()],
                )
                .await?,
            ))
        } else {
            Ok(unauthorized_response())
        }
    } else {
        Ok(unauthorized_response())
    }
}

// DELETE endpoint to 86 an access key, used in /manageTeams
async fn manage_delete_access_key(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok()
            .insert_header(("Cache-Control", "no-cache"))
            .body(db_auth::delete_access_key(&db.auth, req.match_info().get("access_key_id").unwrap().parse().unwrap()).await?))
    } else {
        Ok(unauthorized_response())
    }
}

// patch to update a user's administration status, used in /manageScouts
async fn manage_patch_admin(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().insert_header(("Cache-Control", "no-cache")).body(
            db_auth::execute_manage_user(
                &db.auth,
                db_auth::UserManageAction::ModifyAdmin,
                [
                    req.match_info().get("admin").unwrap().parse().unwrap(),
                    req.match_info().get("user_id").unwrap().parse().unwrap(),
                ],
            )
            .await?,
        ))
    } else {
        Ok(unauthorized_response())
    }
}

// patch to update a user's [team] administration status, used in /manageScouts
async fn manage_patch_team_admin(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().insert_header(("Cache-Control", "no-cache")).body(
            db_auth::execute_manage_user(
                &db.auth,
                db_auth::UserManageAction::ModifyTeamAdmin,
                [
                    req.match_info().get("admin").unwrap().parse().unwrap(),
                    req.match_info().get("user_id").unwrap().parse().unwrap(),
                ],
            )
            .await?,
        ))
    } else {
        Ok(unauthorized_response())
    }
}

// patch to update a user's points, used in /manageScouts
async fn manage_patch_points(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().insert_header(("Cache-Control", "no-cache")).body(
            db_auth::execute_manage_user(
                &db.auth,
                db_auth::UserManageAction::ModifyPoints,
                [
                    req.match_info().get("modify").unwrap().parse().unwrap(),
                    req.match_info().get("user_id").unwrap().parse().unwrap(),
                ],
            )
            .await?,
        ))
    } else {
        Ok(unauthorized_response())
    }
}

// patch to modify an existing access key, used in /manageTeams
async fn manage_patch_access_key(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().insert_header(("Cache-Control", "no-cache")).body(
            db_auth::update_access_key(
                &db.auth,
                req.match_info().get("key").unwrap().parse().unwrap(),
                req.match_info().get("id").unwrap().parse().unwrap(),
            )
            .await?,
        ))
    } else {
        Ok(unauthorized_response())
    }
}

// post to create a new access key, used in /manageTeams
async fn manage_post_access_key(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().insert_header(("Cache-Control", "no-cache")).body(
            db_auth::create_access_key(
                &db.auth,
                req.match_info().get("key").unwrap().parse().unwrap(),
                req.match_info().get("team").unwrap().parse().unwrap(),
            )
            .await?,
        ))
    } else {
        Ok(unauthorized_response())
    }
}

// get transactions, used in /pointRecords
async fn misc_get_transact_me(db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(db_transact::execute(&db.transact, db_transact::TransactData::GetUserTransactions, user).await?))
}

// get to confirm session status and obtain current user id. used in main form to ensure session is active
async fn misc_get_whoami(user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(db_main::Id { id: user.id }))
}

// if you aren't D6MFYYVHA8 you may want to change this
const APPLE_APP_SITE_ASSOC: &str = "{\"webcredentials\":{\"apps\":[\"D6MFYYVHA8.com.jayagra.beartracks\",\"D6MFYYVHA8.com.jayagra.beartracks-scout\",\"D6MFYYVHA8.com.jayagra.beartracks-manage\",\"D6MFYYVHA8.com.jayagra.beartracks.watchkitapp\"]}}";
async fn misc_apple_app_site_association() -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().content_type(ContentType::json()).body(APPLE_APP_SITE_ASSOC))
}

// get all points. used to construct the leaderboard
async fn points_get_all(db: web::Data<Databases>, _user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(db_auth::execute_scores(&db.auth, db_auth::AuthData::GetUserScores).await?))
}

// get spin wheel for the casino
async fn casino_wheel(db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .body(casino::spin_thing(&db.auth, &db.transact, user).await?))
}

// get for debugging. returns the current user object.
async fn debug_get_user(user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().insert_header(("Cache-Control", "no-cache")).json(user))
}

// server health for debug
async fn debug_health(session: web::Data<RwLock<Sessions>>) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(server_health::get_server_health(session)))
}

// *** code retained if game-like features are relevant in future *** //

// get all user's owned cards
async fn _game_get_cards(db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(game_api::get_owned_cards(&db.auth, user).await?))
}

// get all user's owned cards (by a username)
// ** NO AUTH **
async fn _game_get_cards_by_username(db: web::Data<Databases>, req: HttpRequest) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(game_api::get_owned_cards_by_user(&db.auth, req.match_info().get("user").unwrap().parse().unwrap()).await?))
}

// get random team from scouted teams
async fn _game_open_lootbox(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(game_api::open_loot_box(&db.auth, &db.main, user, req.match_info().get("event").unwrap().parse().unwrap()).await?))
}

// set player's hand
async fn _game_set_hand(db: web::Data<Databases>, data: web::Json<game_api::CardsPostData>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "no-cache"))
        .json(game_api::set_held_cards(&db.auth, user, &data).await?))
}

// ** NO AUTH **
async fn game_get_team(req: HttpRequest, db: web::Data<Databases>, _user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().insert_header(("Cache-Control", "no-cache")).json(
        game_api::execute(
            &db.main,
            req.match_info().get("season").unwrap().parse().unwrap(),
            req.match_info().get("event").unwrap().parse().unwrap(),
            req.match_info().get("team").unwrap().parse().unwrap(),
        )
        .await?,
    ))
}

async fn return_discontinued_gone(_req: HttpRequest) -> Result<HttpResponse, AWError> {
    Err(error::ErrorGone("{\"status\": \"discontinued\"}"))
}

async fn cache_first_data() -> Result<bool, std::io::Error> {
    // cache all possible files
    let seasons = env::var("SEASONS")
        .unwrap_or_else(|_| "0".to_string())
        .split(",")
        .map(|s| s.to_string())
        .collect::<Vec<String>>();
    let events = env::var("EVENTS")
        .unwrap_or_else(|_| "0".to_string())
        .split(",")
        .map(|s| s.to_string())
        .collect::<Vec<String>>();

    for i in 0..seasons.len() {
        fs::create_dir_all(format!("cache/images/{}", seasons[i]))?;
        for j in 0..events.len() {
            // prevent my test schedules from being thrown away
            if events[j] != "TEST" {
                // cache team list
                let team_target_url = format!("https://frc-api.firstinspires.org/v3.0/{}/teams?eventCode={}", seasons[i], events[j]);
                let team_client = reqwest::Client::new();
                let team_response = team_client
                    .request(actix_http::Method::GET, team_target_url)
                    .header("Authorization", format!("Basic {}", env::var("FRC_API_KEY").unwrap_or_else(|_| "NONE".to_string())))
                    .send()
                    .await;

                match team_response {
                    Ok(response) => {
                        if response.status() == 200 {
                            fs::create_dir_all(format!("cache/frc_api/{}/{}", seasons[i], events[j]))?;
                            fs::write(format!("cache/frc_api/{}/{}/teams.json", seasons[i], events[j]), response.text().await.unwrap())
                                .expect(format!("Failed to cache {}/{} team JSON. Could not write file.", seasons[i], events[j]).as_str());
                        } else {
                            log::error!("Failed to cache {}/{} team JSON. Response status {}.", seasons[i], events[j], response.status());
                        }
                    }
                    Err(_) => {
                        log::error!("Failed to cache {}/{} team JSON. Response was not OK.", seasons[i], events[j]);
                    }
                }

                let match_target_url =
                    format!("https://frc-api.firstinspires.org/v3.0/{}/schedule/{}?tournamentLevel=qualification", seasons[i], events[j]);
                let match_client = reqwest::Client::new();
                let match_response = match_client
                    .request(actix_http::Method::GET, match_target_url)
                    .header("Authorization", format!("Basic {}", env::var("FRC_API_KEY").unwrap_or_else(|_| "NONE".to_string())))
                    .send()
                    .await;

                match match_response {
                    Ok(response) => {
                        if response.status() == 200 {
                            fs::create_dir_all(format!("cache/frc_api/{}/{}", seasons[i], events[j]))?;
                            fs::write(format!("cache/frc_api/{}/{}/matches.json", seasons[i], events[j]), response.text().await.unwrap())
                                .expect(format!("Failed to cache {}/{} match JSON. Could not write file.", seasons[i], events[j]).as_str());
                        } else {
                            log::error!("Failed to cache {}/{} match JSON. Response status {}.", seasons[i], events[j], response.status());
                        }
                    }
                    Err(_) => {
                        log::error!("Failed to cache {}/{} match JSON. Response was not OK.", seasons[i], events[j]);
                    }
                }
            }
        }
    }

    Ok(true)
}

include!(concat!(env!("OUT_DIR"), "/generated.rs"));

#[actix_web::main]
async fn main() -> io::Result<()> {
    // load environment variables from .env file
    dotenv().ok();

    // don't log all that shit when in release mode
    if cfg!(debug_assertions) {
        env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    } else {
        env_logger::init_from_env(env_logger::Env::new().default_filter_or("error"));
        println!("[OK] starting in release mode");
    }

    let _cache_ok = cache_first_data().await;

    // hashmap w: web::Data<RwLock<Sessions>>ith user sessions in it
    let sessions: web::Data<RwLock<Sessions>> = web::Data::new(RwLock::new(Sessions { user_map: HashMap::new() }));

    // main database connection
    let main_db_manager = SqliteConnectionManager::file("data.db");
    let main_db_pool = db_main::Pool::new(main_db_manager).unwrap();
    let main_db_connection = main_db_pool.get().expect("main db: connection failed");
    main_db_connection.execute_batch("PRAGMA journal_mode=WAL;").expect("main db: WAL failed");
    drop(main_db_connection);

    // auth database connection
    let auth_db_manager = SqliteConnectionManager::file("data_auth.db");
    let auth_db_pool = db_main::Pool::new(auth_db_manager).unwrap();
    let auth_db_connection = auth_db_pool.get().expect("auth db: connection failed");
    auth_db_connection.execute_batch("PRAGMA journal_mode=WAL;").expect("auth db: WAL failed");
    drop(auth_db_connection);

    // transaction database connection
    let trans_db_manager = SqliteConnectionManager::file("data_transact.db");
    let trans_db_pool = db_main::Pool::new(trans_db_manager).unwrap();
    let trans_db_connection = trans_db_pool.get().expect("trans db: connection failed");
    trans_db_connection
        .execute_batch("PRAGMA journal_mode=WAL;")
        .expect("trans db: WAL failed");
    drop(trans_db_connection);

    // pit database connection
    let pit_db_manager = SqliteConnectionManager::file("data_pit.db");
    let pit_db_pool = db_pit::Pool::new(pit_db_manager).unwrap();
    let pit_db_connection = pit_db_pool.get().expect("pit db: connection failed");
    pit_db_connection
        .execute_batch("PRAGMA journal_mode=WAL;")
        .expect("pit db: WAL failed");
    drop(pit_db_connection);

    // create secret key for uh cookies i think
    let secret_key = get_secret_key();

    // ratelimiting with governor
    let governor_conf = GovernorConfigBuilder::default()
        // these may be a lil high but whatever
        .per_nanosecond(100)
        .burst_size(25000)
        .finish()
        .unwrap();

    /*
     *  generate a self-signed certificate for localhost (run from bearTracks directory):
     *  openssl req -x509 -newkey rsa:4096 -nodes -keyout ./ssl/key.pem -out ./ssl/cert.pem -days 365 -subj '/CN=localhost'
     */
    // create ssl builder for tls config
    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder.set_private_key_file("./ssl/key.pem", SslFiletype::PEM).unwrap();
    builder.set_certificate_chain_file("./ssl/cert.pem").unwrap();
    // let intermediate_cert_url = "https://letsencrypt.org/certs/lets-encrypt-r3.der";
    // let intermediate_bytes = reqwest::blocking::get(intermediate_cert_url).unwrap().bytes().unwrap();
    // let intermediate_cert = X509::from_der(&intermediate_bytes).unwrap();
    // builder.add_extra_chain_cert(intermediate_cert).unwrap();
    
    // config done. now, create the new HttpServer
    log::info!("[OK] starting bearTracks on port 443 and 80");

    let environment = if env::var("APN_ENDPOINT").unwrap_or_else(|_| "SANDBOX".to_string()) == "SANDBOX".to_string() {
        Endpoint::Sandbox
    } else {
        Endpoint::Production
    };

    HttpServer::new(move || {
        // generated resources from actix_web_files
        let generated = generate();
        App::new()
            // add databases to app data
            .app_data(web::Data::new(Databases {
                main: main_db_pool.clone(),
                auth: auth_db_pool.clone(),
                transact: trans_db_pool.clone(),
                pit: pit_db_pool.clone()
            }))
            // apn client
            .app_data(web::Data::new(ApnClient {
                client: Arc::new(Mutex::new(Client::token(&mut fs::File::open("./ssl/APN.p8").unwrap(), env::var("APN_KEY_ID").unwrap_or_else(|_| "".to_string()), env::var("APN_TEAM_ID").unwrap_or_else(|_| "".to_string()), ClientConfig::new(environment.clone())).unwrap()))
            }))
            // add sessions to app data
            .app_data(sessions.clone())
            // add webauthn to app data
            .app_data(passkey::setup_passkeys())
            // use governor ratelimiting as middleware
            .wrap(Governor::new(&governor_conf))
            // use cookie id system middleware
            .wrap(IdentityService::new(
                CookieIdentityPolicy::new(&[0; 32])
                    .name("bear_tracks")
                    .max_age_secs(actix_web::cookie::time::Duration::weeks(2).whole_seconds())
                    .secure(false),
            ))
            // logging middleware
            .wrap(middleware::Logger::default())
            // session middleware
            .wrap(
                SessionMiddleware::builder(session::MemorySession, secret_key.clone())
                    .cookie_name("bear_tracks-ms".to_string())
                    .cookie_http_only(true)
                    .cookie_secure(false)
                    .session_lifecycle(
                        PersistentSession::default()
                            .session_ttl(actix_web::cookie::time::Duration::weeks(2)),
                    )
                    .build(),
            )
            // default headers for caching. overridden on most all api endpoints (7 days cache)
            .wrap(
                DefaultHeaders::new()
                    .add(("Cache-Control", "public, max-age=604800"))
                    .add(("X-bearTracks", "6.0.2")),
            )
            /* src  endpoints */
            // GET individual files
            .route("/", web::get().to(static_files::static_index))
            .route("/blackjack", web::get().to(static_files::static_blackjack))
            .route("/create", web::get().to(static_files::static_create))
            .route("/main", web::get().to(static_files::static_main))
            .route("/login", web::get().to(static_files::static_login))
            .route("/passkey", web::get().to(static_files::static_passkey))
            .route("/pointRecords", web::get().to(static_files::static_point_records))
            .route("/points", web::get().to(static_files::static_points))
            .route("/safari-pinned-tab.svg", web::get().to(static_files::static_safari_pinned))
            .route("/scouts", web::get().to(static_files::static_scouts))
            .route("/settings", web::get().to(static_files::static_settings))
            .route("/site.webmanifest", web::get().to(static_files::static_webmanifest))
            .route("/spin", web::get().to(static_files::static_spin))
            .route("/data", web::get().to(static_files::static_data))
            .route("/data/team", web::get().to(static_files::static_team))
            .route("/data/detail", web::get().to(static_files::static_detail))
            .route("/data/pit", web::get().to(static_files::static_pit))
            .route("/android-chrome-192x192.png", web::get().to(static_files::static_android_chrome_192))
            .route("/android-chrome-512x512.png", web::get().to(static_files::static_android_chrome_512))
            .route("/apple-touch-icon.png", web::get().to(static_files::static_apple_touch_icon))
            .route("/favicon-16x16.png", web::get().to(static_files::static_favicon_16))
            .route("/favicon-32x32.png", web::get().to(static_files::static_favicon_32))
            .route("/favicon.ico", web::get().to(static_files::static_favicon))
            // GET folders
            .service(ResourceFiles::new("/static", generated))
            /* auth endpoints */
            // GET
            .service(
                web::resource("/logout")
                .route(web::get().to(auth_get_logout))
            )
            // POST
            .service(
                web::resource("/api/v1/auth/create")
                    .route(web::post().to(auth_post_create)),
            )
            .service(
                web::resource("/api/v1/auth/login")
                    .route(web::post().to(auth_post_login)),
            )
            .service(
                web::resource("/api/v1/auth/delete")
                    .route(web::post().to(auth_post_delete)),
            )
            .service(
                web::resource("/api/v1/auth/apn/insert_token")
                    .route(web::post().to(auth_post_insert_token))
            )
            .service(
                web::resource("/api/v1/auth/passkey/register_start")
                    .route(web::post().to(auth_psk_create_start)),
            )
            .service(
                web::resource("/api/v1/auth/passkey/register_finish")
                    .route(web::post().to(auth_psk_create_finish)),
            )
            .service(
                web::resource("/api/v1/auth/passkey/auth_start/{username}")
                    .route(web::post().to(auth_psk_auth_start)),
            )
            .service(
                web::resource("/api/v1/auth/passkey/auth_finish")
                    .route(web::post().to(auth_psk_auth_finish)),
            )
            /* data endpoints */
            // GET (✅)
            .service(
                web::resource("/api/v1/data")
                    .route(web::get().to(data_get_meta)),
            )
            .service(
                web::resource("/api/v1/data/detail/{id}")
                    .route(web::get().to(data_get_detailed)),
            )
            .service(
                web::resource("/api/v1/data/exists/{id}")
                    .route(web::get().to(data_get_exists)),
            )
            .service(
                web::resource("/api/v1/data/brief/team/{args}*")
                    .route(web::get().to(data_get_main_brief_team)),
            ) // season/event/team
            .service(
                web::resource("/api/v1/data/brief/match/{args}*")
                    .route(web::get().to(data_get_main_brief_match)),
            ) // season/event/match_num
            .service(
                web::resource("/api/v1/data/brief/event/{args}*")
                    .route(web::get().to(data_get_main_brief_event)),
            ) // season/event
            .service(
                web::resource("/api/v1/data/brief/season/{args}*")
                    .route(web::get().to(data_get_main_brief_season)),
            ) // season/event
            .service(
                web::resource("/api/v1/data/brief/user/{args}*")
                    .route(web::get().to(data_get_main_brief_user)),
            ) // season/user_id
            .service(
                web::resource("/api/v1/data/teams/{args}*")
                    .route(web::get().to(data_get_main_teams)),
            )
            .service(
                web::resource("/api/v1/data/pit/{season}/{event}/{team}")
                    .route(web::get().to(data_get_pit_data))
            )
            .service(
                web::resource("/api/v1/data/scouted_teams/{season}")
                    .route(web::get().to(data_get_scouted_teams)),
            ) // season/event
            .service(
                web::resource("/api/v1/data/pit_scouted/{season}/{event}")
                    .route(web::get().to(data_get_pit_scouted_teams))
            )
            .service(
                web::resource("/api/v1/events/teams/{season}/{event}")
                    .route(web::get().to(event_get_frc_api)),
            )
            .service(
                web::resource("/api/v1/events/matches/{season}/{event}/{level}/{all}")
                    .route(web::get().to(event_get_frc_api_matches)),
            )
            .service(
                web::resource("/api/v1/pit/image/{id}")
                    .route(web::get().to(data_get_pit_image))
            )
            // POST (✅)
            .service(
                web::resource("/api/v1/data/submit")
                    .route(web::post().to(data_post_submit)),
            )
            .service(
                web::resource("/api/v1/data/submit_pit")
                    .route(web::post().to(data_post_submit_pit)),
            )
            .service(
                web::resource("/api/v1/data/upload_image")
                    .route(web::post().to(data_post_pit_image))
            )
            /* manage endpoints */
            // GET
            .service(
                web::resource("/api/v1/manage/submission_ids/{args}")
                    .route(web::get().to(manage_get_submission_ids)),
            )
            .service(
                web::resource("/api/v1/manage/all_users")
                    .route(web::get().to(manage_get_all_users)),
            )
            .service(
                web::resource("/api/v1/manage/team_users")
                    .route(web::get().to(manage_get_all_users_in_team)),
            )
            .service(
                web::resource("/api/v1/manage/all_access_keys")
                    .route(web::get().to(manage_get_all_keys)),
            )
            .service(
                web::resource("/api/v1/manage/all_apn_tokens")
                    .route(web::get().to(manage_get_all_apn_tokens))
            )
            .service(
                web::resource("/api/v1/manage/data_dump/{args}*")
                    .route(web::get().to(manage_data_dump)),
            )
            .service(
                web::resource("/api/v1/manage/refresh_cache")
                    .route(web::get().to(manage_refresh_cache))
            )
            // DELETE
            .service(
                web::resource("/api/v1/manage/delete/{id}")
                    .route(web::delete().to(manage_delete_submission)),
            )
            .service(
                web::resource("/api/v1/manage/delete_pit/{id}")
                    .route(web::delete().to(manage_delete_pit_submission)),
            )
            .service(
                web::resource("/api/v1/manage/user/delete/{user_id}")
                    .route(web::delete().to(manage_delete_user)),
            )
            .service(
                web::resource("/api/v1/manage/user/team_admin_delete/{user_id}")
                    .route(web::delete().to(manage_delete_user_team_admin)),
            )
            .service(
                web::resource("/api/v1/manage/access_key/delete/{access_key_id}")
                    .route(web::delete().to(manage_delete_access_key)),
            )
            // PATCH
            .service(
                web::resource("/api/v1/manage/user/update_admin/{user_id}/{admin}")
                    .route(web::patch().to(manage_patch_admin)),
            )
            .service(
                web::resource("/api/v1/manage/user/update_team_admin/{user_id}/{admin}")
                    .route(web::patch().to(manage_patch_team_admin)),
            )
            .service(
                web::resource("/api/v1/manage/user/update_points/{user_id}/{modify}")
                    .route(web::patch().to(manage_patch_points)),
            )
            .service(
                web::resource("/api/v1/manage/access_key/update/{id}/{key}")
                    .route(web::patch().to(manage_patch_access_key)),
            )
            // POST
            .service(
                web::resource("/api/v1/manage/access_key/create/{key}/{team}")
                    .route(web::post().to(manage_post_access_key)),
            )
            /* user endpoints */
            /* casino endpoints */
            // GET
            .service(
                web::resource("/api/v1/casino/spin_thing")
                    .route(web::get().to(casino_wheel)),
            )
            .service(
                web::resource("/api/v1/casino/blackjack")
                    .route(web::get().to(casino::websocket_route)),
            )
            /* points endpoints */
            // GET
            .service(
                web::resource("/api/v1/points/all")
                    .route(web::get().to(points_get_all)),
            )
            /* misc endpoints */
            // GET
            .service(
                web::resource("/api/v1/transact/me")
                    .route(web::get().to(misc_get_transact_me)),
            )
            .service(
                web::resource("/api/v1/ping")
                    .route(web::get().to(misc_ping)),
            )
            .service(
                web::resource("/api/v1/whoami")
                    .route(web::get().to(misc_get_whoami)),
            )
            .service(
                web::resource("/apple-app-site-association")
                    .route(web::get().to(misc_apple_app_site_association)),
            )
            .service(
                web::resource("/.well-known/apple-app-site-association")
                    .route(web::get().to(misc_apple_app_site_association)),
            )
            /* debug endpoints */
            // GET
            .service(
                web::resource("/api/v1/debug/user")
                    .route(web::get().to(debug_get_user)),
            )
            .service(
                web::resource("/api/v1/debug/system")
                    .route(web::get().to(debug_health)),
            )
            .service(
                web::resource("/api/v1/debug/ok")
                    .route(web::get().to(debug_ok)),
            )
            // robot game endpoints (killed) (ish)
            // GET
            .service(
                web::resource("/api/v1/game/all_owned_cards")
                    // .route(web::get().to(game_get_cards)),
                    .route(web::get().to(return_discontinued_gone))
            )
            .service(
                web::resource("/api/v1/game/owned_cards/{user}")
                    // .route(web::get().to(game_get_cards_by_username)),
                    .route(web::get().to(return_discontinued_gone))
            )
            .service(
                web::resource("/api/v1/game/my_owned_cards")
                    // .route(web::get().to(game_get_cards)),
                    .route(web::get().to(return_discontinued_gone))
            )
            .service(
                web::resource("/api/v1/game/team_data/{season}/{event}/{team}")
                    .route(web::get().to(game_get_team)),
            )
            .service(
                web::resource("/api/v1/game/open_lootbox/{event}")
                    // .route(web::get().to(game_open_lootbox)),
                    .route(web::get().to(return_discontinued_gone))
            )
            // POST
            .service(
                web::resource("/api/v1/game/set_hand")
                    // .route(web::post().to(game_set_hand))
                    .route(web::post().to(return_discontinued_gone))
            )
    })
    .bind_openssl(format!("{}:443", env::var("HOSTNAME").unwrap_or_else(|_| "localhost".to_string())), builder)?
    .bind((env::var("HOSTNAME").unwrap_or_else(|_| "localhost".to_string()), 80))?
    .workers(8)
    .run()
    .await
}
