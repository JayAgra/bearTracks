use actix_web::{error, web, Error};
use rusqlite;
use rand::Rng;

use crate::db_auth;
use crate::db_transact;

const SPIN_THING_SPINS: [i64; 12] = [10, 20, 50, -15, -25, -35, -100, -50, 100, 250, -1000, 1250];

pub async fn spin_thing(auth_pool: &db_auth::Pool, transact_pool: &db_transact::Pool, user: db_auth::User) -> Result<String, Error> {
    let auth_pool = auth_pool.clone();
    let transact_pool = transact_pool.clone();

    let auth_conn = web::block(move || auth_pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    let transact_conn = web::block(move || transact_pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        spin_thing_process(auth_conn, transact_conn, user)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn spin_thing_process(auth_conn: db_auth::Connection, transact_conn: db_transact::Connection, user: db_auth::User) -> Result<String, rusqlite::Error> {
    let mut spin: i64 = rand::thread_rng().gen_range(0..11);
    for _i in 0..3 {
        if spin >= 8 {
            spin = rand::thread_rng().gen_range(0..11);
            if spin >= 9 {
                rand::thread_rng().gen_range(0..11);
                if spin >= 10 {
                    rand::thread_rng().gen_range(0..11);
                }
            }
        }
    }

    db_auth::update_points(auth_conn, user.id, SPIN_THING_SPINS[spin as usize])?;
    db_transact::insert_transaction(transact_conn, db_transact::Transact { id: 0, user_id: user.id, trans_type: 0x1500, amount: SPIN_THING_SPINS[spin as usize], time: "".to_string() })?;

    Ok(format!("{{\"spin\": {}}}", spin))
}