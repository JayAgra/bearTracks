use actix_web::{error, web, Error};
use rusqlite::{Statement};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FullMain {
    pub id: i64,
    pub event: String,
    pub season: i64,
    pub team: i64,
    pub match_num: i64, // not match because thats a rust keyword
    pub level: String,
    pub game: String,
    pub defend: String,
    pub driving: String,
    pub overall: String,
    pub user_id: String,
    pub name: String,
    pub from_team: i64,
    pub weight: String,
    pub analysis: String
}

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;
type QueryResult = Result<Vec<FullMain>, rusqlite::Error>;

#[allow(clippy::enum_variant_names)]
pub enum MainData {
    GetDataDetailed,
}

pub async fn execute(pool: &Pool, query: MainData, path: web::Path<String>) -> Result<Vec<FullMain>, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        match query {
            MainData::GetDataDetailed => get_data_detailed(conn, path),
        }
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn get_data_detailed(conn: Connection, path: web::Path<String>) -> QueryResult {
    let target_id = path.into_inner();
    let stmt = conn.prepare("SELECT * FROM main WHERE id=:id LIMIT 1;")?;
    get_rows(stmt, [target_id.parse::<i64>().unwrap()])
}

fn get_rows(mut statement: Statement, params: [i64; 1]) -> QueryResult {
    statement
        .query_map(params, |row| {
            Ok(FullMain { 
                id: row.get(0)?,
                event: row.get(1)?,
                season: row.get(2)?,
                team: row.get(3)?,
                match_num: row.get(4)?,
                level: row.get(5)?,
                game: row.get(6)?,
                defend: row.get(7)?,
                driving: row.get(8)?,
                overall: row.get(9)?,
                user_id: row.get(10)?,
                name: row.get(11)?,
                from_team: row.get(12)?,
                weight: row.get(13)?,
                analysis: row.get(14)?
            })
        })
        .and_then(Iterator::collect)
}

// metadata endpoints

#[derive(Debug, Serialize, Deserialize)]
pub struct MainDataBrief {
    pub id: i64,
    pub event: String,
    pub season: i64,
    pub team: i64,
    pub match_num: i64,
    pub game: String,
    pub user_id: String,
    pub name: String,
    pub from_team: i64,
    pub weight: String
}

type BriefQueryResult = Result<Vec<MainDataBrief>, rusqlite::Error>;

#[allow(clippy::enum_variant_names)]
pub enum MainBrief {
    BriefTeam,
    BriefMatch,
    BriefEvent,
}

pub async fn execute_get_brief(pool: &Pool, query: MainBrief, params: [String; 3]) -> Result<Vec<MainDataBrief>, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        match query {
            MainBrief::BriefTeam => get_brief_team(conn, params),
            MainBrief::BriefMatch => get_brief_match(conn, params),
            MainBrief::BriefEvent => get_brief_event(conn, params)
        }
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

// TODO: parameterize
fn get_brief_team(conn: Connection, params: [String; 3]) -> BriefQueryResult {
    let stmt = conn.prepare("SELECT id, event, season, team, match_num, game, user_id, name, from_team, weight FROM main WHERE season=?1 AND event=?2 AND team=?3 ORDER BY id DESC;")?;
    get_brief_rows(stmt, params)
}

fn get_brief_match(conn: Connection, params: [String; 3]) -> BriefQueryResult {
    let stmt = conn.prepare("SELECT id, event, season, team, match_num, game, user_id, name, from_team, weight FROM main WHERE season=?1 AND event=?2 AND match=?3 ORDER BY id DESC;")?;
    get_brief_rows(stmt, params)
}

fn get_brief_event(conn: Connection, params: [String; 3]) -> BriefQueryResult {
    let stmt = conn.prepare("SELECT id, event, season, team, match_num, game, user_id, name, from_team, weight FROM main WHERE season=?1 AND event=?2 AND id!=?3 ORDER BY id DESC;")?;
    get_brief_rows(stmt, params)
}

fn get_brief_rows(mut statement: Statement, params: [String; 3]) -> BriefQueryResult {
    statement
        .query_map(params, |row| {
            Ok(MainDataBrief { 
                id: row.get(0)?,
                event: row.get(1)?,
                season: row.get(2)?,
                team: row.get(3)?,
                match_num: row.get(4)?,
                game: row.get(5)?,
                user_id: row.get(6)?,
                name: row.get(7)?,
                from_team: row.get(8)?,
                weight: row.get(9)?,
            })
        })
        .and_then(Iterator::collect)
}