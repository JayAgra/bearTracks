use std::{env, include_str, include_bytes};
use actix_web::{HttpRequest, HttpResponse, http::header::{ContentType, CacheControl, CacheDirective}};

// bundle static files in binary
const INDEX_HTML: &str = include_str!("../static/index.html");
const BLACKJACK_HTML: &str = include_str!("../static/blackjack.html");
const CHARTS_HTML: &str = include_str!("../static/charts.html");
const CREATE_HTML: &str = include_str!("../static/create.html");
const LOGIN_HTML: &str = include_str!("../static/login.html");
const MANAGE_HTML: &str = include_str!("../static/manage.html");
const MANAGE_SCOUTS_HTML: &str = include_str!("../static/manageScouts.html");
const MANAGE_TEAM_HTML: &str = include_str!("../static/manageTeam.html");
const MANAGE_TEAMS_HTML: &str = include_str!("../static/manageTeams.html");
const POINT_RECORDS_HTML: &str = include_str!("../static/pointRecords.html");
const PASSKEY_HTML: &str = include_str!("../static/passkey.html");
const POINTS_HTML: &str = include_str!("../static/points.html");
const SCOUTS_HTML: &str = include_str!("../static/scouts.html");
const SETTINGS_HTML: &str = include_str!("../static/settings.html");
const SPIN_HTML: &str = include_str!("../static/spin.html");
const TEAMS_HTML: &str = include_str!("../static/teams.html");
// favicon isn't utf8 so it needs include bytes instead
const FAVICON_ICO: &[u8] = include_bytes!("../static/favicon.ico");

pub async fn static_index(req: HttpRequest) -> HttpResponse {
    // redirect requests not to port 443 (port 80) to 443
    match req.app_config().local_addr().port() {
        443 => {
            HttpResponse::Ok()
                .content_type(ContentType::html())
                .insert_header(CacheControl(vec![
                    CacheDirective::Public,
                    CacheDirective::MaxAge(23328000u32),
                ]))
                .body(INDEX_HTML)
        }
        _ => HttpResponse::PermanentRedirect()
                .append_header(
                    ("location", format!("https://{}", env::var("HOSTNAME").unwrap_or_else(|_| "localhost".to_string())))
                ).finish(),
    }
}

// serve static html files
pub async fn static_blackjack() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(BLACKJACK_HTML)
}

pub async fn static_charts() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(CHARTS_HTML)
}

pub async fn static_create() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(CREATE_HTML)
}

pub async fn static_login() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(LOGIN_HTML)
}

pub async fn static_manage() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(MANAGE_HTML)
}

pub async fn static_manage_scouts() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(MANAGE_SCOUTS_HTML)
}

pub async fn static_manage_team() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(MANAGE_TEAM_HTML)
}

pub async fn static_manage_teams() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(MANAGE_TEAMS_HTML)
}

pub async fn static_passkey() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(PASSKEY_HTML)
}

pub async fn static_point_records() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(POINT_RECORDS_HTML)
}

pub async fn static_points() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(POINTS_HTML)
}

pub async fn static_scouts() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(SCOUTS_HTML)
}

pub async fn static_settings() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(SETTINGS_HTML)
}

pub async fn static_spin() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(SPIN_HTML)
}

pub async fn static_teams() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(TEAMS_HTML)
}

// serve static favicon
pub async fn static_favicon() -> HttpResponse {
    HttpResponse::Ok()
        .append_header(("Content-Type", "image/x-icon"))
        .insert_header(CacheControl(vec![CacheDirective::Public, CacheDirective::MaxAge(4838400u32)]))
        .body(FAVICON_ICO)
}