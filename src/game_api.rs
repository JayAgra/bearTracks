// 2024 specific

use actix_web::{error, web, Error};
use rusqlite::{Statement, params};
use serde::{Deserialize, Serialize};

use crate::analyze;
use crate::db_main;
use crate::stats;

#[derive(Serialize)]
pub struct DataStats {
    pub first: i64,
    pub median: i64,
    pub third: i64,
    pub mean: i64,
    pub decaying: i64
}

#[derive(Serialize)]
pub struct Team {
    pub team: i64,
    pub trap_note: i64,
    pub climb: i64,
    pub buddy_climb: i64,
    pub intake: DataStats,
    pub travel: DataStats,
    pub outtake: DataStats,
    pub speaker: DataStats,
    pub amplifier: DataStats,
    pub total: DataStats
}

struct TeamDataset {
    trap_note: Vec<i64>,
    climb: Vec<i64>,
    buddy_climb: Vec<i64>,
    intake: Vec<i64>,
    travel: Vec<i64>,
    outtake: Vec<i64>,
    speaker: Vec<i64>,
    amplifier: Vec<i64>,
    shots: Vec<i64>,
    points: Vec<i64>
}

struct MainAnalysis {
    analysis: String,
}

pub async fn execute(pool: &db_main::Pool, season: String, event: String, team: String) -> Result<Team, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        get_team(conn, season, event, team)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn get_team(conn: db_main::Connection, season: String, event: String, team: String) -> Result<Team, rusqlite::Error> {
    let stmt = conn.prepare("SELECT analysis FROM main WHERE season=:season AND event=:event AND team=:team;")?;
    get_rows(stmt, [season, event, team])
}

fn get_rows(mut statement: Statement, params: [String; 3]) -> Result<Team, rusqlite::Error> {
    let data: Vec<MainAnalysis> = statement
        .query_map(params.clone(), |row| {
            Ok(MainAnalysis { 
                analysis: row.get(0)?
            })
        })
        .and_then(Iterator::collect)
        .unwrap();
    
    let mut data_arr: TeamDataset = TeamDataset { trap_note: Vec::new(), climb: Vec::new(), buddy_climb: Vec::new(), intake: Vec::new(), travel: Vec::new(), outtake: Vec::new(), speaker: Vec::new(), amplifier: Vec::new(), points: Vec::new(), shots: Vec::new() };
    data.iter().for_each(|entry| {
        let game_data: Vec<i64> = entry.analysis.split(",").map(|v| v.parse::<i64>().unwrap_or(0)).collect();
        data_arr.trap_note.push(game_data[0]);
        data_arr.climb.push(game_data[1]);
        data_arr.buddy_climb.push(game_data[2]);
        data_arr.intake.push(game_data[3]);
        data_arr.travel.push(game_data[4]);
        data_arr.outtake.push(game_data[5]);
        data_arr.speaker.push(game_data[6]);
        data_arr.amplifier.push(game_data[7]);
        data_arr.shots.push(game_data[6] + game_data[7]);
        data_arr.points.push(game_data[8]);
    });

    let intake_qrt = stats::quartiles_i64(&data_arr.intake);
    let travel_qrt = stats::quartiles_i64(&data_arr.travel);
    let outtake_qrt = stats::quartiles_i64(&data_arr.outtake);
    let speaker_qrt = stats::quartiles_i64(&data_arr.speaker);
    let amplifier_qrt = stats::quartiles_i64(&data_arr.amplifier);
    let total_qrt = stats::quartiles_i64(&data_arr.shots);

    let intake_means = stats::means_i64(&data_arr.intake, 0.5);
    let travel_means = stats::means_i64(&data_arr.travel, 0.5);
    let outtake_means = stats::means_i64(&data_arr.outtake, 0.5);
    let speaker_means = stats::means_i64(&data_arr.speaker, 0.5);
    let amplifier_means = stats::means_i64(&data_arr.amplifier, 0.5);
    let total_means = stats::means_i64(&data_arr.shots, 0.5);

    Ok(Team {
        team: params[2].parse::<i64>().unwrap_or(0),
        trap_note: stats::means_i64(&data_arr.trap_note, 0.5)[0],
        climb: stats::means_i64(&data_arr.climb, 0.5)[0],
        buddy_climb: stats::means_i64(&data_arr.buddy_climb, 0.5)[0],
        intake: DataStats {
            first: intake_qrt[0],
            median: intake_qrt[1],
            third: intake_qrt[2],
            mean: intake_means[0],
            decaying: intake_means[1]
        },
        travel: DataStats {
            first: travel_qrt[0],
            median: travel_qrt[1],
            third: travel_qrt[2],
            mean: travel_means[0],
            decaying: travel_means[1]
        },
        outtake: DataStats {
            first: outtake_qrt[0],
            median: outtake_qrt[1],
            third: outtake_qrt[2],
            mean: outtake_means[0],
            decaying: outtake_means[1]
        },
        speaker: DataStats {
            first: speaker_qrt[0],
            median: speaker_qrt[1],
            third: speaker_qrt[2],
            mean: speaker_means[0],
            decaying: speaker_means[1]
        },
        amplifier: DataStats {
            first: amplifier_qrt[0],
            median: amplifier_qrt[1],
            third: amplifier_qrt[2],
            mean: amplifier_means[0],
            decaying: amplifier_means[1]
        },
        total: DataStats {
            first: total_qrt[0],
            median: total_qrt[1],
            third: total_qrt[2],
            mean: total_means[0],
            decaying: total_means[1]
        }
    })
}
