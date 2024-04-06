use actix_web::{error, web, Error};
use rand::seq::SliceRandom;
use rusqlite::Statement;
use serde::{Deserialize, Serialize};

use crate::db_auth;
use crate::db_main;
use crate::stats;

#[derive(Serialize)]
pub struct DataStats {
    pub first: i64,
    pub median: i64,
    pub third: i64,
    pub mean: i64,
    pub decaying: i64,
}

#[derive(Serialize, Deserialize)]
pub struct GameUserData {
    cards: Vec<i64>,
    hand: Vec<i64>,
    wins: i64,
    losses: i64,
    ties: i64,
    box_count: i64,
}

#[derive(Serialize, Deserialize)]
pub struct ClientInfo {
    id: i64,
    username: String,
    team: i64,
    score: i64,
    game_data: GameUserData,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FrcApiTeam {
    pub team_number: i64,
    pub name_full: String,
    pub name_short: String,
    pub city: String,
    pub state_prov: String,
    pub country: String,
    pub rookie_year: i64,
    pub robot_name: String,
    pub district_code: Option<String>,
    pub school_name: String,
    pub website: String,
    pub home_c_m_p: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FrcApiTeams {
    pub team_count_total: i64,
    pub team_count_page: i64,
    pub page_current: i64,
    pub page_total: i64,
    pub teams: Vec<FrcApiTeam>,
}

pub async fn get_owned_cards(pool: &db_auth::Pool, user: db_auth::User) -> Result<ClientInfo, Error> {
    let user_updated = db_auth::get_user_id(pool, user.id.to_string()).await?;
    if user_updated.data == "" {
        db_auth::update_user_data(
            pool,
            user.id,
            serde_json::to_string(&GameUserData {
                cards: vec![99999, 99998, 99997],
                hand: vec![99999, 99998, 99997],
                wins: 0,
                losses: 0,
                ties: 0,
                box_count: 0,
            })
            .unwrap_or("".to_string()),
        )
        .await?;
        Ok(ClientInfo {
            id: user.id,
            username: user.username,
            team: user.team,
            score: user.score,
            game_data: GameUserData {
                cards: vec![99999, 99998, 99997],
                hand: vec![99999, 99998, 99997],
                wins: 0,
                losses: 0,
                ties: 0,
                box_count: 0,
            },
        })
    } else {
        Ok(ClientInfo {
            id: user_updated.id,
            username: user_updated.username,
            team: user_updated.team,
            score: user_updated.score,
            game_data: serde_json::from_str::<GameUserData>(&user_updated.data).unwrap_or(GameUserData {
                cards: vec![99999, 99998, 99997],
                hand: vec![99999, 99998, 99997],
                wins: 0,
                losses: 0,
                ties: 0,
                box_count: 0,
            }),
        })
    }
}

pub async fn get_owned_cards_by_user(pool: &db_auth::Pool, user: String) -> Result<ClientInfo, Error> {
    let user_updated = db_auth::get_user_username(pool, user).await?;
    if user_updated.data == "" {
        db_auth::update_user_data(
            pool,
            user_updated.id,
            serde_json::to_string(&GameUserData {
                cards: vec![99999, 99998, 99997],
                hand: vec![99999, 99998, 99997],
                wins: 0,
                losses: 0,
                ties: 0,
                box_count: 0,
            })
            .unwrap_or("".to_string()),
        )
        .await?;
        Ok(ClientInfo {
            id: user_updated.id,
            username: user_updated.username,
            team: user_updated.team,
            score: user_updated.score,
            game_data: GameUserData {
                cards: vec![99999, 99998, 99997],
                hand: vec![99999, 99998, 99997],
                wins: 0,
                losses: 0,
                ties: 0,
                box_count: 0,
            },
        })
    } else {
        Ok(ClientInfo {
            id: user_updated.id,
            username: user_updated.username,
            team: user_updated.team,
            score: user_updated.score,
            game_data: serde_json::from_str::<GameUserData>(&user_updated.data).unwrap_or(GameUserData {
                cards: vec![99999, 99998, 99997],
                hand: vec![99999, 99998, 99997],
                wins: 0,
                losses: 0,
                ties: 0,
                box_count: 0,
            }),
        })
    }
}

pub async fn open_loot_box(auth_pool: &db_auth::Pool, main_pool: &db_main::Pool, user_param: db_auth::User, event: String) -> Result<i64, Error> {
    let user_queried = db_auth::get_user_id(auth_pool, user_param.id.to_string()).await;
    if !user_queried.is_ok() {
        return Ok(-1);
    }
    let user = user_queried.unwrap();
    let teams = db_main::get_team_numbers_by_event(main_pool, "2024".to_string(), event).await;
    if teams.is_ok() {
        let team_list = teams.unwrap();
        if team_list.is_empty() {
            Ok(-1)
        } else {
            let card = team_list.choose(&mut rand::thread_rng()).unwrap().clone();
            if user.score >= 100 {
                if user.data == "" {
                    db_auth::update_user_data(
                        auth_pool,
                        user.id,
                        serde_json::to_string(&GameUserData {
                            cards: vec![99999, 99998, 99997],
                            hand: vec![99999, 99998, 99997],
                            wins: 0,
                            losses: 0,
                            ties: 0,
                            box_count: 0,
                        })
                        .unwrap_or("".to_string()),
                    )
                    .await?;
                }

                let mut current_user_data = serde_json::from_str::<GameUserData>(&user.data).unwrap();
                current_user_data.box_count += 1;
                current_user_data.cards.push(card);
                db_auth::update_user_data(auth_pool, user.id, serde_json::to_string(&current_user_data).unwrap_or("".to_string())).await?;

                let auth_pool = auth_pool.clone();
                let auth_conn = web::block(move || auth_pool.get()).await?.map_err(error::ErrorInternalServerError)?;

                db_auth::update_points(auth_conn, user.id, -100).map_err(error::ErrorInternalServerError)?;

                Ok(card)
            } else {
                Ok(-1)
            }
        }
    } else {
        Ok(-1)
    }
}

#[derive(Serialize, Deserialize)]
pub struct CardsPostData {
    cards: Vec<i64>,
}

pub async fn set_held_cards(auth_pool: &db_auth::Pool, user_param: db_auth::User, data: &web::Json<CardsPostData>) -> Result<CardsPostData, Error> {
    let user_queried = db_auth::get_user_id(auth_pool, user_param.id.to_string()).await;
    if !user_queried.is_ok() {
        return Ok(CardsPostData { cards: vec![-1, 3] });
    }
    let user = user_queried.unwrap();
    if user.data == "" {
        Ok(CardsPostData { cards: vec![-1, 3] })
    } else {
        let mut current_user_data = serde_json::from_str::<GameUserData>(&user.data).unwrap();
        let mut cards_not_ok = false;
        if data.cards.len() == 3 {
            data.cards.iter().for_each(|card| {
                if !current_user_data.cards.contains(card) {
                    cards_not_ok = true;
                }
            });
        } else {
            cards_not_ok = true;
        }
        if !cards_not_ok {
            current_user_data.hand = data.cards.clone();
            db_auth::update_user_data(auth_pool, user.id, serde_json::to_string(&current_user_data).unwrap_or("".to_string())).await?;
            return Ok(CardsPostData {
                cards: current_user_data.hand,
            });
        } else {
            return Ok(CardsPostData { cards: vec![-1, 3] });
        }
    }
}

// 2024 only

#[derive(Serialize)]
pub struct Team {
    pub team: i64,
    pub trap_note: f64,
    pub climb: f64,
    pub buddy_climb: f64,
    pub intake: DataStats,
    pub travel: DataStats,
    pub outtake: DataStats,
    pub speaker: DataStats,
    pub amplifier: DataStats,
    pub total: DataStats,
    pub points: DataStats,
    pub auto_scores: DataStats,
    pub auto_preload: DataStats,
    pub auto_wing: DataStats,
    pub auto_center: DataStats,
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
    points: Vec<i64>,
    auto_preload: Vec<i64>,
    auto_wing: Vec<i64>,
    auto_center: Vec<i64>,
    auto_scores: Vec<i64>,
}

struct MainAnalysis {
    analysis: String,
}

pub async fn execute(pool: &db_main::Pool, season: String, event: String, team: String) -> Result<Team, Error> {
    let pool = pool.clone();

    let conn = web::block(move || pool.get()).await?.map_err(error::ErrorInternalServerError)?;

    web::block(move || get_team(conn, season, event, team))
        .await?
        .map_err(error::ErrorInternalServerError)
}

fn get_team(conn: db_main::Connection, season: String, event: String, team: String) -> Result<Team, rusqlite::Error> {
    if event == "ALL" {
        let stmt = conn.prepare("SELECT analysis FROM main WHERE season=:season AND event!=:event AND team=:team;")?;
        get_rows(stmt, [season, event, team])
    } else {
        let stmt = conn.prepare("SELECT analysis FROM main WHERE season=:season AND event=:event AND team=:team;")?;
        get_rows(stmt, [season, event, team])
    }
}

fn get_rows(mut statement: Statement, params: [String; 3]) -> Result<Team, rusqlite::Error> {
    let data: Vec<MainAnalysis> = statement
        .query_map(params.clone(), |row| Ok(MainAnalysis { analysis: row.get(0)? }))
        .and_then(Iterator::collect)
        .unwrap();

    let mut data_arr: TeamDataset = TeamDataset {
        trap_note: Vec::new(),
        climb: Vec::new(),
        buddy_climb: Vec::new(),
        intake: Vec::new(),
        travel: Vec::new(),
        outtake: Vec::new(),
        speaker: Vec::new(),
        amplifier: Vec::new(),
        points: Vec::new(),
        shots: Vec::new(),
        auto_preload: Vec::new(),
        auto_wing: Vec::new(),
        auto_center: Vec::new(),
        auto_scores: Vec::new(),
    };

    data.iter().for_each(|entry| {
        let game_data: Vec<i64> = entry.analysis.split(",").map(|v| v.parse::<i64>().unwrap_or(0)).collect();
        data_arr.trap_note.push(game_data.get(0).unwrap_or(&0).clone());
        data_arr.climb.push(game_data.get(1).unwrap_or(&0).clone());
        data_arr.buddy_climb.push(game_data.get(2).unwrap_or(&0).clone());
        data_arr.intake.push(game_data.get(3).unwrap_or(&0).clone());
        data_arr.travel.push(game_data.get(4).unwrap_or(&0).clone());
        data_arr.outtake.push(game_data.get(5).unwrap_or(&0).clone());
        data_arr.speaker.push(game_data.get(6).unwrap_or(&0).clone());
        data_arr.amplifier.push(game_data.get(7).unwrap_or(&0).clone());
        data_arr
            .shots
            .push(game_data.get(6).unwrap_or(&0).clone() + game_data.get(7).unwrap_or(&0).clone());
        data_arr.points.push(game_data.get(8).unwrap_or(&0).clone());
        data_arr.auto_preload.push(game_data.get(9).unwrap_or(&0).clone());
        data_arr.auto_wing.push(game_data.get(10).unwrap_or(&0).clone());
        data_arr.auto_center.push(game_data.get(11).unwrap_or(&0).clone());
        data_arr.auto_scores.push(game_data.get(12).unwrap_or(&0).clone());
    });

    let intake_qrt = stats::quartiles_i64(&data_arr.intake);
    let travel_qrt = stats::quartiles_i64(&data_arr.travel);
    let outtake_qrt = stats::quartiles_i64(&data_arr.outtake);
    let speaker_qrt = stats::quartiles_i64(&data_arr.speaker);
    let amplifier_qrt = stats::quartiles_i64(&data_arr.amplifier);
    let total_qrt = stats::quartiles_i64(&data_arr.shots);
    let points_qrt = stats::quartiles_i64(&data_arr.points);
    let auto_preload_qrt = stats::quartiles_i64(&data_arr.auto_preload);
    let auto_wing_qrt = stats::quartiles_i64(&data_arr.auto_wing);
    let auto_center_qrt = stats::quartiles_i64(&data_arr.auto_center);
    let auto_scores_qrt = stats::quartiles_i64(&data_arr.auto_scores);

    let intake_means = stats::means_i64(&data_arr.intake, 0.5);
    let travel_means = stats::means_i64(&data_arr.travel, 0.5);
    let outtake_means = stats::means_i64(&data_arr.outtake, 0.5);
    let speaker_means = stats::means_i64(&data_arr.speaker, 0.5);
    let amplifier_means = stats::means_i64(&data_arr.amplifier, 0.5);
    let total_means = stats::means_i64(&data_arr.shots, 0.5);
    let points_means = stats::means_i64(&data_arr.points, 0.5);
    let auto_preload_means = stats::means_i64(&data_arr.auto_preload, 0.5);
    let auto_wing_means = stats::means_i64(&data_arr.auto_wing, 0.5);
    let auto_center_means = stats::means_i64(&data_arr.auto_center, 0.5);
    let auto_scores_means = stats::means_i64(&data_arr.auto_scores, 0.5);

    Ok(Team {
        team: params[2].parse::<i64>().unwrap_or(0),
        trap_note: data_arr.trap_note.iter().sum::<i64>() as f64 / data_arr.trap_note.len() as f64,
        climb: data_arr.climb.iter().sum::<i64>() as f64 / data_arr.climb.len() as f64,
        buddy_climb: data_arr.buddy_climb.iter().sum::<i64>() as f64 / data_arr.buddy_climb.len() as f64,
        intake: DataStats {
            first: intake_qrt[0],
            median: intake_qrt[1],
            third: intake_qrt[2],
            mean: intake_means[0],
            decaying: intake_means[1],
        },
        travel: DataStats {
            first: travel_qrt[0],
            median: travel_qrt[1],
            third: travel_qrt[2],
            mean: travel_means[0],
            decaying: travel_means[1],
        },
        outtake: DataStats {
            first: outtake_qrt[0],
            median: outtake_qrt[1],
            third: outtake_qrt[2],
            mean: outtake_means[0],
            decaying: outtake_means[1],
        },
        speaker: DataStats {
            first: speaker_qrt[0],
            median: speaker_qrt[1],
            third: speaker_qrt[2],
            mean: speaker_means[0],
            decaying: speaker_means[1],
        },
        amplifier: DataStats {
            first: amplifier_qrt[0],
            median: amplifier_qrt[1],
            third: amplifier_qrt[2],
            mean: amplifier_means[0],
            decaying: amplifier_means[1],
        },
        total: DataStats {
            first: total_qrt[0],
            median: total_qrt[1],
            third: total_qrt[2],
            mean: total_means[0],
            decaying: total_means[1],
        },
        points: DataStats {
            first: points_qrt[0],
            median: points_qrt[1],
            third: points_qrt[2],
            mean: points_means[0],
            decaying: points_means[1],
        },
        auto_preload: DataStats {
            first: auto_preload_qrt[0],
            median: auto_preload_qrt[1],
            third: auto_preload_qrt[2],
            mean: auto_preload_means[0],
            decaying: auto_preload_means[1],
        },
        auto_wing: DataStats {
            first: auto_wing_qrt[0],
            median: auto_wing_qrt[1],
            third: auto_wing_qrt[2],
            mean: auto_wing_means[0],
            decaying: auto_wing_means[1],
        },
        auto_center: DataStats {
            first: auto_center_qrt[0],
            median: auto_center_qrt[1],
            third: auto_center_qrt[2],
            mean: auto_center_means[0],
            decaying: auto_center_means[1],
        },
        auto_scores: DataStats {
            first: auto_scores_qrt[0],
            median: auto_scores_qrt[1],
            third: auto_scores_qrt[2],
            mean: auto_scores_means[0],
            decaying: auto_scores_means[1],
        },
    })
}
