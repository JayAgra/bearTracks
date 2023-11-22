use std::sync::RwLock;
use actix_http::StatusCode;
use actix_web::{web, Responder, HttpResponse};
use actix_identity::Identity;
use serde::{Serialize, Deserialize};
use cookie::Cookie;

use crate::db_auth;

#[derive(Serialize, Deserialize, Clone)]
pub struct LoginForm {
    username: String,
    password: String
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CreateForm {
    access: String,
    full_name: String,
    username: String,
    password: String
}

pub async fn login(pool: &db_auth::Pool, session: web::Data<RwLock<crate::Sessions>>, identity: Identity, login_form: web::Form<LoginForm>) -> impl Responder {
    let target_user_temp: Result<db_auth::User, actix_web::Error> = db_auth::get_user_username(pool, login_form.username.clone()).await;
    if !target_user_temp.is_ok() {
        return HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("no");
    }
    let target_user = target_user_temp.unwrap();
    if target_user.id != 0 {
        // TODO password hashing!!!
        if target_user.pass_hash == login_form.password {
            identity.remember(login_form.username.clone());
            let new_key: db_auth::Key = db_auth::create_key(pool, target_user.clone()).await.unwrap();
            session.write().unwrap().key_map.insert(new_key.clone().username, new_key.clone());
            session.write().unwrap().user_map.insert(target_user.clone().username.to_string(), target_user.clone());
            let key_cookie = Cookie::build("key", new_key.key)
                                                .secure(false)
                                                .http_only(false)
                                                .max_age(cookie::time::Duration::seconds(86_400))
                                                .finish();
            if target_user.admin == "true" {
                let admin_cookie = Cookie::build("lead", "true")
                                                    .secure(false)
                                                    .http_only(false)
                                                    .max_age(cookie::time::Duration::seconds(86_400))
                                                    .finish();
                return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).cookie(key_cookie).cookie(admin_cookie).body("success");
            }
            if target_user.team_admin != 0 {
                let child_admin_cookie = Cookie::build("childTeamLead", "true")
                                                    .secure(false)
                                                    .http_only(false)
                                                    .max_age(cookie::time::Duration::seconds(86_400))
                                                    .finish();
                return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).cookie(key_cookie).cookie(child_admin_cookie).body("success");
            }
            return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).cookie(key_cookie).body("success");
        } else {
            return HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("no");
        }
    } else {
        return HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("no");
    }
}

pub async fn logout(session: web::Data<RwLock<crate::Sessions>>, identity: Identity) -> impl Responder {
    if let Some(id) = identity.identity() {
        identity.forget();
        if let Some(user) = session.write().unwrap().user_map.remove(&id) {
            log::info!("user {} logged out", user.username);
        }
        if let Some(key) = session.write().unwrap().key_map.remove(&id) {
            log::info!("user {} logged out", key.username);
        }
    }
    HttpResponse::Unauthorized().finish()
}