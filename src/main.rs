use std::{env, io, collections::HashMap, pin::Pin, sync::RwLock};
use actix_governor::{Governor, GovernorConfigBuilder};
use actix_http::StatusCode;
use actix_identity::{CookieIdentityPolicy, Identity, IdentityService};
use actix_session::{SessionMiddleware, storage::CookieSessionStore};
use actix_web::{error, middleware, web, App, Error as AWError, HttpRequest, HttpResponse, HttpServer, cookie::Key, Responder, FromRequest, dev::Payload};
use actix_web_static_files::ResourceFiles;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use r2d2_sqlite::{self, SqliteConnectionManager};
use serde::{Serialize, Deserialize};

mod analyze;
mod auth;
mod casino;
mod db_auth;
mod db_main;
mod db_transact;
mod forward;
mod static_files;

#[derive(Serialize, Deserialize, Default, Clone)]
struct Sessions {
    user_map: HashMap<String, db_auth::User>
}

impl FromRequest for db_auth::User {
    type Error = actix_web::Error;
    type Future = Pin<Box<dyn futures_util::Future<Output = Result<db_auth::User, Self::Error>>>>;

    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        let fut = Identity::from_request(req, payload);
        let session: Option<&web::Data<RwLock<Sessions>>> = req.app_data();
        if session.is_none() {
            return Box::pin( async { Err(error::ErrorUnauthorized("{\"status\": \"unauthorized\"}")) });
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

struct Databases {
    main: db_main::Pool,
    auth: db_main::Pool,
    transact: db_transact::Pool
}

fn get_secret_key() -> Key {
    Key::generate()
}

async fn auth_post_create(db: web::Data<Databases>, data: web::Json<auth::CreateForm>) -> impl Responder {
    auth::create_account(&db.auth, data).await
}

async fn auth_post_login(db: web::Data<Databases>, session: web::Data<RwLock<Sessions>>, identity: Identity, data: web::Json<auth::LoginForm>) -> impl Responder {
    auth::login(&db.auth, session, identity, data).await
}

async fn auth_get_logout(session: web::Data<RwLock<Sessions>>, identity: Identity) -> impl Responder {
    auth::logout(session, identity).await
}

async fn data_get_detailed(path: web::Path<String>, db: web::Data<Databases>, _user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute(&db.main, db_main::MainData::GetDataDetailed, path).await?))
}

async fn data_get_exists(path: web::Path<String>, db: web::Data<Databases>, _user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute(&db.main, db_main::MainData::DataExists, path).await?))
}

async fn data_get_main_brief_team(req: HttpRequest, db: web::Data<Databases>, _user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute_get_brief(&db.main, db_main::MainBrief::BriefTeam, [req.match_info().get("season").unwrap().parse().unwrap(), req.match_info().get("event").unwrap().parse().unwrap(), req.match_info().get("team").unwrap().parse().unwrap()]).await?))
}

async fn data_get_main_brief_match(req: HttpRequest, db: web::Data<Databases>, _user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute_get_brief(&db.main, db_main::MainBrief::BriefMatch, [req.match_info().get("season").unwrap().parse().unwrap(), req.match_info().get("event").unwrap().parse().unwrap(), req.match_info().get("match_num").unwrap().parse().unwrap()]).await?))
}

async fn data_get_main_brief_event(req: HttpRequest, db: web::Data<Databases>, _user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute_get_brief(&db.main, db_main::MainBrief::BriefEvent, [req.match_info().get("season").unwrap().parse().unwrap(), req.match_info().get("event").unwrap().parse().unwrap(), "".to_string()]).await?))
}

async fn data_get_main_brief_user(req: HttpRequest, db: web::Data<Databases>, _user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute_get_brief(&db.main, db_main::MainBrief::BriefUser, [req.match_info().get("season").unwrap().parse().unwrap(), req.match_info().get("user_id").unwrap().parse().unwrap(), "".to_string()]).await?))
}

async fn data_get_main_teams(req: HttpRequest, db: web::Data<Databases>, _user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute_get_teams(&db.main, [req.match_info().get("season").unwrap().parse().unwrap(), req.match_info().get("event").unwrap().parse().unwrap()]).await?))
}

