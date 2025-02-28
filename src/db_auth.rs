use a2::{
    NotificationBuilder,
    NotificationOptions
};
use actix_web::{error, web, Error};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use rusqlite::{params, Statement};
use serde::{Deserialize, Serialize};
use serde_json;
use std::str;
use webauthn_rs::prelude::*;

use crate::db_main;

#[derive(Serialize)]
pub struct UserPoints {
    pub id: i64,
    pub username: String,
    pub team: i64,
    pub score: i64,
}

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;
type PointQueryResult = Result<Vec<UserPoints>, rusqlite::Error>;

pub enum AuthData {
    GetUserScores,
}

pub async fn execute_scores(pool: &Pool, query: AuthData) -> Result<Vec<UserPoints>, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        match query {
            AuthData::GetUserScores => get_user_scores(conn),
        }
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn get_user_scores(conn: Connection) -> PointQueryResult {
    let stmt = conn.prepare("SELECT id, username, team, score FROM users ORDER BY score DESC;")?;
    get_score_rows(stmt)
}

fn get_score_rows(mut statement: Statement) -> PointQueryResult {
    statement
        .query_map([], |row| {
            Ok(UserPoints {
                id: row.get(0)?,
                username: row.get(1)?,
                team: row.get(2)?,
                score: row.get(3)?,
            })
        })
        .and_then(Iterator::collect)
}

#[derive(Serialize, Deserialize, Clone)]
pub struct User {
    pub id: i64,
    pub username: String,
    pub current_challenge: String,
    pub full_name: String,
    pub team: i64,
    pub data: String,
    pub pass_hash: String,
    pub admin: String,
    pub team_admin: i64,
    pub access_ok: String,
    pub score: i64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AccessKey {
    pub id: i64,
    pub key: i64,
    pub team: i64,
}

pub async fn get_user_username(pool: &Pool, username: String) -> Result<User, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || get_user_username_entry(conn, username))
        .await?
        .map_err(error::ErrorInternalServerError)
}

pub async fn get_user_id(pool: &Pool, id: String) -> Result<User, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || get_user_id_entry(conn, id))
        .await?
        .map_err(error::ErrorInternalServerError)
}

fn get_user_id_entry(conn: Connection, id: String) -> Result<User, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT * FROM users WHERE id=?1")?;
    stmt.query_row([id], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            current_challenge: row.get(2)?,
            full_name: row.get(3)?,
            team: row.get(4)?,
            data: row.get(5)?,
            pass_hash: row.get(6)?,
            admin: row.get(7)?,
            team_admin: row.get(8)?,
            access_ok: row.get(9)?,
            score: row.get(10)?,
        })
    })
}

fn get_user_username_entry(conn: Connection, username: String) -> Result<User, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT * FROM users WHERE username=?1")?;
    stmt.query_row([username], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            current_challenge: row.get(2)?,
            full_name: row.get(3)?,
            team: row.get(4)?,
            data: row.get(5)?,
            pass_hash: row.get(6)?,
            admin: row.get(7)?,
            team_admin: row.get(8)?,
            access_ok: row.get(9)?,
            score: row.get(10)?,
        })
    })
}

pub enum AccessKeyQuery {
    ById,
    AllKeys,
}

pub async fn get_access_key(pool: &Pool, key: String, query: AccessKeyQuery) -> Result<Vec<AccessKey>, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        match query {
            AccessKeyQuery::ById => get_access_key_entry(conn, key),
            AccessKeyQuery::AllKeys => get_access_key_all(conn),
        }
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn get_access_key_entry(conn: Connection, key: String) -> Result<Vec<AccessKey>, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT * FROM accessKeys WHERE key=?1;")?;
    stmt.query_map([key], |row| {
        Ok(AccessKey {
            id: row.get(0)?,
            key: row.get(1)?,
            team: row.get(2)?,
        })
    })
    .and_then(Iterator::collect)
}

fn get_access_key_all(conn: Connection) -> Result<Vec<AccessKey>, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT * FROM accessKeys;")?;
    stmt.query_map([], |row| {
        Ok(AccessKey {
            id: row.get(0)?,
            key: row.get(1)?,
            team: row.get(2)?,
        })
    })
    .and_then(Iterator::collect)
}

