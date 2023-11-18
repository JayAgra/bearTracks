use std::io;

use actix_web::{middleware, web, App, Error as AWError, HttpResponse, HttpServer};
use r2d2_sqlite::{self, SqliteConnectionManager};

mod main_db;

async fn get_detailed(db: web::Data<main_db::Pool>) -> Result<HttpResponse, AWError> {
    let result = vec![
        main_db::execute(&db, main_db::MainData::GetDataDetailed).await?,
    ];
    Ok(HttpResponse::Ok().json(result))
}

async fn get_main_brief_team(db: web::Data<main_db::Pool>) -> Result<HttpResponse, AWError> {
    let result = vec![
        main_db::execute_get_brief(&db, main_db::MainBrief::BriefTeam).await?,
    ];
    Ok(HttpResponse::Ok().json(result))
}

async fn get_main_brief_match(db: web::Data<main_db::Pool>) -> Result<HttpResponse, AWError> {
    let result = vec![
        main_db::execute_get_brief(&db, main_db::MainBrief::BriefMatch).await?,
    ];
    Ok(HttpResponse::Ok().json(result))
}

async fn get_main_brief_event(db: web::Data<main_db::Pool>) -> Result<HttpResponse, AWError> {
    let result = vec![
        main_db::execute_get_brief(&db, main_db::MainBrief::BriefEvent).await?,
    ];
    Ok(HttpResponse::Ok().json(result))
}

#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let main_db_manager = SqliteConnectionManager::file("data.db");
    let main_db_pool = main_db::Pool::new(main_db_manager).unwrap();

    log::info!("starting bearTracks on port 8000");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(main_db_pool.clone()))
            .wrap(middleware::Logger::default())
            /* endpoints */
            .service(web::resource("/api/v1/data/detail").route(web::get().to(get_detailed)))
            .service(web::resource("/api/v1/data/brief/team").route(web::get().to(get_main_brief_team)))
            .service(web::resource("/api/v1/data/brief/match").route(web::get().to(get_main_brief_match)))
            .service(web::resource("/api/v1/data/brief/event").route(web::get().to(get_main_brief_event)))
            /* end endpoints */
    })
    .bind(("127.0.0.1", 8000))?
    .workers(2)
    .run()
    .await
}