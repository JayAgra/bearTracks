use actix_web::{error, web, Error};
use regex::Regex;
use rusqlite::{params, Statement};
use serde::{Deserialize, Serialize};

use crate::db_auth;
use crate::db_transact;

use super::analyze;

// all data from this database can be represented by this enumerator
#[derive(Serialize)]
pub enum Main {
    FullMain {
        id: i64,
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
        weight: String,
        analysis: String,
    },
    Exists {
        id: i64,
        team: i64,
        match_num: i64,
    },
    Brief {
        id: i64,
        event: String,
        season: i64,
        team: i64,
        match_num: i64,
        user_id: i64,
        name: String,
        from_team: i64,
        weight: String,
    },
    Team {
        id: i64,
        team: i64,
        weight: String,
    },
    Id {
        id: i64,
    },
}

// pool and connection types
pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;
// type representing the expected query result
type QueryResult = Result<Vec<Main>, rusqlite::Error>;

// enum to specify intended query type
#[allow(clippy::enum_variant_names)]
pub enum MainData {
    GetDataDetailed,
    DataExists,
    BriefSeason,
    BriefEvent,
    BriefTeam,
    BriefMatch,
    BriefUser,
    GetTeams,
    Id,
    GetAllData,
}

// execute query
pub async fn execute(pool: &Pool, query: MainData, path: web::Path<String>) -> Result<Vec<Main>, Error> {
    // clone pool
    let pool = pool.clone();

    // get database connection
    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    // run query function based on provided enum
    web::block(move || {
        match query {
            MainData::GetDataDetailed => get_data_detailed(conn, path),
            MainData::DataExists => get_submission_exists(conn, path),
            MainData::BriefSeason => get_brief_season(conn, path),
            MainData::BriefEvent => get_brief_event(conn, path),
            MainData::BriefTeam => get_brief_team(conn, path),
            MainData::BriefMatch => get_brief_match(conn, path),
            MainData::BriefUser => get_brief_user(conn, path),
            MainData::GetTeams => get_all_teams(conn, path),
            MainData::Id => get_main_ids(conn, path),
            MainData::GetAllData => get_all_data(conn, path),
        }
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

// get detailed data based on an id
fn get_data_detailed(conn: Connection, path: web::Path<String>) -> QueryResult {
    let args = path.split("/").collect::<Vec<_>>();
    let stmt = conn.prepare("SELECT * FROM main WHERE id=:id LIMIT 1;")?;
    get_rows(stmt, [args[0].parse::<i64>().unwrap()])
}

// get all data
fn get_all_data(conn: Connection, path: web::Path<String>) -> QueryResult {
    let args = path.split("/").collect::<Vec<_>>();
    let stmt = conn.prepare("SELECT * FROM main WHERE season=:season;")?;
    get_rows(stmt, [args[0].parse::<i64>().unwrap()])
}

// get the id, team, and match number based on an id. used to confirm submission
fn get_submission_exists(conn: Connection, path: web::Path<String>) -> QueryResult {
    let args = path.split("/").collect::<Vec<_>>();
    let stmt = conn.prepare("SELECT id, team, match_num FROM main WHERE id=:id LIMIT 1;")?;
    get_exists_row(stmt, [args[0].parse::<i64>().unwrap()])
}

fn get_brief_season(conn: Connection, path: web::Path<String>) -> QueryResult {
    let args = path.split("/").collect::<Vec<_>>();
    let stmt = conn.prepare("SELECT id, event, season, team, match_num, user_id, name, from_team, weight FROM main WHERE season=?1 AND event!=?2 AND id!=?3 ORDER BY id DESC;")?;
    get_brief_rows(stmt, [args[0], "", ""])
}

// get minimum required data on all matches in event
fn get_brief_event(conn: Connection, path: web::Path<String>) -> QueryResult {
    let args = path.split("/").collect::<Vec<_>>();
    let stmt = conn.prepare("SELECT id, event, season, team, match_num, user_id, name, from_team, weight FROM main WHERE season=?1 AND event=?2 AND id!=?3 ORDER BY id DESC;")?;
    get_brief_rows(stmt, [args[0], args[1], ""])
}

// get minimum required data on all matches a team played at an event
fn get_brief_team(conn: Connection, path: web::Path<String>) -> QueryResult {
    let args = path.split("/").collect::<Vec<_>>();
    let stmt = conn.prepare("SELECT id, event, season, team, match_num, user_id, name, from_team, weight FROM main WHERE season=?1 AND event=?2 AND team=?3 ORDER BY id DESC;")?;
    get_brief_rows(stmt, [args[0], args[1], args[2]])
}

// get minimum required data from a specific match
fn get_brief_match(conn: Connection, path: web::Path<String>) -> QueryResult {
    let args = path.split("/").collect::<Vec<_>>();
    let stmt = conn.prepare("SELECT id, event, season, team, match_num, user_id, name, from_team, weight FROM main WHERE season=?1 AND event=?2 AND match_num=?3 ORDER BY id DESC;")?;
    get_brief_rows(stmt, [args[0], args[1], args[2]])
}

// get minimal data on all submissions from a given user
fn get_brief_user(conn: Connection, path: web::Path<String>) -> QueryResult {
    let args = path.split("/").collect::<Vec<_>>();
    let stmt = conn.prepare("SELECT id, event, season, team, match_num, user_id, name, from_team, weight FROM main WHERE season=?1 AND user_id=?2 AND id!=?3 ORDER BY id DESC;")?;
    get_brief_rows(stmt, [args[0], args[1], ""])
}

// get weight and team number for all teams at an event, for performance rankings
fn get_all_teams(conn: Connection, path: web::Path<String>) -> QueryResult {
    let args = path.split("/").collect::<Vec<_>>();
    let stmt = conn.prepare("SELECT id, team, weight FROM main WHERE season=?1 AND event=?2 GROUP BY team;")?;
    get_team_rows(stmt, [args[0], args[1]])
}

// get all valid IDs from main database, for data management
fn get_main_ids(conn: Connection, _path: web::Path<String>) -> QueryResult {
    let stmt = conn.prepare("SELECT id FROM main;")?;
    get_id_rows(stmt)
}

// map result data to enumerator for exists query
fn get_exists_row(mut statement: Statement, params: [i64; 1]) -> QueryResult {
    statement
        .query_map(params, |row| {
            Ok(Main::Exists {
                id: row.get(0)?,
                team: row.get(1)?,
                match_num: row.get(2)?,
            })
        })
        .and_then(Iterator::collect)
}

// map result data to enumerator for detailed query
fn get_rows(mut statement: Statement, params: [i64; 1]) -> QueryResult {
    statement
        .query_map(params, |row| {
            Ok(Main::FullMain {
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
                analysis: row.get(14)?,
            })
        })
        .and_then(Iterator::collect)
}

// map results to enum for brief data queries
fn get_brief_rows(mut statement: Statement, params: [&str; 3]) -> QueryResult {
    statement
        .query_map(params, |row| {
            Ok(Main::Brief {
                id: row.get(0)?,
                event: row.get(1)?,
                season: row.get(2)?,
                team: row.get(3)?,
                match_num: row.get(4)?,
                user_id: row.get(5)?,
                name: row.get(6)?,
                from_team: row.get(7)?,
                weight: row.get(8)?,
            })
        })
        .and_then(Iterator::collect)
}

// results to enum for teams at event
fn get_team_rows(mut statement: Statement, params: [&str; 2]) -> QueryResult {
    statement
        .query_map(params, |row| {
            Ok(Main::Team {
                id: row.get(0)?,
                team: row.get(1)?,
                weight: row.get(2)?,
            })
        })
        .and_then(Iterator::collect)
}

// results to enum for existing data
fn get_id_rows(mut statement: Statement) -> QueryResult {
    statement
        .query_map([], |row| Ok(Main::Id { id: row.get(0)? }))
        .and_then(Iterator::collect)
}

pub async fn get_team_numbers(pool: &Pool, season: String) -> Result<Vec<i64>, Error> {
    // clone pool
    let pool = pool.clone();

    // get database connection
    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    // run query function based on provided enum
    web::block(move || {
        let mut stmt = conn.prepare("SELECT team FROM main WHERE season=?1 ORDER BY id DESC;")?;
        stmt.query_map([season], |row| Ok(row.get(0)?)).and_then(Iterator::collect)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

pub async fn get_team_numbers_by_event(pool: &Pool, season: String, event: String) -> Result<Vec<i64>, Error> {
    // clone pool
    let pool = pool.clone();

    // get database connection
    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    // run query function based on provided enum
    web::block(move || {
        let mut stmt = conn.prepare("SELECT team FROM main WHERE season=?1 AND event=?2 ORDER BY id DESC;")?;
        stmt.query_map([season, event], |row| Ok(row.get(0)?)).and_then(Iterator::collect)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

// incoming data structure for a new main form submission
#[derive(Deserialize)]
pub struct MainInsert {
    pub event: String,
    pub season: i64,
    pub team: i64,
    pub match_num: i64,
    pub level: String,
    pub game: String,
    pub defend: String,
    pub driving: String,
    pub overall: String,
}

// value that will be returned to client (submission's id for verification)
#[derive(Serialize)]
pub struct Id {
    pub id: i64,
}

pub async fn execute_insert(
    pool: &Pool,
    transact_pool: &Pool,
    auth_pool: &Pool,
    data: web::Json<MainInsert>,
    user: db_auth::User,
) -> Result<Id, actix_web::Error> {
    // clone pools for all databases
    let pool = pool.clone();
    let transact_pool = transact_pool.clone();
    let auth_pool = auth_pool.clone();

    // get connections to all databases
    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    let transact_conn = web::block(move || transact_pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    let auth_conn = web::block(move || auth_pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || insert_main_data(conn, transact_conn, auth_conn, &data, user))
        .await?
        .map_err(error::ErrorInternalServerError)
}

fn insert_main_data(
    conn: Connection,
    transact_conn: Connection,
    auth_conn: Connection,
    data: &web::Json<MainInsert>,
    user: db_auth::User,
) -> Result<Id, rusqlite::Error> {
    // analyze the data
    let analysis_results: analyze::AnalysisResults;
    analysis_results = match data.season {
        2023 => analyze::analyze_data(data, analyze::Season::S2023),
        2024 => analyze::analyze_data(data, analyze::Season::S2024),
        2025 => analyze::analyze_data(data, analyze::Season::S2025),
        _ => analyze::analyze_data(data, analyze::Season::S2024),
    };

    // create mutable response object
    let mut inserted_row = Id { id: 0 };

    let regex = Regex::new(r"[;`:/*]").unwrap();
    // insert data into database
    let mut stmt = conn.prepare("INSERT INTO main (event, season, team, match_num, level, game, defend, driving, overall, user_id, name, from_team, weight, analysis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);")?;
    stmt.execute(params![
        data.event,
        data.season,
        data.team,
        data.match_num,
        data.level,
        data.game,
        regex.replace_all(data.defend.as_str(), "-"),
        regex.replace_all(data.driving.as_str(), "-"),
        regex.replace_all(data.overall.as_str(), "-"),
        user.id,
        user.full_name,
        user.team,
        analysis_results.weight,
        analysis_results.analysis
    ])?;

    // update response object with the correct ID
    inserted_row.id = conn.last_insert_rowid();

    // insert transaction and update points. they're unused variables- i don't care if the points failed to credit
    let _inserted = db_transact::insert_transaction(
        transact_conn,
        db_transact::Transact {
            id: 0,
            user_id: user.id,
            trans_type: 0x1000,
            amount: 25,
            time: "".to_string(),
        },
    )
    .expect("oop");
    let _updated = db_auth::update_points(auth_conn, user.id, 25).expect("oop");

    // return response object
    Ok(inserted_row)
}

// function to delete data for users with admin access
pub async fn delete_by_id(pool: &Pool, transact_pool: &Pool, auth_pool: &Pool, path: web::Path<String>) -> Result<String, actix_web::Error> {
    // clone pools for all three databases
    let pool = pool.clone();
    let transact_pool = transact_pool.clone();
    let auth_pool = auth_pool.clone();

    // get connections to all databases
    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    let transact_conn = web::block(move || transact_pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    let auth_conn = web::block(move || auth_pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        // get the target id from request path
        let target_id = path.into_inner();
        // prepare statement
        let mut stmt = conn.prepare("DELETE FROM main WHERE id=?1 RETURNING user_id;")?;
        // run query, mapping the result to a single Id object (containing the user id, not submission id) that will used to deduct points
        let execution = stmt.query_row(params![target_id.parse::<i64>().unwrap()], |row| Ok(Id { id: row.get(0)? }));
        if execution.is_ok() {
            // get the user id from the execution result
            let id: i64 = execution.unwrap().id;
            // insert transaction to deduct user points
            if db_transact::insert_transaction(
                transact_conn,
                db_transact::Transact {
                    id: 0,
                    user_id: id,
                    trans_type: 8192,
                    amount: -25,
                    time: "".to_string(),
                },
            )
            .is_ok()
            {
                // deduct user points
                if db_auth::update_points(auth_conn, id, -25).is_ok() {
                    // again, it doesn't really matter if points failed. send success anyways
                    Ok("{\"status\":3203}".to_string())
                } else {
                    Ok("{\"status\":3203}".to_string())
                }
            } else {
                Ok("{\"status\":3203}".to_string())
            }
        } else {
            // query failed, send error
            Ok("{\"status\":8002}".to_string())
        }
    })
    .await?
    .map_err(error::ErrorInternalServerError::<rusqlite::Error>)
}