pub async fn create_user(pool: &Pool, team: i64, full_name: String, username: String, password: String) -> Result<User, Error> {
    let pool = pool.clone();
    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;
    web::block(move || {
        let generated_salt = SaltString::generate(&mut OsRng);
        // argon2id v19
        let argon2ins = Argon2::default();
        // hash into phc string
        let hashed_password = argon2ins.hash_password(password.as_bytes(), &generated_salt);
        if hashed_password.is_err() {
            return Ok(User {
                id: 0,
                username,
                current_challenge: "".to_string(),
                full_name,
                team,
                data: "".to_string(),
                pass_hash: "".to_string(),
                admin: "false".to_string(),
                team_admin: 0,
                access_ok: "true".to_string(),
                score: 0,
            })
            .map_err(rusqlite::Error::NulError);
        }
        create_user_entry(conn, team, full_name, username, hashed_password.unwrap().to_string())
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn create_user_entry(conn: Connection, team: i64, full_name: String, username: String, password_hash: String) -> Result<User, rusqlite::Error> {
    let mut stmt = conn.prepare("INSERT INTO users (username, current_challenge, full_name, team, data, pass_hash, admin, team_admin, access_ok, score) VALUES (?, '', ?, ?, '', ?, 'false', 0, 'true', 0);")?;
    let mut new_user = User {
        id: 0,
        username,
        current_challenge: "".to_string(),
        full_name,
        team,
        data: "".to_string(),
        pass_hash: password_hash,
        admin: "false".to_string(),
        team_admin: 0,
        access_ok: "true".to_string(),
        score: 0,
    };
    stmt.execute(params![new_user.username, new_user.full_name, new_user.team, new_user.pass_hash])?;
    new_user.id = conn.last_insert_rowid();
    Ok(new_user)
}

pub fn update_points(conn: Connection, user_id: i64, inc: i64) -> Result<db_main::Id, rusqlite::Error> {
    let mut stmt = conn.prepare("UPDATE users SET score = score + ?1 WHERE id = ?2;")?;
    stmt.execute(params![inc, user_id])?;
    Ok(db_main::Id {
        id: conn.last_insert_rowid(),
    })
}

pub async fn update_user_data(pool: &Pool, user_id: i64, new_data: String) -> Result<db_main::Id, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || update_user_data_transaction(conn, user_id, new_data))
        .await?
        .map_err(error::ErrorInternalServerError)
}

pub fn update_user_data_transaction(conn: Connection, user_id: i64, new_data: String) -> Result<db_main::Id, rusqlite::Error> {
    let mut stmt: Statement<'_> = conn.prepare("UPDATE users SET data = ?1 WHERE id = ?2;")?;
    stmt.execute(params![new_data, user_id])?;
    Ok(db_main::Id {
        id: conn.last_insert_rowid(),
    })
}

#[derive(Serialize, Deserialize, Clone)]
pub struct UserPartial {
    pub id: i64,
    pub username: String,
    pub team: i64,
    pub admin: String,
    pub team_admin: i64,
    pub score: i64,
}

pub enum UserQueryType {
    All,
    Team,
}

type UserPartialQuery = Result<Vec<UserPartial>, rusqlite::Error>;

pub async fn execute_get_users_mgmt(pool: &Pool, query: UserQueryType, user: User) -> Result<Vec<UserPartial>, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        match query {
            UserQueryType::All => get_users_mgmt(conn, user),
            UserQueryType::Team => get_users_team_mgmt(conn, user),
        }
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn get_users_mgmt(conn: Connection, user: User) -> UserPartialQuery {
    let stmt = conn.prepare("SELECT id, username, team, admin, team_admin, score FROM users WHERE admin!=?1 ORDER BY id DESC;")?;
    get_partial_user_rows([user.id], stmt)
}

fn get_users_team_mgmt(conn: Connection, user: User) -> UserPartialQuery {
    let stmt = conn.prepare("SELECT id, username, team, admin, team_admin, score FROM users WHERE team=?1 ORDER BY id DESC;")?;
    get_partial_user_rows([user.team_admin], stmt)
}

fn get_partial_user_rows(params: [i64; 1], mut statement: Statement) -> UserPartialQuery {
    statement
        .query_map(params, |row| {
            Ok(UserPartial {
                id: row.get(0)?,
                username: row.get(1)?,
                team: row.get(2)?,
                admin: row.get(3)?,
                team_admin: row.get(4)?,
                score: row.get(5)?,
            })
        })
        .and_then(Iterator::collect)
}

pub enum UserManageAction {
    DeleteUser,
    ModifyAdmin,
    ModifyTeamAdmin,
    ModifyPoints,
}

pub async fn execute_manage_user(pool: &Pool, action: UserManageAction, params: [String; 2]) -> Result<String, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        match action {
            UserManageAction::DeleteUser => manage_delete_user(conn, params),
            UserManageAction::ModifyAdmin => manage_modify_admin(conn, params),
            UserManageAction::ModifyTeamAdmin => manage_modify_team_admin(conn, params),
            UserManageAction::ModifyPoints => manage_modify_points(conn, params),
        }
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn manage_delete_user(connection: Connection, params: [String; 2]) -> Result<String, rusqlite::Error> {
    let stmt = connection.prepare("DELETE FROM users WHERE id=?1 AND score!=?2;")?;
    execute_manage_action(stmt, params)
}

fn manage_modify_admin(connection: Connection, params: [String; 2]) -> Result<String, rusqlite::Error> {
    let stmt = connection.prepare("UPDATE users SET admin=?1 WHERE id=?2;")?;
    execute_manage_action(stmt, params)
}

fn manage_modify_team_admin(connection: Connection, params: [String; 2]) -> Result<String, rusqlite::Error> {
    let stmt = connection.prepare("UPDATE users SET team_admin=?1 WHERE id=?2;")?;
    execute_manage_action(stmt, params)
}

fn manage_modify_points(connection: Connection, params: [String; 2]) -> Result<String, rusqlite::Error> {
    let stmt = connection.prepare("UPDATE users SET score = score + ?1 WHERE id=?2;")?;
    execute_manage_action(stmt, params)
}

fn execute_manage_action(mut statement: Statement, params: [String; 2]) -> Result<String, rusqlite::Error> {
    if statement.execute(params).is_ok() {
        Ok("{\"status\":3206}".to_string())
    } else {
        Ok("{\"status\":8002}".to_string())
    }
}

pub async fn delete_access_key(pool: &Pool, id: String) -> Result<String, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || delete_access_key_sql(conn, id))
        .await?
        .map_err(error::ErrorInternalServerError)
}

