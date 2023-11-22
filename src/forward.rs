use std::env;
use actix_web::{web, HttpRequest, HttpResponse};
use reqwest::Client;

pub async fn forward_frc_api_event_teams(req: HttpRequest, path: web::Path<(String, String)>) -> HttpResponse {
    let (season, event) = path.into_inner();
    let target_url = format!("https://frc-api.firstinspires.org/v3.0/{}/teams?eventCode={}", season, event);
    let client = Client::new();
    let response = client
                    .request(req.method().clone(), target_url)
                    .header("Authorization", format!("Basic {}", env::var("FRC_API_KEY").unwrap_or_else(|_| "NONE".to_string())))
                    .send()
                    .await;
    
    match response {
        Ok(response) => {
            HttpResponse::build(response.status())
                .insert_header(("Cache-Control", "public, max-age=233280000"))
                .body(response.bytes().await.unwrap().to_vec())
        }
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

pub async fn forward_frc_api_event_matches(req: HttpRequest, path: web::Path<(String, String, String, String)>) -> HttpResponse {
    let (season, event, level, all) = path.into_inner();
    let mut url_param = "&start=&end=".to_string();
    if all != "all" {
        url_param = format!("&teamNumber={}", env::var("MY_TEAM").unwrap_or_else(|_| "766".to_string()))
    }
    let target_url = format!("https://frc-api.firstinspires.org/v3.0/{}/schedule/{}?tournamentLevel={}{}", season, event, level, url_param);
    let client = Client::new();
    let response = client
                    .request(req.method().clone(), target_url)
                    .header("Authorization", format!("Basic {}", env::var("FRC_API_KEY").unwrap_or_else(|_| "NONE".to_string())))
                    .send()
                    .await;
    
    match response {
        Ok(response) => {
            HttpResponse::build(response.status())
                .insert_header(("Cache-Control", "public, max-age=233280000"))
                .body(response.bytes().await.unwrap().to_vec())
        }
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}