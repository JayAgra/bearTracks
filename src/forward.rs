use std::path::PathBuf;
use actix_files::NamedFile;
use actix_web::{web, HttpRequest, HttpResponse};

// [deprecated]
pub async fn forward_frc_api_event_teams(req: HttpRequest, path: web::Path<(String, String)>) -> HttpResponse {
    let (season, event) = path.into_inner();
    let path: PathBuf = PathBuf::from(format!("cache/frc_api/{}/{}/teams.json", season, event));
    let file = NamedFile::open(path);
    if file.is_ok() {
        file.unwrap().into_response(&req)
    } else {
        HttpResponse::NotFound()
            .finish()
    }
}

pub async fn forward_frc_api_event_matches(req: HttpRequest, path: web::Path<(String, String)>) -> HttpResponse {
    let (season, event) = path.into_inner();
    let path: PathBuf = PathBuf::from(format!("cache/frc_api/{}/{}/matches.json", season, event));
    let file = NamedFile::open(path);
    if file.is_ok() {
        file.unwrap().into_response(&req)
    } else {
        HttpResponse::NotFound()
            .finish()
    }
}