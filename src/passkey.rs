use actix_identity::Identity;
use actix_session::{Session, SessionGetError, SessionInsertError};
use actix_web::{web, HttpResponse};
use log::{error, info};
use std::{env, fmt, sync::RwLock};
use webauthn_rs::prelude::*;

use crate::db_auth;

pub fn setup_passkeys() -> web::Data<webauthn_rs::Webauthn> {
    let rp_id = env::var("HOSTNAME").unwrap_or_else(|_| "localhost".to_string());
    let rp_origin = Url::parse(format!("https://{}", &rp_id).as_str()).expect("[PASSKEY] bad url");
    let builder = WebauthnBuilder::new(&rp_id.as_str(), &rp_origin).expect("[PASSKEY] bad config");
    let builder = builder.rp_name("bearTracks");
    let webauthn = web::Data::new(
        builder
            .build()
            .expect("[PASSKEY] bad config (at build step)"),
    );

    webauthn
}

type WebauthnResult<T> = Result<T, Error>;

#[derive(Debug)]
pub enum Error {
    Unknown(WebauthnError),
    SessionGet(SessionGetError),
    SessionInsert(SessionInsertError),
    CorruptSession,
    BadRequest(WebauthnError),
    UserNotFound,
    UserHasNoCredentials,
}

impl From<SessionGetError> for Error {
    fn from(value: SessionGetError) -> Self {
        Self::SessionGet(value)
    }
}

impl From<SessionInsertError> for Error {
    fn from(value: SessionInsertError) -> Self {
        Self::SessionInsert(value)
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Unknown(_) => write!(f, "unknown webauthn error"),
            Error::SessionGet(_) | Error::SessionInsert(_) => write!(f, "bad session"),
            Error::BadRequest(_) => write!(f, "bad request"),
            Error::UserNotFound => write!(f, "bad user"),
            Error::UserHasNoCredentials => write!(f, "no passkey registered"),
            Error::CorruptSession => write!(f, "bad session"),
        }
    }
}

impl actix_web::ResponseError for Error {
    fn status_code(&self) -> actix_http::StatusCode {
        actix_http::StatusCode::INTERNAL_SERVER_ERROR
    }
}

pub async fn webauthn_start_registration(
    auth_pool: &db_auth::Pool,
    user: db_auth::User,
    session: Session,
    webauthn: web::Data<Webauthn>,
) -> WebauthnResult<web::Json<CreationChallengeResponse>> {
    session.remove("reg_state");
    let existing_keys = db_auth::get_passkeys(auth_pool, user.id.to_string()).await;
    if existing_keys.is_err() {
        return Err(Error::UserNotFound);
    }

    let existing_keys = existing_keys.unwrap();
    let existing_keys = existing_keys
        .iter()
        .map(|key| Some(key.cred_id().clone()))
        .collect::<Option<Vec<Base64UrlSafeData>>>();

    let (ccr, reg_state) = webauthn
        .start_passkey_registration(
            Uuid::from_u128(user.id as u128),
            &user.username,
            &user.username,
            existing_keys,
        )
        .map_err(|err| {
            info!("challenge_register_start → {:?}", err);
            Error::Unknown(err)
        })?;

    if let Err(err) = session.insert("reg_state", &reg_state) {
        error!("Failed to save reg_state to session storage!");
        return Err(Error::SessionInsert(err));
    };

    info!("[PASSKEY] registration challenge creation success");
    Ok(web::Json(ccr))
}

pub async fn webauthn_finish_registration(
    auth_pool: &db_auth::Pool,
    user: db_auth::User,
    data: web::Json<RegisterPublicKeyCredential>,
    session: Session,
    webauthn: web::Data<Webauthn>,
) -> WebauthnResult<HttpResponse> {
    let reg_state = match session.get("reg_state")? {
        Some(reg_state) => reg_state,
        None => return Err(Error::CorruptSession),
    };

    session.remove("reg_state");

    let new_passkey = webauthn
        .finish_passkey_registration(&data, &reg_state)
        .map_err(|e| {
            info!("challenge_register_finish → {:?}", e);
            Error::BadRequest(e)
        })?;

    let insert = db_auth::set_passkey(auth_pool, new_passkey, user.id).await;
    if insert.is_err() {
        return Err(Error::Unknown(WebauthnError::CredentialPersistenceError));
    }

    info!("[PASSKEY] register success");
    Ok(HttpResponse::Ok().finish())
}

pub async fn webauthn_start_authentication(
    auth_pool: &db_auth::Pool,
    username: String,
    session: Session,
    webauthn: web::Data<Webauthn>,
) -> WebauthnResult<web::Json<RequestChallengeResponse>> {
    session.remove("auth_state");

    let target_user = db_auth::get_user_username(auth_pool, username.clone()).await;
    if target_user.is_err() {
        return Err(Error::UserNotFound);
    }
    let user_credentials =
        db_auth::get_passkeys(auth_pool, target_user.unwrap().id.to_string()).await;
    if user_credentials.is_err() {
        return Err(Error::UserHasNoCredentials);
    }
    let user_credentials = user_credentials.unwrap();
    if user_credentials.is_empty() {
        return Err(Error::UserHasNoCredentials);
    }

    let (rcr, auth_state) = webauthn
        .start_passkey_authentication(&user_credentials)
        .map_err(|e| {
            info!("challenge_authenticate_start → {:?}", e);
            Error::Unknown(e)
        })?;

    session.insert("auth_state", (username, auth_state))?;

    info!("[PASSKEY] login challenge create success");
    Ok(web::Json(rcr))
}

pub async fn webauthn_finish_authentication(
    auth_pool: &db_auth::Pool,
    cred: web::Json<PublicKeyCredential>,
    session: Session,
    identity: Identity,
    webauthn: web::Data<Webauthn>,
    sessions: web::Data<RwLock<crate::Sessions>>,
) -> WebauthnResult<HttpResponse> {
    let (username, auth_state): (String, PasskeyAuthentication) =
        session.get("auth_state")?.ok_or(Error::CorruptSession)?;
    session.remove("auth_state");

    let _auth_result = webauthn
        .finish_passkey_authentication(&cred, &auth_state)
        .map_err(|e| {
            info!("challenge_authenticate_finish → {:?}", e);
            Error::BadRequest(e)
        })?;

    identity.remember(username.clone());

    let target_user_temp = db_auth::get_user_username(&auth_pool, username.clone()).await;
    if target_user_temp.is_err() {
        return Err(Error::BadRequest(WebauthnError::UserNotPresent));
    }
    let target_user = target_user_temp.unwrap();

    sessions.write().unwrap().user_map.insert(
        target_user.clone().username.to_string(),
        target_user.clone(),
    );

    info!("[PASSKEY] auth success");
    Ok(HttpResponse::Ok().finish())
}
