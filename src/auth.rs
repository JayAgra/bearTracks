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
use regex::Regex;
use html_escape;

use crate::db_auth;
use crate::static_files;

#[derive(Serialize, Deserialize, Clone, Debug)]
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
    // check password length is between 8 and 32, inclusive
    if create_form.password.len() >= 8 && create_form.password.len() <= 32 {
        // check if user is a sketchy motherfucker
        let regex = Regex::new(r"^[a-z0-9A-Z_-_ _*_^]{3,32}$").unwrap();
        if  !regex.is_match(&create_form.username) ||
            !regex.is_match(&create_form.password) ||
            !regex.is_match(&create_form.full_name)
            {
            return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"you_sketchy_motherfucker\"}");
        }
        // check if username is taken
        let target_user_temp: Result<db_auth::User, actix_web::Error> = db_auth::get_user_username(pool, create_form.username.clone()).await;
        if target_user_temp.is_ok() {
            return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"username_taken\"}");
        } else {
            drop(target_user_temp);
            // check access key validity
            if create_form.access != "00000" {
                let access_key_temp: Result<Vec<db_auth::AccessKey>, actix_web::Error> = db_auth::get_access_key(pool, create_form.access.clone(), db_auth::AccessKeyQuery::ById).await;
                if access_key_temp.is_err() {
                    return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"bad_access_key\"}");
                } else {
                    // insert into database
                    let access_key: db_auth::AccessKey = access_key_temp.unwrap().first().unwrap().clone();
                    let user_temp: Result<db_auth::User, actix_web::Error> = db_auth::create_user(pool, access_key.team, html_escape::encode_text(&create_form.full_name).to_string(), html_escape::encode_text(&create_form.username).to_string(), html_escape::encode_text(&create_form.password).to_string()).await;
                    // send final success/failure for creation
                    if user_temp.is_err() {
                        return HttpResponse::BadRequest().status(StatusCode::from_u16(500).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"creation_error\"}");
                    } else {
                        drop(user_temp);
                        return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"success\"}");
                    }
                }
            } else {
                let user_temp: Result<db_auth::User, actix_web::Error> = db_auth::create_user(pool, 0, html_escape::encode_text(&create_form.full_name).to_string(), html_escape::encode_text(&create_form.username).to_string(), html_escape::encode_text(&create_form.password).to_string()).await;
                if user_temp.is_err() {
                    return HttpResponse::BadRequest().status(StatusCode::from_u16(500).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"creation_error\"}");
                } else {
                    drop(user_temp);
                    return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"success\"}");
                }
            }
        }
    } else {
        return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"password_length\"}");
    }
}

pub async fn login(pool: &db_auth::Pool, session: web::Data<RwLock<crate::Sessions>>, identity: Identity, login_form: web::Json<LoginForm>) -> impl Responder {
    // try to get target user from database
    let target_user_temp: Result<db_auth::User, actix_web::Error> = db_auth::get_user_username(pool, login_form.username.clone()).await;
    if target_user_temp.is_err() {
        // query error, send failure response
        return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"bad\"}");
    }
    // query was OK, unwrap and set to target_user
    let target_user = target_user_temp.unwrap();
    
    // ensure the target user id exists
    if target_user.id != 0 {
        // parse the hash of the user from the database
        let parsed_hash = PasswordHash::new(&target_user.pass_hash);
        // if error in parsing hash, send failure response
        if parsed_hash.is_err() {
            // could not parse hash, send failure
            return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"bad\"}");
        }
        // check that the provided password's hash is equal to the correct password's hash
        if Argon2::default().verify_password(login_form.password.as_bytes(), &parsed_hash.unwrap()).is_ok() {
            // save the username to the identity
            identity.remember(login_form.username.clone());
            // write the user object to the session
            session.write().unwrap().user_map.insert(target_user.clone().username.to_string(), target_user.clone());
            // if admin, send admin success response
            if target_user.admin == "true" {
                // user is admin, send admin response for client cookie
                return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"success_adm\"}");
            }
            // if team admin, send team admin success response
            if target_user.team_admin != 0 {
                // user is a team admin, send team admin response
                return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"success_ctl\"}");
            }
            // send generic success response
            return HttpResponse::Ok().status(StatusCode::from_u16(200).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"success\"}");
        // bad password, send failure
        } else {
            // bad password, send 400
            return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"bad\"}");
        }
    // target user is zero, send failure
    } else {
        // target user id is zero, send 400
        return HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"bad\"}");
    }
}

pub async fn delete_account(pool: &db_auth::Pool, login_form: web::Json<LoginForm>) -> Result<HttpResponse, actix_web::Error> {
    let target_user_temp: Result<db_auth::User, actix_web::Error> = db_auth::get_user_username(pool, login_form.username.clone()).await;
    if target_user_temp.is_err() {
        return Ok(HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"bad\"}"))
    }
    let target_user = target_user_temp.unwrap();
        if target_user.id != 0 {
        let parsed_hash = PasswordHash::new(&target_user.pass_hash);
        if parsed_hash.is_err() {
            return Ok(HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"bad\"}"))
        }
        if Argon2::default().verify_password(login_form.password.as_bytes(), &parsed_hash.unwrap()).is_ok() {
            Ok(HttpResponse::Ok()
                .json(
                    db_auth::execute_manage_user(&pool, db_auth::UserManageAction::DeleteUser, [target_user.id.to_string(), "".to_string()]).await?
                ))
        } else {
            Ok(HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"bad\"}"))
        }
    } else {
        Ok(HttpResponse::BadRequest().status(StatusCode::from_u16(400).unwrap()).insert_header(("Cache-Control", "no-cache")).body("{\"status\": \"bad\"}"))
    }
}

pub async fn logout(session: web::Data<RwLock<crate::Sessions>>, identity: Identity) -> HttpResponse {
    // if session exists, proceed
    if let Some(id) = identity.identity() {
        // forget identity
        identity.forget();
        // remove user object from the user hashmap
        if let Some(_user) = session.write().unwrap().user_map.remove(&id) {
            // log::info!("user {} logged out", user.username);
        }
    }
    
    // send user to login page
    static_files::static_login().await
}