use actix_web::{error, web, Error};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use hex;
use image::error::ParameterError;
use openssl::sha::Sha256;
use rand::Rng;
use regex::Regex;
use rusqlite::{params, Statement};
use serde::{Serialize, Deserialize};

use crate::db_auth;
use crate::db_main;
use crate::db_transact;

#[derive(Serialize)]
pub struct PitData {
    pub id: i64,
    pub season: i64,
    pub event: String,
    pub team: i64,
    pub boolean_values: String,
    pub numerical_values: String,
    pub image_ids: String,
    pub description: String,
    pub user_id: i64,
    pub name: String,
    pub from_team: i64
}

#[derive(Deserialize)]
pub struct PitInsert {
    pub season: i64,
    pub event: String,
    pub team: i64,
    pub boolean_values: String,
    pub numerical_values: String,
    pub image_ids: String,
    pub description: String,
}

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;

pub async fn execute_insert(
    pool: &Pool,
    transact_pool: &Pool,
    auth_pool: &Pool,
    data: web::Json<PitInsert>,
    user: db_auth::User,
) -> Result<db_main::Id, actix_web::Error> {
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
    data: &web::Json<PitInsert>,
    user: db_auth::User,
) -> Result<db_main::Id, rusqlite::Error> {
    // create mutable response object
    let mut inserted_row = db_main::Id { id: 0 };

    let regex = Regex::new(r"[;`:/*]").unwrap();
    // insert data into database
    let mut stmt = conn.prepare("INSERT INTO pit (season, event, team, boolean_values, numerical_values, image_ids, description, user_id, name, from_team) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);")?;
    stmt.execute(params![
        data.season,
        data.event,
        data.team,
        data.boolean_values,
        data.numerical_values,
        data.image_ids,
        regex.replace_all(data.description.as_str(), "-"),
        user.id,
        user.full_name,
        user.team,
    ])?;

    // update response object with the correct ID
    inserted_row.id = conn.last_insert_rowid();

    // insert transaction and update points
    let _inserted = db_transact::insert_transaction(
        transact_conn,
        db_transact::Transact {
            id: 0,
            user_id: user.id,
            trans_type: 0x1001,
            amount: 50,
            time: "".to_string(),
        },
    )
    .expect("oop");
    let _updated = db_auth::update_points(auth_conn, user.id, 25).expect("oop");

    // return response object
    Ok(inserted_row)
}

#[derive(Deserialize)]
pub struct IncomingImage {
    pub data: String
}

#[derive(Serialize)]
pub struct ImageId {
    pub id: String
}

pub async fn save_incoming_image(data: &web::Json<IncomingImage>, user: db_auth::User) -> Result<ImageId, Error> {
    let trimmed_image: &str = data.data.split(",").collect::<Vec<&str>>()[1];
    let decoded_image = STANDARD.decode(trimmed_image);
    if decoded_image.is_ok() {
        let image_bytes:Vec<u8>  = decoded_image.unwrap_or_default();
        let mut sha256 = Sha256::new();
        sha256.update(image_bytes.as_slice());
        let hash_result: String = hex::encode(sha256.finish());
        let image = image::load_from_memory(image_bytes.as_slice());
        if image.is_ok() {
            let salt = rand::thread_rng().gen_range(1000000..9999999);
            let image_saved = image.unwrap_or_default().save_with_format(format!("cache/images/2025/{}_{}_{}.png", user.id, salt, hash_result), image::ImageFormat::Png);
            if image_saved.is_ok() {
                Ok(ImageId { id: format!("{}_{}_{}.png", user.id, salt, hash_result) })
            } else {
                log::error!("{}", image_saved.err().unwrap_or(image::ImageError::Parameter(ParameterError::from_kind(image::error::ParameterErrorKind::DimensionMismatch))));
                Ok(ImageId { id: "$ERROR$IMAGE_WRITE_ERROR".to_string() })
            }
        } else {
            Ok(ImageId { id: "$ERROR$IMAGE_LOAD_FAILURE".to_string() })
        }
    } else {
        Ok(ImageId { id: "$ERROR$DECODE_FAILURE".to_string() })
    }
}

// teams pit scouted already
pub async fn get_pit_scouted_team_numbers_by_event(pool: &Pool, season: String, event: String) -> Result<Vec<i64>, Error> {
    let pool = pool.clone();
    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;
    web::block(move || {
        let mut stmt = conn.prepare("SELECT team FROM pit WHERE season=?1 AND event=?2 ORDER BY id DESC;")?;
        stmt.query_map([season, event], |row| Ok(row.get(0)?)).and_then(Iterator::collect)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

// pit scouting data for one team at one or all event(s)
pub async fn get_pit_data(pool: &Pool, season: String, event: String, team: String) -> Result<Vec<PitData>, Error> {
    let pool = pool.clone();
    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;
    web::block(move || {
        let mut stmt: Statement<'_>;
        if event == "ALL" {
            stmt = conn.prepare("SELECT * FROM pit WHERE season=?1 AND event!=?2 AND team=?3 ORDER BY id DESC;")?;
        } else {
            stmt = conn.prepare("SELECT * FROM pit WHERE season=?1 AND event=?2 AND team=?3 ORDER BY id DESC;")?;
        }
        stmt
        .query_map([season, event, team], |row| {
            Ok(PitData {
                id: row.get(0)?,
                event: row.get(1)?,
                season: row.get(2)?,
                team: row.get(3)?,
                boolean_values: row.get(4)?,
                numerical_values: row.get(5)?,
                image_ids: row.get(6)?,
                description: row.get(7)?,
                user_id: row.get(8)?,
                from_team: row.get(9)?,
                name: row.get(10)?,
            })
        })
        .and_then(Iterator::collect)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
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
        let mut stmt = conn.prepare("DELETE FROM pit WHERE id=?1 RETURNING user_id;")?;
        // run query, mapping the result to a single Id object (containing the user id, not submission id) that will used to deduct points
        let execution = stmt.query_row(params![target_id.parse::<i64>().unwrap()], |row| Ok(db_main::Id { id: row.get(0)? }));
        if execution.is_ok() {
            // get the user id from the execution result
            let id: i64 = execution.unwrap().id;
            // insert transaction to deduct user points
            if db_transact::insert_transaction(
                transact_conn,
                db_transact::Transact {
                    id: 0,
                    user_id: id,
                    trans_type: 0x2001,
                    amount: -50,
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
