use actix_web::{error, web, Error};
use rusqlite::Statement;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FullMain {
    pub id: i32,
    pub event: String,
    pub season: i32,
    pub team: i32,
    pub match_num: i32, // not match because rust
    pub level: String,
    pub game: String,
    pub defend: String,
    pub driving: String,
    pub overall: String,
    pub user_id: String,
    pub name: String,
    pub from_team: i32,
    pub weight: String,
    pub analysis: String
}

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;
type QueryResult = Result<Vec<FullMain>, rusqlite::Error>;

#[allow(clippy::enum_variant_names)]
pub enum MainData {
    GetDataDetailed,
    GetDataTeam,
    GetDataMatch,
    GetDataEvent,
    GetDataUser,
    GetAllDataIds
}

pub async fn execute(pool: &Pool, query: MainData) -> Result<Vec<FullMain>, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        match query {
            MainData::GetAllDataIds => get_data_detailed(conn),
            MainData::GetDataDetailed => get_data_detailed(conn),
            MainData::GetDataEvent => get_data_detailed(conn),
            MainData::GetDataMatch => get_data_detailed(conn),
            MainData::GetDataTeam => get_data_detailed(conn),
            MainData::GetDataUser => get_data_detailed(conn),
        }
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn get_data_detailed(conn: Connection) -> QueryResult {
    let stmt = conn.prepare("SELECT * FROM main WHERE id=1 LIMIT 1;")?;
    get_rows_as_full(stmt)
}

fn get_rows_as_full(mut statement: Statement) -> QueryResult {
    statement
        .query_map([], |row| {
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