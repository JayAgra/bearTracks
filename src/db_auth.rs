use actix_web::{error, web, Error};
use rusqlite::{Statement, params};
use serde::{Serialize, Deserialize};
use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHasher,
        SaltString
    },
    Argon2
};

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
    GetUserScores
}

pub async fn execute_scores(pool: &Pool, query: AuthData) -> Result<Vec<UserPoints>, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        match query {
            AuthData::GetUserScores => get_user_scores(conn)
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
                score: row.get(3)?
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
    pub method: String,
    pub pass_hash: String,
    pub admin: String,
    pub team_admin: i64,
    pub access_ok: String,
    pub score: i64
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AccessKey {
    pub id: i64,
    pub key: i64,
    pub team: i64
}

// use me later ↓
pub async fn _get_user(pool: &Pool, id: i64) -> Result<User, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        _get_user_entry(conn, id)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn _get_user_entry(conn: Connection, id: i64) -> Result<User, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT * FROM users WHERE id=?1")?;
    stmt.query_row([id], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            current_challenge: row.get(2)?,
            full_name: row.get(3)?,
            team: row.get(4)?,
            method: row.get(5)?,
            pass_hash: row.get(6)?,
            admin: row.get(7)?,
            team_admin: row.get(8)?,
            access_ok: row.get(9)?,
            score: row.get(10)?,
        })
    })
}
// use me later ↑

pub async fn get_user_username(pool: &Pool, username: String) -> Result<User, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        get_user_username_entry(conn, username)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
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
            method: row.get(5)?,
            pass_hash: row.get(6)?,
            admin: row.get(7)?,
            team_admin: row.get(8)?,
            access_ok: row.get(9)?,
            score: row.get(10)?,
        })
    })
}

pub async fn get_access_key(pool: &Pool, key: String) -> Result<AccessKey, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        get_access_key_entry(conn, key)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn get_access_key_entry(conn: Connection, key: String) -> Result<AccessKey, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT * FROM accessKeys WHERE key=?1")?;
    stmt.query_row([key], |row| {
        Ok(AccessKey {
            id: row.get(0)?,
            key: row.get(1)?,
            team: row.get(2)?,
        })
    })
}

pub async fn create_user(pool: &Pool, team: i64, full_name: String, username: String, password: String) -> Result<User, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

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
                method: "pw".to_string(),
                pass_hash: "".to_string(),
                admin: "false".to_string(),
                team_admin: 0,
                access_ok: "true".to_string(),
                score: 0
            }).map_err(rusqlite::Error::NulError)
        }
        create_user_entry(conn, team, full_name, username, hashed_password.unwrap().to_string())
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn create_user_entry(conn: Connection, team: i64, full_name: String, username: String, password_hash: String) -> Result<User, rusqlite::Error> {
    let mut stmt = conn.prepare("INSERT INTO users (username, current_challenge, full_name, team, method, pass_hash, admin, team_admin, access_ok, score) VALUES (?, '', ?, ?, 'pw', ?, 'false', 0, 'true', 0);")?;
    let mut new_user = User {
        id: 0,
        username,
        current_challenge: "".to_string(),
        full_name,
        team,
        method: "pw".to_string(),
        pass_hash: password_hash,
        admin: "false".to_string(),
        team_admin: 0,
        access_ok: "true".to_string(),
        score: 0
    };
    stmt.execute(params![
        new_user.username,
        new_user.full_name,
        new_user.team,
        new_user.pass_hash
    ])?;
    new_user.id = conn.last_insert_rowid();
    Ok(new_user)
}

pub fn update_points(conn: Connection, user_id: i64, inc: i64) -> Result<db_main::InsertReturn, rusqlite::Error> {
    let mut stmt = conn.prepare("UPDATE users SET score = score + ?1 WHERE id = ?2;")?;
    stmt.execute(params![inc, user_id])?;
    Ok(db_main::InsertReturn { id: conn.last_insert_rowid() })
}