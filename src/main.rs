use std::io;

use actix_web::{middleware, web, App, Error as AWError, HttpResponse, HttpServer};
use r2d2_sqlite::{self, SqliteConnectionManager};

mod db_main;
mod db_transact;

async fn data_get_detailed(db: web::Data<db_main::Pool>) -> Result<HttpResponse, AWError> {
    let result = vec![
        db_main::execute(&db, db_main::MainData::GetDataDetailed).await?,
    ];
    Ok(HttpResponse::Ok().json(result))
}

async fn data_get_main_brief_team(db: web::Data<db_main::Pool>) -> Result<HttpResponse, AWError> {
    let result = vec![
        db_main::execute_get_brief(&db, db_main::MainBrief::BriefTeam).await?,
    ];
    Ok(HttpResponse::Ok().json(result))
}

async fn data_get_main_brief_match(db: web::Data<db_main::Pool>) -> Result<HttpResponse, AWError> {
    let result = vec![
        db_main::execute_get_brief(&db, db_main::MainBrief::BriefMatch).await?,
    ];
    Ok(HttpResponse::Ok().json(result))
}

async fn data_get_main_brief_event(db: web::Data<db_main::Pool>) -> Result<HttpResponse, AWError> {
    let result = vec![
        db_main::execute_get_brief(&db, db_main::MainBrief::BriefEvent).await?,
    ];
    Ok(HttpResponse::Ok().json(result))
}

async fn misc_transact_get_me(db: web::Data<db_transact::Pool>) -> Result<HttpResponse, AWError> {
    let result = vec![
        db_transact::execute(&db, db_transact::TransactData::GetUserTransactions).await?,
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
    let trans_db_pool = db_transact::Pool::new(trans_db_manager).unwrap();

    log::info!("starting bearTracks on port 8000");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(main_db_pool.clone()))
            .app_data(web::Data::new(auth_db_pool.clone()))
            .app_data(web::Data::new(trans_db_pool.clone()))
            .wrap(middleware::Logger::default())
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