async fn data_post_submit(data: web::Json<db_main::MainInsert>, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute_insert(&db.main, &db.transact, &db.auth, data, user).await?))
}

async fn event_get_frc_api(req: HttpRequest, path: web::Path<(String, String)>, _user: db_auth::User) -> HttpResponse {
    forward::forward_frc_api_event_teams(req, path).await
}

async fn event_get_frc_api_matches(req: HttpRequest, path: web::Path<(String, String, String, String)>, _user: db_auth::User) -> HttpResponse {
    forward::forward_frc_api_event_matches(req, path).await
}

async fn manage_get_submission_ids(db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().json(db_main::get_ids(&db.main).await?))
    } else {
        Ok(HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("{\"status\": \"unauthorized\"}"))
    }
}

async fn manage_get_all_users(db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().json(db_auth::execute_get_users_mgmt(&db.auth).await?))
    } else {
        Ok(HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("{\"status\": \"unauthorized\"}"))
    }
}

async fn manage_get_all_keys(db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().json(db_auth::get_access_key(&db.auth, "".to_string(), db_auth::AccessKeyQuery::AllKeys).await?))
    } else {
        Ok(HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("{\"status\": \"unauthorized\"}"))
    }
}

async fn manage_delete_submission(db: web::Data<Databases>, user: db_auth::User, path: web::Path<String>) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().body(db_main::delete_by_id(&db.main, &db.transact, &db.auth, path).await?))
    } else {
        Ok(HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("{\"status\": \"unauthorized\"}"))
    }
}

async fn manage_delete_user(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().body(db_auth::execute_manage_user(&db.auth, db_auth::UserManageAction::DeleteUser, [req.match_info().get("user_id").unwrap().parse().unwrap(), "".to_string()]).await?))
    } else {
        Ok(HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("{\"status\": \"unauthorized\"}"))
    }
}

async fn manage_delete_access_key(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().body(db_auth::delete_access_key(&db.auth, req.match_info().get("access_key_id").unwrap().parse().unwrap()).await?))
    } else {
        Ok(HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("{\"status\": \"unauthorized\"}"))
    }
}

async fn manage_patch_admin(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().body(db_auth::execute_manage_user(&db.auth, db_auth::UserManageAction::ModifyAdmin, [req.match_info().get("admin").unwrap().parse().unwrap(), req.match_info().get("user_id").unwrap().parse().unwrap()]).await?))
    } else {
        Ok(HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("{\"status\": \"unauthorized\"}"))
    }
}

async fn manage_patch_team_admin(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().body(db_auth::execute_manage_user(&db.auth, db_auth::UserManageAction::ModifyTeamAdmin, [req.match_info().get("admin").unwrap().parse().unwrap(), req.match_info().get("user_id").unwrap().parse().unwrap()]).await?))
    } else {
        Ok(HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("{\"status\": \"unauthorized\"}"))
    }
}

async fn manage_patch_points(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().body(db_auth::execute_manage_user(&db.auth, db_auth::UserManageAction::ModifyPoints, [req.match_info().get("modify").unwrap().parse().unwrap(), req.match_info().get("user_id").unwrap().parse().unwrap()]).await?))
    } else {
        Ok(HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("{\"status\": \"unauthorized\"}"))
    }
}

async fn manage_patch_access_key(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().body(db_auth::update_access_key(&db.auth, req.match_info().get("key").unwrap().parse().unwrap(), req.match_info().get("id").unwrap().parse().unwrap()).await?))
    } else {
        Ok(HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("{\"status\": \"unauthorized\"}"))
    }
}

async fn manage_post_access_key(req: HttpRequest, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    if user.admin == "true" {
        Ok(HttpResponse::Ok().body(db_auth::create_access_key(&db.auth, req.match_info().get("key").unwrap().parse().unwrap(), req.match_info().get("team").unwrap().parse().unwrap()).await?))
    } else {
        Ok(HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("{\"status\": \"unauthorized\"}"))
    }
}

async fn misc_get_transact_me(db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_transact::execute(&db.transact, db_transact::TransactData::GetUserTransactions, user).await?))
}

async fn misc_get_whoami(user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::MainId { id: user.id }))
}

