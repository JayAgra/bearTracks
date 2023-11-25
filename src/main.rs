use std::{io, collections::HashMap, pin::Pin, sync::RwLock};
use actix_web::{error, middleware, web, App, Error as AWError, HttpRequest, HttpResponse, HttpServer, cookie::Key, Responder, FromRequest, dev::Payload};
use actix_session::{SessionMiddleware, storage::CookieSessionStore};
use actix_identity::{CookieIdentityPolicy, Identity, IdentityService};
use serde::{Serialize, Deserialize};
use r2d2_sqlite::{self, SqliteConnectionManager};
use actix_governor::{Governor, GovernorConfigBuilder};
use actix_files;

mod analyze;
mod auth;
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
    Ok(HttpResponse::Ok().json(db_main::get_ids(&db.main, user).await?))
}

async fn manage_delete_submission(db: web::Data<Databases>, user: db_auth::User, path: web::Path<String>) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().body(db_main::delete_by_id(&db.main, user, path).await?))
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

async fn debug_get_user(user: db_auth::User) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(user))
}

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

    log::info!("starting bearTracks on port 8000");

    HttpServer::new(move || {
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
                // GET folders
                .service(actix_files::Files::new("/assets", "./static/assets"))
                .service(actix_files::Files::new("/css", "./static/css"))
                .service(actix_files::Files::new("/js", "./static/js"))
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
                // DELETE
                .service(web::resource("/api/v1/manage/delete/{id}").route(web::delete().to(manage_delete_submission)))
            /* user endpoints */
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
    .bind(("127.0.0.1", 8000))?
    .workers(2)
    .run()
    .await
}