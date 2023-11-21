use std::io;

use actix_web::{middleware, web, App, Error as AWError, HttpRequest, HttpResponse, HttpServer, cookie::Key, web::JsonConfig, web::get, web::post};
use actix_session::{SessionMiddleware, storage::CookieSessionStore, Session};
use r2d2_sqlite::{self, SqliteConnectionManager};
use actix_files;

mod db_main;
mod db_auth;
mod db_transact;
mod static_files;

struct Databases {
    main: db_main::Pool,
    auth: db_main::Pool,
    transact: db_transact::Pool
}

fn get_secret_key() -> Key {
    Key::generate()
}

async fn data_get_detailed(path: web::Path<String>, db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute(&db.main, db_main::MainData::GetDataDetailed, path).await?))
}

async fn data_get_exists(path: web::Path<String>, db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute(&db.main, db_main::MainData::DataExists, path).await?))
}

async fn data_get_main_brief_team(req: HttpRequest, db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute_get_brief(&db.main, db_main::MainBrief::BriefTeam, [req.match_info().get("season").unwrap().parse().unwrap(), req.match_info().get("event").unwrap().parse().unwrap(), req.match_info().get("team").unwrap().parse().unwrap()]).await?))
}

async fn data_get_main_brief_match(req: HttpRequest, db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute_get_brief(&db.main, db_main::MainBrief::BriefMatch, [req.match_info().get("season").unwrap().parse().unwrap(), req.match_info().get("event").unwrap().parse().unwrap(), req.match_info().get("match_num").unwrap().parse().unwrap()]).await?))
}

async fn data_get_main_brief_event(req: HttpRequest, db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute_get_brief(&db.main, db_main::MainBrief::BriefEvent, [req.match_info().get("season").unwrap().parse().unwrap(), req.match_info().get("event").unwrap().parse().unwrap(), "".to_string()]).await?))
}

async fn data_get_main_brief_user(req: HttpRequest, db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute_get_brief(&db.main, db_main::MainBrief::BriefUser, [req.match_info().get("season").unwrap().parse().unwrap(), req.match_info().get("user_id").unwrap().parse().unwrap(), "".to_string()]).await?))
}

async fn data_post_submit(data: web::Json<db_main::MainInsert>, db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_main::execute_insert(&db.main, data).await?))
}

async fn misc_transact_get_me(db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_transact::execute(&db.transact, db_transact::TransactData::GetUserTransactions).await?))
}

async fn points_get_all(db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    Ok(HttpResponse::Ok().json(db_auth::execute_scores(&db.auth, db_auth::AuthData::GetUserScores).await?))
}

#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let main_db_manager = SqliteConnectionManager::file("data.db");
    let main_db_pool = db_main::Pool::new(main_db_manager).unwrap();

    let auth_db_manager = SqliteConnectionManager::file("data_auth.db");
    let auth_db_pool = db_main::Pool::new(auth_db_manager).unwrap();

    let trans_db_manager = SqliteConnectionManager::file("data_transact.db");
    let trans_db_pool = db_main::Pool::new(trans_db_manager).unwrap();

    let secret_key = get_secret_key();

    log::info!("starting bearTracks on port 8000");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(Databases {main: main_db_pool.clone(), auth: auth_db_pool.clone(), transact: trans_db_pool.clone() }))
            .wrap(middleware::Logger::default())
            .wrap(SessionMiddleware::new(CookieSessionStore::default(), secret_key.clone()))
            /* src  endpoints */
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
                .service(actix_files::Files::new("/assets", "./static/assets"))
                .service(actix_files::Files::new("/css", "./static/css"))
                .service(actix_files::Files::new("/js", "./static/js"))
            /* auth endpoints */
            /* data endpoints */
                // POST (✅)
                .service(web::resource("/api/v1/data/submit").route(web::post().to(data_post_submit)))
                // GET (✅)
                .service(web::resource("/api/v1/data/detail/{id}").route(web::get().to(data_get_detailed)))
                .service(web::resource("/api/v1/data/exists/{id}").route(web::get().to(data_get_exists)))
                .service(web::resource("/api/v1/data/brief/team/{season}/{event}/{team}").route(web::get().to(data_get_main_brief_team)))
                .service(web::resource("/api/v1/data/brief/match/{season}/{event}/{match_num}").route(web::get().to(data_get_main_brief_match)))
                .service(web::resource("/api/v1/data/brief/event/{season}/{event}").route(web::get().to(data_get_main_brief_event)))
                .service(web::resource("/api/v1/data/brief/user/{season}/{user_id}").route(web::get().to(data_get_main_brief_user)))
            /* user endpoints */
            /* points endpoints */
                .service(web::resource("/api/v1/points/all").route(web::get().to(points_get_all)))
            /* misc endpoints */
                .service(web::resource("/api/v1/transact/me").route(web::get().to(misc_transact_get_me)))
    })
    .bind(("127.0.0.1", 8000))?
    .workers(2)
    .run()
    .await
}