async fn points_get_all(db: web::Data<Databases>, _user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_auth::execute_scores(&db.auth, db_auth::AuthData::GetUserScores).await?))
}

async fn casino_wheel(db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().body(casino::spin_thing(&db.auth, &db.transact, user).await?))
}

async fn debug_get_user(user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(user))
}

include!(concat!(env!("OUT_DIR"), "/generated.rs"));

#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let sessions = web::Data::new(RwLock::new(Sessions {
        user_map: HashMap::new(),
    }));

    let main_db_manager = SqliteConnectionManager::file("data.db");
    let main_db_pool = db_main::Pool::new(main_db_manager).unwrap();
    let main_db_connection = main_db_pool.get().expect("main db: connection failed");
    main_db_connection.execute_batch("PRAGMA journal_mode=WAL;").expect("main db: WAL failed");
    drop(main_db_connection);

    let auth_db_manager = SqliteConnectionManager::file("data_auth.db");
    let auth_db_pool = db_main::Pool::new(auth_db_manager).unwrap();
    let auth_db_connection = auth_db_pool.get().expect("auth db: connection failed");
    auth_db_connection.execute_batch("PRAGMA journal_mode=WAL;").expect("auth db: WAL failed");
    drop(auth_db_connection);

    let trans_db_manager = SqliteConnectionManager::file("data_transact.db");
    let trans_db_pool = db_main::Pool::new(trans_db_manager).unwrap();
    let trans_db_connection = trans_db_pool.get().expect("trans db: connection failed");
    trans_db_connection.execute_batch("PRAGMA journal_mode=WAL;").expect("trans db: WAL failed");
    drop(trans_db_connection);

    let secret_key = get_secret_key();

    let governor_conf = GovernorConfigBuilder::default()
        .per_second(100)
        .burst_size(200)
        .finish()
        .unwrap();

    /*
        generate a self-signed certificate for localhost (run from bearTracks directory):
        openssl req -x509 -newkey rsa:4096 -nodes -keyout ./ssl/key.pem -out ./ssl/cert.pem -days 365 -subj '/CN=localhost'
     */
    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder.set_private_key_file("./ssl/key.pem", SslFiletype::PEM).unwrap();
    builder.set_certificate_chain_file("./ssl/cert.pem").unwrap();

    log::info!("starting bearTracks on port 443 and 80");

    HttpServer::new(move || {
        let generated = generate();
        App::new()
            .app_data(web::Data::new(Databases {main: main_db_pool.clone(), auth: auth_db_pool.clone(), transact: trans_db_pool.clone() }))
            .app_data(sessions.clone())
            .wrap(Governor::new(&governor_conf))
            .wrap(IdentityService::new(
                CookieIdentityPolicy::new(&[0; 32])
                    .name("bear_tracks")
                    .secure(false),
            ))
            .wrap(middleware::Logger::default())
            .wrap(SessionMiddleware::new(CookieSessionStore::default(), secret_key.clone()))
            /* src  endpoints */
                // GET individual files
                .route("/", web::get().to(static_files::static_index))
                .route("/blackjack", web::get().to(static_files::static_blackjack))
                .route("/browse", web::get().to(static_files::static_browse))
                .route("/charts", web::get().to(static_files::static_charts))
                .route("/create", web::get().to(static_files::static_create))
                .route("/detail", web::get().to(static_files::static_detail))
                .route("/login", web::get().to(static_files::static_login))
                .route("/main", web::get().to(static_files::static_main))
                .route("/manage", web::get().to(static_files::static_manage))
                .route("/manageScouts", web::get().to(static_files::static_manage_scouts))
                .route("/manageTeam", web::get().to(static_files::static_manage_team))
                .route("/manageTeams", web::get().to(static_files::static_manage_teams))
                .route("/matches", web::get().to(static_files::static_matches))
                .route("/pointRecords", web::get().to(static_files::static_point_records))
                .route("/points", web::get().to(static_files::static_points))
                .route("/scouts", web::get().to(static_files::static_scouts))
                .route("/settings", web::get().to(static_files::static_settings))
                .route("/spin", web::get().to(static_files::static_spin))
                .route("/teams", web::get().to(static_files::static_teams))
                .route("/favicon.ico", web::get().to(static_files::static_favicon))
                // GET folders
                .service(ResourceFiles::new("/static", generated))
            /* auth endpoints */
                // GET
                .service(web::resource("/logout").route(web::get().to(auth_get_logout)))
                // POST
                .service(web::resource("/api/v1/auth/create").route(web::post().to(auth_post_create)))
                .service(web::resource("/api/v1/auth/login").route(web::post().to(auth_post_login)))
            /* data endpoints */
                // GET (✅)
                .service(web::resource("/api/v1/data/detail/{id}").route(web::get().to(data_get_detailed)))
                .service(web::resource("/api/v1/data/exists/{id}").route(web::get().to(data_get_exists)))
                .service(web::resource("/api/v1/data/brief/team/{season}/{event}/{team}").route(web::get().to(data_get_main_brief_team)))
                .service(web::resource("/api/v1/data/brief/match/{season}/{event}/{match_num}").route(web::get().to(data_get_main_brief_match)))
                .service(web::resource("/api/v1/data/brief/event/{season}/{event}").route(web::get().to(data_get_main_brief_event)))
                .service(web::resource("/api/v1/data/brief/user/{season}/{user_id}").route(web::get().to(data_get_main_brief_user)))
                .service(web::resource("/api/v1/data/teams/{season}/{event}").route(web::get().to(data_get_main_teams)))
                .service(web::resource("/api/v1/events/teams/{season}/{event}").route(web::get().to(event_get_frc_api)))
                .service(web::resource("/api/v1/events/matches/{season}/{event}/{level}/{all}").route(web::get().to(event_get_frc_api_matches)))
                // POST (✅)
                .service(web::resource("/api/v1/data/submit").route(web::post().to(data_post_submit)))
            /* manage endpoints */
                // GET
                .service(web::resource("/api/v1/manage/submission_ids").route(web::get().to(manage_get_submission_ids)))
                .service(web::resource("/api/v1/manage/all_users").route(web::get().to(manage_get_all_users)))
                .service(web::resource("/api/v1/manage/all_access_keys").route(web::get().to(manage_get_all_keys)))
                // DELETE
                .service(web::resource("/api/v1/manage/delete/{id}").route(web::delete().to(manage_delete_submission)))
                .service(web::resource("/api/v1/manage/user/delete/{user_id}").route(web::delete().to(manage_delete_user)))
                .service(web::resource("/api/v1/manage/access_key/delete/{access_key_id}").route(web::delete().to(manage_delete_access_key)))
                // PATCH
                .service(web::resource("/api/v1/manage/user/update_admin/{user_id}/{admin}").route(web::patch().to(manage_patch_admin)))
                .service(web::resource("/api/v1/manage/user/update_team_admin/{user_id}/{admin}").route(web::patch().to(manage_patch_team_admin)))
                .service(web::resource("/api/v1/manage/user/update_points/{user_id}/{modify}").route(web::patch().to(manage_patch_points)))
                .service(web::resource("/api/v1/manage/access_key/update/{id}/{key}").route(web::patch().to(manage_patch_access_key)))
                // POST
                .service(web::resource("/api/v1/manage/access_key/create/{key}/{team}").route(web::post().to(manage_post_access_key)))
            /* user endpoints */
            /* casino endpoints */
                // GET
                .service(web::resource("/api/v1/casino/spin_thing").route(web::get().to(casino_wheel)))
            /* points endpoints */
                // GET
                .service(web::resource("/api/v1/points/all").route(web::get().to(points_get_all)))
            /* misc endpoints */
                // GET
                .service(web::resource("/api/v1/transact/me").route(web::get().to(misc_get_transact_me)))
                .service(web::resource("/api/v1/whoami").route(web::get().to(misc_get_whoami)))
            /* debug endpoints */
                // GET
                .service(web::resource("/api/v1/debug/user").route(web::get().to(debug_get_user)))
    })
    .bind_openssl(format!("{}:443", env::var("HOSTNAME").unwrap_or_else(|_| "localhost".to_string())), builder)?
    .bind((env::var("HOSTNAME").unwrap_or_else(|_| "localhost".to_string()), 80))?
    .workers(2)
    .run()
    .await
}