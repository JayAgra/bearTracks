use actix_web::{web, HttpRequest, HttpResponse};
use std::path::PathBuf;

pub async fn forward_frc_api_event_teams(
    _req: HttpRequest,
    path: web::Path<(String, String)>,
) -> HttpResponse {
    let (season, event) = path.into_inner();
    let path: PathBuf = PathBuf::from(format!("cache/frc_api/{}/{}/teams.json", season, event));
    if let Ok(content) = std::fs::read_to_string(&path) {
        HttpResponse::Ok()
            .insert_header(("Cache-Control", "public, max-age=93312000, immutable")) // 30 days
            .content_type("application/json")
            .body(content)
    } else {
        HttpResponse::NotFound().finish()
    }
}

pub async fn forward_frc_api_event_matches(
    _req: HttpRequest,
    path: web::Path<(String, String)>,
) -> HttpResponse {
    let (season, event) = path.into_inner();
    let path: PathBuf = PathBuf::from(format!("cache/frc_api/{}/{}/matches.json", season, event));
    if let Ok(content) = std::fs::read_to_string(&path) {
        HttpResponse::Ok()
            .insert_header(("Cache-Control", "public, max-age=93312000, immutable")) // 30 days
            .content_type("application/json")
            .body(content)
    } else {
        HttpResponse::NotFound().finish()
    }
}
