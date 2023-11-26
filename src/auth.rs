use std::sync::RwLock;
use actix_http::StatusCode;
use actix_web::{web, Responder, HttpResponse};
use actix_identity::Identity;
use serde::{Serialize, Deserialize};
use argon2::{
    password_hash::{
        PasswordHash,
        PasswordVerifier,
    },
    Argon2
};
use html_escape;

use crate::db_auth;
use crate::static_files;

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

pub async fn create_account(pool: &db_auth::Pool, create_form: web::Json<CreateForm>) -> impl Responder {
    // check password length is between 8 and 36, inclusive
    if create_form.password.len() >= 8 && create_form.password.len() <= 32 {
        // check if username is taken
        let target_user_temp: Result<db_auth::User, actix_web::Error> = db_auth::get_user_username(pool, html_escape::encode_text(&create_form.username).to_string()).await;
        if target_user_temp.is_ok() || create_form.username != html_escape::encode_text(&create_form.username).to_string() {
            return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).body("{\"status\": \"username_taken\"}");
        } else {
            // check access key validity
            let access_key_temp: Result<Vec<db_auth::AccessKey>, actix_web::Error> = db_auth::get_access_key(pool, create_form.access.clone(), db_auth::AccessKeyQuery::ById).await;
            if !access_key_temp.is_ok() {
                return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).body("{\"status\": \"bad_access_key\"}");
            } else {
                // insert into database
                let access_key: db_auth::AccessKey = access_key_temp.unwrap().first().unwrap().clone();
                let user_temp: Result<db_auth::User, actix_web::Error> = db_auth::create_user(pool, access_key.team, html_escape::encode_text(&create_form.full_name).to_string(), html_escape::encode_text(&create_form.username).to_string(), html_escape::encode_text(&create_form.password).to_string()).await;
                if !user_temp.is_ok() {
                    return HttpResponse::BadRequest().status(StatusCode::from_u16(500).unwrap()).body("{\"status\": \"creation_error\"}");
                } else {
                    // yes. this solution is shit. give me a better one
                    return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).body("{\"status\": \"success\"}");
                }
            }
        }
    } else {
        return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).body("{\"status\": \"password_length\"}");
    }
}

pub async fn login(pool: &db_auth::Pool, session: web::Data<RwLock<crate::Sessions>>, identity: Identity, login_form: web::Json<LoginForm>) -> impl Responder {
    let target_user_temp: Result<db_auth::User, actix_web::Error> = db_auth::get_user_username(pool, login_form.username.clone()).await;
    if !target_user_temp.is_ok() {
        return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).body("{\"status\": \"bad\"}");
    }
    let target_user = target_user_temp.unwrap();
    if target_user.id != 0 {
        // if target_user.pass_hash == login_form.password {
        let parsed_hash = PasswordHash::new(&target_user.pass_hash);
        if parsed_hash.is_err() {
            return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).body("{\"status\": \"bad\"}");
        }
        if Argon2::default().verify_password(login_form.password.as_bytes(), &parsed_hash.unwrap()).is_ok() {
            identity.remember(login_form.username.clone());
            session.write().unwrap().user_map.insert(target_user.clone().username.to_string(), target_user.clone());
            if target_user.admin == "true" {
                return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).body("{\"status\": \"success_adm\"}");
            }
            if target_user.team_admin != 0 {
                return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).body("{\"status\": \"success_ctl\"}");
            }
            return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).body("{\"status\": \"success\"}");
        } else {
            return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).body("{\"status\": \"bad\"}");
        }
    } else {
        return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).body("{\"status\": \"bad\"}");
    }
}

pub async fn logout(session: web::Data<RwLock<crate::Sessions>>, identity: Identity) -> HttpResponse {
    if let Some(id) = identity.identity() {
        identity.forget();
        if let Some(user) = session.write().unwrap().user_map.remove(&id) {
            log::info!("user {} logged out", user.username);
        }
    }
    
    static_files::static_login().await
}