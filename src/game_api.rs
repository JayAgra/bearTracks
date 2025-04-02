use actix_web::{error, web, Error};
// use rand::seq::SliceRandom;
use rusqlite::Statement;
use serde::{Deserialize, Serialize};

// use crate::db_auth;
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

/*
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
*/

#[derive(Serialize, Deserialize)]
pub struct CardsPostData {
    cards: Vec<i64>,
}

/*
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
*/

// 2024 only

#[derive(Serialize)]
pub struct Team {
    pub team: i64,
    pub leave: f64,
    pub park: f64,
    pub shallow_cage: f64,
    pub deep_cage: f64,
    pub intake_time: DataStats,
    pub travel_time: DataStats,
    pub outtake_time: DataStats,
    pub algae: DataStats,
    pub level_0: DataStats,
    pub level_1: DataStats,
    pub level_2: DataStats,
    pub level_3: DataStats,
    pub score: DataStats,
    pub auto_scores: DataStats,
}

struct TeamDataset {
    leave: Vec<i64>,
    park: Vec<i64>,
    shallow_cage: Vec<i64>,
    deep_cage: Vec<i64>,
    intake_time: Vec<i64>,
    travel_time: Vec<i64>,
    outtake_time: Vec<i64>,
    algae: Vec<i64>,
    level_0: Vec<i64>,
    level_1: Vec<i64>,
    level_2: Vec<i64>,
    level_3: Vec<i64>,
    score: Vec<i64>,
    auto_scores: Vec<i64>
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
        let stmt = conn.prepare("SELECT analysis FROM main WHERE season=:season AND game!=:event AND team=:team; ORDER BY id DESC")?;
        get_rows(stmt, [season, event, team])
    } else {
        let stmt = conn.prepare("SELECT analysis FROM main WHERE season=:season AND event=:event AND team=:team; ORDER BY id DESC")?;
        get_rows(stmt, [season, event, team])
    }
}