fn delete_access_key_sql(conn: Connection, id: String) -> Result<String, rusqlite::Error> {
    let mut stmt = conn.prepare("DELETE FROM accessKeys WHERE id=?1;")?;
    stmt.execute(params![id])?;
    Ok("{\"status\": 3207}".to_string())
}

pub async fn create_access_key(pool: &Pool, key: String, team: String) -> Result<String, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || create_access_key_sql(conn, key, team))
        .await?
        .map_err(error::ErrorInternalServerError)
}

fn create_access_key_sql(conn: Connection, key: String, team: String) -> Result<String, rusqlite::Error> {
    let mut stmt = conn.prepare("INSERT INTO accessKeys (key, team) VALUES (?, ?);")?;
    stmt.execute(params![key, team])?;
    Ok("{\"status\": 3207}".to_string())
}

pub async fn update_access_key(pool: &Pool, key: String, id: String) -> Result<String, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || update_access_key_sql(conn, key, id))
        .await?
        .map_err(error::ErrorInternalServerError)
}

fn update_access_key_sql(conn: Connection, key: String, id: String) -> Result<String, rusqlite::Error> {
    let mut stmt = conn.prepare("UPDATE accessKeys SET key=?1 WHERE id=?2")?;
    stmt.execute(params![key, id])?;
    Ok("{\"status\": 3207}".to_string())
}

pub async fn get_passkeys(pool: &Pool, id: String) -> Result<Vec<Passkey>, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || get_passkey_data(conn, id))
        .await?
        .map_err(error::ErrorInternalServerError)
}

fn get_passkey_data(conn: Connection, id: String) -> Result<Vec<Passkey>, rusqlite::Error> {
    let mut statement = conn.prepare("SELECT passkey FROM passkeys WHERE user_id=?1;")?;
    statement
        .query_map([id], |row| {
            let passkey_text: String = row.get(0)?;
            Ok(serde_json::from_str(str::from_utf8(passkey_text.as_bytes()).unwrap()).unwrap())
        })
        .and_then(Iterator::collect)
}

pub async fn set_passkey(pool: &Pool, passkey: Passkey, user_id: i64) -> Result<i64, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || set_passkey_data(conn, passkey, user_id))
        .await?
        .map_err(error::ErrorInternalServerError)
}

fn set_passkey_data(conn: Connection, passkey: Passkey, user_id: i64) -> Result<i64, rusqlite::Error> {
    let mut statement = conn.prepare("INSERT INTO passkeys (user_id, passkey) VALUES (?1, ?2);")?;
    statement.execute(params![user_id, serde_json::to_string(&passkey).unwrap()])?;
    Ok(conn.last_insert_rowid())
}

#[derive(Deserialize, Clone)]
pub struct ApnTokenInsertRequest {
    pub token: String,
    pub app_bundle: String
}

