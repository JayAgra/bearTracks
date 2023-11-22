use std::sync::RwLock;
use actix_http::StatusCode;
use actix_web::{web, Responder, HttpResponse, http};
use actix_identity::Identity;
use actix_files::NamedFile;
use serde::{Serialize, Deserialize};
use cookie::Cookie;
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

pub async fn create_account(pool: &db_auth::Pool, create_form: web::Form<CreateForm>) -> impl Responder {
    // check password length is between 8 and 36, inclusive
    if create_form.password.len() >= 8 && create_form.password.len() <= 36 {
        // check if username is taken
        let target_user_temp: Result<db_auth::User, actix_web::Error> = db_auth::get_user_username(pool, html_escape::encode_text(&create_form.username).to_string()).await;
        if target_user_temp.is_ok() {
            return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).body("username_taken");
        } else {
            // check access key validity
            let access_key_temp: Result<db_auth::AccessKey, actix_web::Error> = db_auth::get_access_key(pool, create_form.access.clone()).await;
            if !access_key_temp.is_ok() {
                return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).body("bad_access_key");
            } else {
                // insert into database
                let access_key: db_auth::AccessKey = access_key_temp.unwrap();
                let user_temp: Result<db_auth::User, actix_web::Error> = db_auth::create_user(pool, access_key.team, html_escape::encode_text(&create_form.full_name).to_string(), html_escape::encode_text(&create_form.username).to_string(), html_escape::encode_text(&create_form.password).to_string()).await;
                if !user_temp.is_ok() {
                    return HttpResponse::BadRequest().status(StatusCode::from_u16(500).unwrap()).body("creation_error");
                } else {
                    let user: db_auth::User = user_temp.unwrap();
                    return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).body(format!("created___{}", user.username));
                }
            }
        }
    } else {
        return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).body("password_length");
    }
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
            session.write().unwrap().user_map.insert(target_user.clone().username.to_string(), target_user.clone());
            if target_user.admin == "true" {
                let admin_cookie = Cookie::build("lead", "true")
                                                    .secure(false)
                                                    .http_only(false)
                                                    .max_age(cookie::time::Duration::seconds(86_400))
                                                    .finish();
                return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).cookie(admin_cookie).body("success");
            }
            if target_user.team_admin != 0 {
                let child_admin_cookie = Cookie::build("childTeamLead", "true")
                                                    .secure(false)
                                                    .http_only(false)
                                                    .max_age(cookie::time::Duration::seconds(86_400))
                                                    .finish();

                return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).cookie(child_admin_cookie).content_type(http::header::ContentType::html()).body("");
            }
            return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).body("success");
        } else {
            return HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("no");
        }
    } else {
        return HttpResponse::Unauthorized().status(StatusCode::from_u16(401).unwrap()).body("no");
    }
}

pub async fn logout(session: web::Data<RwLock<crate::Sessions>>, identity: Identity) -> Result<NamedFile, std::io::Error> {
    if let Some(id) = identity.identity() {
        identity.forget();
        if let Some(user) = session.write().unwrap().user_map.remove(&id) {
            log::info!("user {} logged out", user.username);
        }
    }
    
    static_files::static_login().await
}