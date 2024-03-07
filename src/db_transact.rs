use actix_web::{error, web, Error};
use rusqlite::{params, Statement};
use serde::Serialize;

use crate::db_auth;
use crate::db_main;

#[derive(Serialize)]
pub struct Transact {
    pub id: i64,
    pub user_id: i64,
    pub trans_type: i64,
    pub amount: i64,
    pub time: String,
}

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;
type TransactQuery = Result<Vec<Transact>, rusqlite::Error>;

pub enum TransactData {
    GetUserTransactions,
}

pub async fn execute(pool: &Pool, query: TransactData, user: db_auth::User) -> Result<Vec<Transact>, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        match query {
            TransactData::GetUserTransactions => get_user_transact(conn, user),
        }
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn get_user_transact(conn: Connection, user: db_auth::User) -> TransactQuery {
    let stmt = conn.prepare("SELECT * FROM transactions WHERE user_id=?1 ORDER BY id DESC;")?;
    get_transact_rows(stmt, user)
}

fn get_transact_rows(mut statement: Statement, user: db_auth::User) -> TransactQuery {
    statement
        .query_map([user.id], |row| {
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

pub fn insert_transaction(conn: Connection, data: Transact) -> Result<db_main::Id, rusqlite::Error> {
    let mut stmt = conn.prepare("INSERT INTO transactions (user_id, trans_type, amount) VALUES (?, ?, ?);")?;
    stmt.execute(params![data.user_id, data.trans_type, data.amount])?;
    Ok(db_main::Id {
        id: conn.last_insert_rowid(),
    })
}