fn get_rows(mut statement: Statement, params: [String; 3]) -> Result<Team, rusqlite::Error> {
    let data: Vec<MainAnalysis> = statement
        .query_map(params.clone(), |row| Ok(MainAnalysis { analysis: row.get(0)? }))
        .and_then(Iterator::collect)
        .unwrap();

    let mut data_arr: TeamDataset = TeamDataset {
        leave: Vec::new(),
        park: Vec::new(),
        shallow_cage: Vec::new(),
        deep_cage: Vec::new(),
        intake_time: Vec::new(),
        travel_time: Vec::new(),
        outtake_time: Vec::new(),
        algae: Vec::new(),
        level_0: Vec::new(),
        level_1: Vec::new(),
        level_2: Vec::new(),
        level_3: Vec::new(),
        score: Vec::new(),
        auto_scores: Vec::new(),
    };

    data.iter().for_each(|entry| {
        let game_data: Vec<i64> = entry.analysis.split(",").map(|v| v.parse::<i64>().unwrap_or(0)).collect();
        data_arr.leave.push(game_data.get(0).unwrap_or(&0).clone());
        data_arr.park.push(game_data.get(1).unwrap_or(&0).clone());
        data_arr.shallow_cage.push(game_data.get(2).unwrap_or(&0).clone());
        data_arr.deep_cage.push(game_data.get(3).unwrap_or(&0).clone());
        data_arr.intake_time.push(game_data.get(4).unwrap_or(&0).clone());
        data_arr.travel_time.push(game_data.get(5).unwrap_or(&0).clone());
        data_arr.outtake_time.push(game_data.get(6).unwrap_or(&0).clone());
        data_arr.algae.push(game_data.get(7).unwrap_or(&0).clone());
        data_arr.level_0.push(game_data.get(8).unwrap_or(&0).clone());
        data_arr.level_1.push(game_data.get(9).unwrap_or(&0).clone());
        data_arr.level_2.push(game_data.get(10).unwrap_or(&0).clone());
        data_arr.level_3.push(game_data.get(11).unwrap_or(&0).clone());
        data_arr.score.push(game_data.get(12).unwrap_or(&0).clone());
        data_arr.auto_scores.push(game_data.get(13).unwrap_or(&0).clone());
    });

    let intake_time_qrt = stats::quartiles_i64(&data_arr.intake_time);
    let travel_time_qrt = stats::quartiles_i64(&data_arr.travel_time);
    let outtake_time_qrt = stats::quartiles_i64(&data_arr.outtake_time);
    let algae_qrt = stats::quartiles_i64(&data_arr.algae);
    let level_0_qrt = stats::quartiles_i64(&data_arr.level_0);
    let level_1_qrt = stats::quartiles_i64(&data_arr.level_1);
    let level_2_qrt = stats::quartiles_i64(&data_arr.level_2);
    let level_3_qrt = stats::quartiles_i64(&data_arr.level_3);
    let score_qrt = stats::quartiles_i64(&data_arr.score);
    let auto_scores_qrt = stats::quartiles_i64(&data_arr.auto_scores);

    let intake_time_means = stats::means_i64(&data_arr.intake_time, 0.5);
    let travel_time_means = stats::means_i64(&data_arr.travel_time, 0.5);
    let outtake_time_means = stats::means_i64(&data_arr.outtake_time, 0.5);
    let algae_means = stats::means_i64(&data_arr.algae, 0.5);
    let level_0_means = stats::means_i64(&data_arr.level_0, 0.5);
    let level_1_means = stats::means_i64(&data_arr.level_1, 0.5);
    let level_2_means = stats::means_i64(&data_arr.level_2, 0.5);
    let level_3_means = stats::means_i64(&data_arr.level_3, 0.5);
    let score_means = stats::means_i64(&data_arr.score, 0.5);
    let auto_scores_means = stats::means_i64(&data_arr.auto_scores, 0.5);

    Ok(Team {
        team: params[2].parse::<i64>().unwrap_or(0),
        leave: data_arr.leave.iter().sum::<i64>() as f64 / data_arr.leave.len() as f64,
        park: data_arr.park.iter().sum::<i64>() as f64 / data_arr.park.len() as f64,
        shallow_cage: data_arr.shallow_cage.iter().sum::<i64>() as f64 / data_arr.shallow_cage.len() as f64,
        deep_cage: data_arr.deep_cage.iter().sum::<i64>() as f64 / data_arr.deep_cage.len() as f64,
        intake_time: DataStats {
            first: intake_time_qrt[0],
            median: intake_time_qrt[1],
            third: intake_time_qrt[2],
            mean: intake_time_means[0],
            decaying: intake_time_means[1],
        },
        travel_time: DataStats {
            first: travel_time_qrt[0],
            median: travel_time_qrt[1],
            third: travel_time_qrt[2],
            mean: travel_time_means[0],
            decaying: travel_time_means[1],
        },
        outtake_time: DataStats {
            first: outtake_time_qrt[0],
            median: outtake_time_qrt[1],
            third: outtake_time_qrt[2],
            mean: outtake_time_means[0],
            decaying: outtake_time_means[1],
        },
        algae: DataStats {
            first: algae_qrt[0],
            median: algae_qrt[1],
            third: algae_qrt[2],
            mean: algae_means[0],
            decaying: algae_means[1],
        },
        level_0: DataStats {
            first: level_0_qrt[0],
            median: level_0_qrt[1],
            third: level_0_qrt[2],
            mean: level_0_means[0],
            decaying: level_0_means[1],
        },
        level_1: DataStats {
            first: level_1_qrt[0],
            median: level_1_qrt[1],
            third: level_1_qrt[2],
            mean: level_1_means[0],
            decaying: level_1_means[1],
        },
        level_2: DataStats {
            first: level_2_qrt[0],
            median: level_2_qrt[1],
            third: level_2_qrt[2],
            mean: level_2_means[0],
            decaying: level_2_means[1],
        },
        level_3: DataStats {
            first: level_3_qrt[0],
            median: level_3_qrt[1],
            third: level_3_qrt[2],
            mean: level_3_means[0],
            decaying: level_3_means[1],
        },
        score: DataStats {
            first: score_qrt[0],
            median: score_qrt[1],
            third: score_qrt[2],
            mean: score_means[0],
            decaying: score_means[1],
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