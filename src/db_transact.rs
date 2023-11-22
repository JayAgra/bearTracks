use actix_web::{error, web, Error};
use rusqlite::Statement;
use serde::Serialize;

#[derive(Serialize)]
pub struct Transact {
    pub id: i64,
    pub user_id: String,
    pub trans_type: i64,
    pub amount: i64,
    pub time: String
}


pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;
type TransactQuery = Result<Vec<Transact>, rusqlite::Error>;

pub enum TransactData {
    GetUserTransactions,
}

pub async fn execute(pool: &Pool, query: TransactData) -> Result<Vec<Transact>, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        match query {
            TransactData::GetUserTransactions => get_user_transact(conn),
        }
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn get_user_transact(conn: Connection) -> TransactQuery {
    let stmt = conn.prepare("SELECT * FROM transactions WHERE user_id=1")?;
    get_transact_rows(stmt)
}

fn get_transact_rows(mut statement: Statement) -> TransactQuery {
    statement
        .query_map([], |row| {
            Ok(Transact {
                id: row.get(0)?,
                user_id: row.get(1)?,
                trans_type: row.get(2)?,
                amount: row.get(3)?,
                time: row.get(4)?,
            })
        })
        .and_then(Iterator::collect)
}