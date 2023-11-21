use actix_web::{error, web, Error};
use rusqlite::{Statement, params};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub enum FullMain {
    FullMain {
        id: i64,
        event: String,
        season: i64,
        team: i64,
        match_num: i64, // not match because thats a rust keyword
        level: String,
        game: String,
        defend: String,
        driving: String,
        overall: String,
        user_id: i64,
        name: String,
        from_team: i64,
        weight: String,
        analysis: String
    },
    Exists { id: i64, team: i64, match_num: i64 }
}

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;
type QueryResult = Result<Vec<FullMain>, rusqlite::Error>;

#[allow(clippy::enum_variant_names)]
pub enum MainData {
    GetDataDetailed,
    DataExists
}

pub async fn execute(pool: &Pool, query: MainData, path: web::Path<String>) -> Result<Vec<FullMain>, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        match query {
            MainData::GetDataDetailed => get_data_detailed(conn, path),
            MainData::DataExists => get_submission_exists(conn, path)
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

fn get_submission_exists(conn: Connection, path: web::Path<String>) -> QueryResult {
    let target_id = path.into_inner();
    let stmt = conn.prepare("SELECT id, team, match_num FROM main WHERE id=:id LIMIT 1;")?;
    get_exists_row(stmt, [target_id.parse::<i64>().unwrap()])
}

fn get_exists_row(mut statement: Statement, params: [i64; 1]) -> QueryResult {
    statement
        .query_map(params, |row| {
            Ok(FullMain::Exists { 
                id: row.get(0)?,
                team: row.get(1)?,
                match_num: row.get(2)?,
            })
        })
        .and_then(Iterator::collect)
}

fn get_rows(mut statement: Statement, params: [i64; 1]) -> QueryResult {
    statement
        .query_map(params, |row| {
            Ok(FullMain::FullMain { 
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

#[derive(Serialize)]
pub struct MainDataBrief {
    pub id: i64,
    pub event: String,
    pub season: i64,
    pub team: i64,
    pub match_num: i64,
    pub game: String,
    pub user_id: i64,
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
    BriefUser,
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
            MainBrief::BriefEvent => get_brief_event(conn, params),
            MainBrief::BriefUser => get_brief_user(conn, params)
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

fn get_brief_user(conn: Connection, params: [String; 3]) -> BriefQueryResult {
    let stmt = conn.prepare("SELECT id, event, season, team, match_num, game, user_id, name, from_team, weight FROM main WHERE season=?1 AND user_id=?2 AND id!=?3 ORDER BY id DESC;")?;
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

#[derive(Deserialize)]
pub struct MainInsert {
    event: String,
    season: i64,
    team: i64,
    match_num: i64,
    level: String,
    game: String,
    defend: String,
    driving: String,
    overall: String,
    user_id: i64,
    name: String,
    from_team: i64,
}

#[derive(Serialize)]
pub struct InsertReturn {
    pub id: i64
}

pub async fn execute_insert(pool: &Pool, data: web::Json<MainInsert>) -> Result<InsertReturn, actix_web::Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;
    web::block(move || {
        insert_main_data(conn, data)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn insert_main_data(conn: Connection, data: web::Json<MainInsert>) -> Result<InsertReturn, rusqlite::Error> {
    let mut inserted_row = InsertReturn {
        id: 0
    };
    let mut stmt = conn.prepare("INSERT INTO main (event, season, team, match_num, level, game, defend, driving, overall, user_id, name, from_team, weight, analysis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'not implemented', 'not implemented');")?;
    stmt.execute(params![data.event, data.season, data.team, data.match_num, data.level, data.game, data.defend, data.driving, data.overall, data.user_id, data.name, data.from_team])?;
    inserted_row.id = conn.last_insert_rowid();
    Ok(inserted_row)
}