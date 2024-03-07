use actix_web::{
    http::header::{CacheControl, CacheDirective, ContentType},
    HttpRequest, HttpResponse,
};
use std::{env, include_bytes, include_str};

// bundle static files in binary
const INDEX_HTML: &str = include_str!("../static/index.html");
const BLACKJACK_HTML: &str = include_str!("../static/blackjack.html");
const CREATE_HTML: &str = include_str!("../static/create.html");
const MAIN_HTML: &str = include_str!("../static/main.html");
const LOGIN_HTML: &str = include_str!("../static/login.html");
const POINT_RECORDS_HTML: &str = include_str!("../static/pointRecords.html");
const PASSKEY_HTML: &str = include_str!("../static/passkey.html");
const POINTS_HTML: &str = include_str!("../static/points.html");
const SAFARI_PINNED_SVG: &str = include_str!("../static/safari-pinned-tab.svg");
const SCOUTS_HTML: &str = include_str!("../static/scouts.html");
const SETTINGS_HTML: &str = include_str!("../static/settings.html");
const SITE_WEBMANIFEST: &str = include_str!("../static/site.webmanifest");
const SPIN_HTML: &str = include_str!("../static/spin.html");
// favicon isn't utf8 so it needs include bytes instead
const ANDROID_CHROME_192: &[u8] = include_bytes!("../static/android-chrome-192x192.png");
const ANDROID_CHROME_512: &[u8] = include_bytes!("../static/android-chrome-512x512.png");
const APPLE_TOUCH_ICON: &[u8] = include_bytes!("../static/apple-touch-icon.png");
const FAVICON_16: &[u8] = include_bytes!("../static/favicon-16x16.png");
const FAVICON_32: &[u8] = include_bytes!("../static/favicon-32x32.png");
const FAVICON_ICO: &[u8] = include_bytes!("../static/favicon.ico");

pub async fn static_index(req: HttpRequest) -> HttpResponse {
    // redirect requests not to port 443 (port 80) to 443
    match req.app_config().local_addr().port() {
        443 => {
            HttpResponse::Ok()
                .content_type(ContentType::html())
                .insert_header(CacheControl(vec![CacheDirective::Public, CacheDirective::MaxAge(23328000u32)]))
                .body(INDEX_HTML)
        }
        _ => {
            HttpResponse::PermanentRedirect()
                .append_header(("location", format!("https://{}", env::var("HOSTNAME").unwrap_or_else(|_| "localhost".to_string()))))
                .finish()
        }
    }
}

// serve static html files
pub async fn static_blackjack() -> HttpResponse {
    HttpResponse::Ok().content_type(ContentType::html()).body(BLACKJACK_HTML)
}

pub async fn static_create() -> HttpResponse {
    HttpResponse::Ok().content_type(ContentType::html()).body(CREATE_HTML)
}

pub async fn static_main() -> HttpResponse {
    HttpResponse::Ok().content_type(ContentType::html()).body(MAIN_HTML)
}

pub async fn static_login() -> HttpResponse {
    HttpResponse::Ok().content_type(ContentType::html()).body(LOGIN_HTML)
}

pub async fn static_passkey() -> HttpResponse {
    HttpResponse::Ok().content_type(ContentType::html()).body(PASSKEY_HTML)
}

pub async fn static_point_records() -> HttpResponse {
    HttpResponse::Ok().content_type(ContentType::html()).body(POINT_RECORDS_HTML)
}

pub async fn static_points() -> HttpResponse {
    HttpResponse::Ok().content_type(ContentType::html()).body(POINTS_HTML)
}

pub async fn static_safari_pinned() -> HttpResponse {
    HttpResponse::Ok().content_type(ContentType::xml()).body(SAFARI_PINNED_SVG)
}

pub async fn static_scouts() -> HttpResponse {
    HttpResponse::Ok().content_type(ContentType::html()).body(SCOUTS_HTML)
}

pub async fn static_settings() -> HttpResponse {
    HttpResponse::Ok().content_type(ContentType::html()).body(SETTINGS_HTML)
}

pub async fn static_webmanifest() -> HttpResponse {
    HttpResponse::Ok().content_type(ContentType::json()).body(SITE_WEBMANIFEST)
}

pub async fn static_spin() -> HttpResponse {
    HttpResponse::Ok().content_type(ContentType::html()).body(SPIN_HTML)
}

// serve static favicons
pub async fn static_android_chrome_192() -> HttpResponse {
    HttpResponse::Ok()
        .append_header(("Content-Type", "image/png"))
        .insert_header(CacheControl(vec![CacheDirective::Public, CacheDirective::MaxAge(4838400u32)]))
        .body(ANDROID_CHROME_192)
}

pub async fn static_android_chrome_512() -> HttpResponse {
    HttpResponse::Ok()
        .append_header(("Content-Type", "image/png"))
        .insert_header(CacheControl(vec![CacheDirective::Public, CacheDirective::MaxAge(4838400u32)]))
        .body(ANDROID_CHROME_512)
}

pub async fn static_apple_touch_icon() -> HttpResponse {
    HttpResponse::Ok()
        .append_header(("Content-Type", "image/png"))
        .insert_header(CacheControl(vec![CacheDirective::Public, CacheDirective::MaxAge(4838400u32)]))
        .body(APPLE_TOUCH_ICON)
}

pub async fn static_favicon_16() -> HttpResponse {
    HttpResponse::Ok()
        .append_header(("Content-Type", "image/png"))
        .insert_header(CacheControl(vec![CacheDirective::Public, CacheDirective::MaxAge(4838400u32)]))
        .body(FAVICON_16)
}

pub async fn static_favicon_32() -> HttpResponse {
    HttpResponse::Ok()
        .append_header(("Content-Type", "image/png"))
        .insert_header(CacheControl(vec![CacheDirective::Public, CacheDirective::MaxAge(4838400u32)]))
        .body(FAVICON_32)
}

pub async fn static_favicon() -> HttpResponse {
    HttpResponse::Ok()
        .append_header(("Content-Type", "image/x-icon"))
        .insert_header(CacheControl(vec![CacheDirective::Public, CacheDirective::MaxAge(4838400u32)]))
        .body(FAVICON_ICO)
}
