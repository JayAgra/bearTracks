use std::io;

use actix_web::{middleware, web, App, Error as AWError, HttpResponse, HttpServer};
use actix_files;
use r2d2_sqlite::{self, SqliteConnectionManager};

mod db_main;
mod db_transact;
mod static_files;

struct Databases {
    main: db_main::Pool,
    auth: db_main::Pool,
    transact: db_transact::Pool
}

async fn data_get_detailed(db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    let result = vec![
        db_main::execute(&db.main, db_main::MainData::GetDataDetailed).await?,
    ];
    Ok(HttpResponse::Ok().json(result))
}

async fn data_get_main_brief_team(db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    let result = vec![
        db_main::execute_get_brief(&db.main, db_main::MainBrief::BriefTeam).await?,
    ];
    Ok(HttpResponse::Ok().json(result))
}

async fn data_get_main_brief_match(db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    let result = vec![
        db_main::execute_get_brief(&db.main, db_main::MainBrief::BriefMatch).await?,
    ];
    Ok(HttpResponse::Ok().json(result))
}

async fn data_get_main_brief_event(db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    let result = vec![
        db_main::execute_get_brief(&db.main, db_main::MainBrief::BriefEvent).await?,
    ];
    Ok(HttpResponse::Ok().json(result))
}

async fn misc_transact_get_me(db: web::Data<Databases>) -> Result<HttpResponse, AWError> {
    let result = vec![
        db_transact::execute(&db.transact, db_transact::TransactData::GetUserTransactions).await?,
    ];
    Ok(HttpResponse::Ok().json(result))
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

    log::info!("starting bearTracks on port 8000");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(Databases {main: main_db_pool.clone(), auth: auth_db_pool.clone(), transact: trans_db_pool.clone() }))
            .wrap(middleware::Logger::default())
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
                .service(web::resource("/api/v1/data/detail").route(web::get().to(data_get_detailed)))
                .service(web::resource("/api/v1/data/brief/team").route(web::get().to(data_get_main_brief_team)))
                .service(web::resource("/api/v1/data/brief/match").route(web::get().to(data_get_main_brief_match)))
                .service(web::resource("/api/v1/data/brief/event").route(web::get().to(data_get_main_brief_event)))
            /* user endpoints */
            /* misc endpoints */
                .service(web::resource("/api/v1/transact/me").route(web::get().to(misc_transact_get_me)))
    })
    .bind(("127.0.0.1", 8000))?
    .workers(2)
    .run()
    .await
}