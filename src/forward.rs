use std::env;
use actix_web::{web, HttpRequest, HttpResponse};
use reqwest::Client;

// [deprecated]
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
                .insert_header(("Cache-Control", "public, max-age=604800, immutable"))
                .body(response.bytes().await.unwrap().to_vec())
        }
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

pub async fn forward_frc_api_event_matches(req: HttpRequest, path: web::Path<(String, String, String, String)>) -> HttpResponse {
    // generate request url
    let (season, event, level, all) = path.into_inner();
    let mut url_param: String = "&start=&end=".to_string();
    if all != "all" {
        url_param = format!("&teamNumber={}", env::var("MY_TEAM").unwrap_or_else(|_| "766".to_string()))
    }
    let target_url: String = format!("https://frc-api.firstinspires.org/v3.0/{}/schedule/{}?tournamentLevel={}{}", season, event, level, url_param);
    // create client and get response
    let client: Client = Client::new();
    let response: Result<reqwest::Response, reqwest::Error> = client
                    .request(req.method().clone(), target_url)
                    .header("Authorization", format!("Basic {}", env::var("FRC_API_KEY").unwrap_or_else(|_| "NONE".to_string())))
                    .send()
                    .await;
    // if ok, send. else, send a bad gateway error
    match response {
        Ok(response) => {
            HttpResponse::build(response.status())
                .insert_header(("Cache-Control", "public, max-age=604800, immutable"))
                .body(response.bytes().await.unwrap().to_vec())
        }
        Err(_) => HttpResponse::BadGateway().finish(),
    }
}