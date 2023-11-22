use std::ops::{Add, Deref};

use actix_web::{error, web, Error};
use rusqlite::{Statement, params};
use serde::{Serialize, Deserialize};
use chrono::prelude::*;
use rand::distributions::{Alphanumeric, DistString};

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
    let stmt = conn.prepare("SELECT id, username, team, score FROM users;")?;
    get_score_rows(stmt)
}

fn get_score_rows(mut statement: Statement) -> PointQueryResult {
    statement
        .query_map([], |row| {
            Ok(UserPoints {
                id: row.get(0)?,
                username: row.get(1)?,
                team: row.get(2)?,
                score: row.get(4)?
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
pub struct Key {
    pub id: i64,
    pub key: String,
    pub user_id: i64,
    pub username: String,
    pub name: String,
    pub team: i64,
    pub created: String,
    pub expires: String,
    pub admin: String,
    pub team_admin: i64
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AccessKey {
    pub id: i64,
    pub key: i64,
    pub team: i64
}

pub async fn get_key(pool: &Pool, key: String) -> Result<Key, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        get_key_entry(conn, key)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn get_key_entry(conn: Connection, key: String) -> Result<Key, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT * FROM keys WHERE key=?1")?;
    stmt.query_row([key], |row| {
        Ok(Key {
            id: row.get(0)?,
            key: row.get(1)?,
            user_id: row.get(2)?,
            username: row.get(3)?,
            name: row.get(4)?,
            team: row.get(5)?,
            created: row.get(6)?,
            expires: row.get(7)?,
            admin: row.get(8)?,
            team_admin: row.get(9)?,
        })
    })
}

pub async fn get_user(pool: &Pool, id: i64) -> Result<User, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        get_user_entry(conn, id)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn get_user_entry(conn: Connection, id: i64) -> Result<User, rusqlite::Error> {
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

pub async fn get_access_key(pool: &Pool, key: i64) -> Result<AccessKey, Error> {
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

fn get_access_key_entry(conn: Connection, key: i64) -> Result<AccessKey, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT * FROM accessKeys WHERE key=?1")?;
    stmt.query_row([key], |row| {
        Ok(AccessKey {
            id: row.get(0)?,
            key: row.get(1)?,
            team: row.get(2)?,
        })
    })
}

pub async fn create_key(pool: &Pool, user: User) -> Result<Key, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        create_key_entry(conn, user)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn create_key_entry(conn: Connection, user: User) -> Result<Key, rusqlite::Error> {
    let mut stmt = conn.prepare("INSERT INTO keys (key, user_id, username, name, team, created, expires, admin, team_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);")?;
    let mut new_key = Key {
        id: 0,
        key: Alphanumeric.sample_string(&mut rand::thread_rng(), 32),
        user_id: user.id,
        username: user.username,
        name: user.full_name,
        team: user.team, 
        created: Utc::now().timestamp_millis().to_string(),
        expires: Utc::now().timestamp_millis().add(86_400_000).to_string(),
        admin: user.admin,
        team_admin: user.team_admin
    };
    stmt.execute(params![
        new_key.key,
        new_key.user_id,
        new_key.username,
        new_key.name,
        new_key.team,
        new_key.created,
        new_key.expires,
        new_key.admin,
        new_key.team_admin
    ])?;
    new_key.id = conn.last_insert_rowid();
    Ok(new_key)
}