#[derive(Serialize)]
pub struct ApnTokens {
    pub id: i64,
    pub token: String,
    pub app_bundle: String,
    pub user_id: i64,
    pub user_team: i64,
    pub user_username: String,
    pub user_name: String,
}

pub async fn insert_apn_token(pool: &Pool, token: ApnTokenInsertRequest, user: User) -> Result<String, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || insert_apn_token_sql(conn, token, user))
        .await?
        .map_err(error::ErrorInternalServerError)
}

fn insert_apn_token_sql(conn: Connection, token: ApnTokenInsertRequest, user: User) -> Result<String, rusqlite::Error> {
    let mut stmt = conn.prepare("INSERT OR IGNORE INTO apnTokens (token, app_bundle, user_id, user_team, user_username, user_name) VALUES (?, ?, ?, ?, ?, ?);")?;
    stmt.execute(params![token.token, token.app_bundle, user.id, user.team, user.username, user.full_name])?;
    Ok("success".to_string())
}

pub async fn get_all_apn_tokens(pool: &Pool) -> Result<Vec<ApnTokens>, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || get_all_apn_tokens_entry(conn))
        .await?
        .map_err(error::ErrorInternalServerError)
}

fn get_all_apn_tokens_entry(conn: Connection) -> Result<Vec<ApnTokens>, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT * FROM apnTokens")?;
    stmt.query_map([], |row| {
        Ok(ApnTokens {
            id: row.get(0)?,
            token: row.get(1)?,
            app_bundle: row.get(2)?,
            user_id: row.get(3)?,
            user_team: row.get(4)?,
            user_username: row.get(5)?,
            user_name: row.get(6)?
        })
    }).and_then(Iterator::collect)
}

pub async fn send_notification_to_user(pool: &Pool, user_id: i64, notification: a2::DefaultNotificationBuilder<'_>, client: tokio::sync::MutexGuard<'_, a2::Client>) -> Result<bool, Error> {
    let first_pool = pool.clone();

    let conn = web::block(move || first_pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    let tokens: Result<Vec<ApnTokens>, Error> = web::block(move || get_all_apn_tokens_entry_for_user(conn, user_id))
        .await?
        .map_err(error::ErrorInternalServerError);

    match tokens {
        Ok(token_list) => {
            if token_list.len() > 0 {
                for i in 0..(token_list.len()) {
                    match token_list.get(i) {
                        Some(token) => {
                            let options = NotificationOptions {
                                apns_topic: Some(token.app_bundle.as_str()),
                                ..Default::default()
                            };
                            let payload = notification.clone().build(&token.token, options);
                            let response: Result<a2::Response, a2::Error> = client.send(payload).await;
                            match response {
                                Ok(response_content) => {
                                    if response_content.code == 410 {
                                        let new_pool = pool.clone();
                                        let new_conn = web::block(move || new_pool.get()).await?.map_err(error::ErrorInternalServerError)?;
                                        let _deleted: Result<String, rusqlite::Error> = delete_apn_key(new_conn, token.token.clone());
                                    }
                                }
                                Err(e) => {
                                    let new_pool = pool.clone();
                                    let new_conn = web::block(move || new_pool.get()).await?.map_err(error::ErrorInternalServerError)?;
                                    let _deleted: Result<String, rusqlite::Error> = delete_apn_key(new_conn, token.token.clone());
                                    log::error!("APN send error:\n{}", e)
                                }
                            }
                        }
                        None => {}
                    }
                }
            }
        }
        Err(e) => {
            return Err(e)
        }
    }

    Ok(true)
}

pub fn get_all_apn_tokens_entry_for_user(conn: Connection, user_id: i64) -> Result<Vec<ApnTokens>, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT * FROM apnTokens WHERE user_id=?1;")?;
    stmt.query_map([user_id], |row| {
        Ok(ApnTokens {
            id: row.get(0)?,
            token: row.get(1)?,
            app_bundle: row.get(2)?,
            user_id: row.get(3)?,
            user_team: row.get(4)?,
            user_username: row.get(5)?,
            user_name: row.get(6)?
        })
    }).and_then(Iterator::collect)
}

fn delete_apn_key(connection: Connection, token: String) -> Result<String, rusqlite::Error> {
    let stmt = connection.prepare("DELETE FROM apnTokens WHERE token=?1;")?;
    execute_delete_apn_key(stmt, token)
}

fn execute_delete_apn_key(mut statement: Statement, token: String) -> Result<String, rusqlite::Error> {
    if statement.execute(params![token]).is_ok() {
        Ok("{\"status\":3206}".to_string())
    } else {
        Ok("{\"status\":8002}".to_string())
    }
}