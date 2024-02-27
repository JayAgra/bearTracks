use actix_web::{web, Error};
use serde::{Deserialize, Serialize};
use vader_sentiment;

use super::db_main;

pub(crate) enum Season {
    S2023,
    S2024
}

fn bool_to_num(value: &str) -> f64 {
    if value == "true" {
        return 1.0;
    } else {
        return 0.0;
    }
}

fn real_bool_to_num(value: bool) -> f64 {
    if value {
        return 1.0;
    } else {
        return  0.0;
    }
}

pub(crate) struct AnalysisResults {
    pub weight: String,
    pub analysis: String
}

pub fn analyze_data(data: &web::Json<db_main::MainInsert>, season: Season) -> AnalysisResults {
    match season {
        Season::S2023 => season_2023(data).unwrap(),
        Season::S2024 => season_2024(data).unwrap()
    }
}

fn season_2023(data: &web::Json<db_main::MainInsert>) -> Result<AnalysisResults, Error> {
    let analyzer = vader_sentiment::SentimentIntensityAnalyzer::new();
    let game_data = data.game.split(",").collect::<Vec<_>>();
    let analysis_results: Vec<f64> = vec!(
        analyzer.polarity_scores(data.defend.as_str()).get("compound").unwrap().clone(),
        analyzer.polarity_scores(data.driving.as_str()).get("compound").unwrap().clone(),
        analyzer.polarity_scores(data.overall.as_str()).get("compound").unwrap().clone()
    );

    let mut score: f64 = 0.0;

    score += analysis_results[0] * 3.75;
    score += analysis_results[1] * 3.75;
    score += analysis_results[2] * 7.5;

    // charging points
    score += game_data[4].parse::<i64>().unwrap() as f64 / 2.0;
    score += game_data[9].parse::<i64>().unwrap() as f64 / 2.0;

    // auto points
    score += bool_to_num(game_data[0]) * 6.0;  // taxi
    score += bool_to_num(game_data[1]) * 6.0;  // score bottom
    score += bool_to_num(game_data[2]) * 8.0;  // score middle
    score += bool_to_num(game_data[3]) * 12.0; // score top

    // teleop points
    score += bool_to_num(game_data[5]) * 2.0;  // score bottom
    score += bool_to_num(game_data[6]) * 3.0;  // score mid
    score += bool_to_num(game_data[7]) * 3.0;  // score top
    score += bool_to_num(game_data[8]) * 2.0;  // coop bonus

    // grid items
    let mut cubes: f64 = 0.0;
    let mut cones: f64 = 0.0;
    let mut grid_wt: f64 = 0.0;
    let mut low: f64 = 0.0;
    let mut mid: f64 = 0.0;
    let mut high: f64 = 0.0;
    let mut low_cube: f64 = 0.0;
    let mut low_cone: f64 = 0.0;
    let mut mid_cube: f64 = 0.0;
    let mut mid_cone: f64 = 0.0;
    let mut high_cube: f64 = 0.0;
    let mut high_cone: f64 = 0.0;
    let grid_vector: Vec<&str> = game_data[11].split("").collect::<Vec<_>>();
    let full_grid: bool = !grid_vector.contains(&"0");

    for score_index in 0..=26 {
        let item: &str = game_data[11].split("").collect::<Vec<_>>()[score_index];
        if score_index <= 8 && item != "0" {
            high += 1.0;
            match item {
                "1" => {
                    cubes += 1.0;
                    high_cube += 1.0;
                    grid_wt += 5.0;
                }
                "2" => {
                    cones += 1.0;
                    high_cone += 1.0;
                    grid_wt += 5.0;
                }
                "3" => {
                    cubes += 2.0;
                    high_cube += 2.0;
                    if full_grid {
                        grid_wt += 8.0;
                    }
                }
                "4" => {
                    cones += 2.0;
                    high_cone += 2.0;
                    if full_grid {
                        grid_wt += 8.0;
                    }
                }
                _other => {
                }
            }
        } else if score_index <= 17 && item != "0" {
            mid += 1.0;
            match item {
                "1" => {
                    cubes += 1.0;
                    mid_cube += 1.0;
                    grid_wt += 3.0;
                }
                "2" => {
                    cones += 1.0;
                    mid_cone += 1.0;
                    grid_wt += 3.0;
                }
                "3" => {
                    cubes += 2.0;
                    mid_cube += 2.0;
                    if full_grid {
                        grid_wt += 6.0;
                    }
                }
                "4" => {
                    cones += 2.0;
                    mid_cone += 2.0;
                    if full_grid {
                        grid_wt += 6.0;
                    }
                }
                _other => {
                }
            }
        } else if score_index <= 26 && item != "0" {
            low += 1.0;
            match item {
                "1" => {
                    cubes += 1.0;
                    low_cube += 1.0;
                    grid_wt += 2.0;
                }
                "2" => {
                    cones += 1.0;
                    low_cone += 1.0;
                    grid_wt += 2.0;
                }
                "3" => {
                    cubes += 2.0;
                    low_cube += 2.0;
                    if full_grid {
                        grid_wt += 5.0;
                    }
                }
                "4" => {
                    cones += 2.0;
                    low_cone += 2.0;
                    if full_grid {
                        grid_wt += 5.0;
                    }
                }
                _other => {
                }
            }
        }
    }

    score += grid_wt / 1.6875;

    let mps_scores: Vec<f64> = vec!(
        score,
        score + (2.0 * grid_wt),
        score * (cubes / 15.0),
        score * (cones / 22.0),
        score * (low / 9.0),
        score * (mid / 9.0),
        score * (high / 9.0),
        score * (low_cube / 9.0),
        score * (low_cone / 9.0),
        score * (mid_cube / 9.0),
        score * (mid_cone / 9.0),
        score * (high_cube / 9.0),
        score * (high_cone / 9.0),
    );

    let string_mps_scores: Vec<String> = mps_scores
                                            .iter()
                                            .map(|float| float.to_string())
                                            .collect();

    let string_analysis_results: Vec<String> = analysis_results
                                            .iter()
                                            .map(|float| float.to_string())
                                            .collect();

    Ok(AnalysisResults {
        weight: string_mps_scores.join(","),
        analysis: string_analysis_results.join(","),
    })
}

#[derive(Serialize, Deserialize)]
pub struct MatchTime2024 {
    pub id: i64,
    pub intake: f64,
    pub outtake: f64,
    pub score_type: i64,
    pub travel: f64,
}

fn season_2024(data: &web::Json<db_main::MainInsert>) -> Result<AnalysisResults, Error> {
    let analyzer = vader_sentiment::SentimentIntensityAnalyzer::new();
    let game_data: Vec<MatchTime2024> = serde_json::from_str(data.game.as_str()).expect("failed to convert");

    let analysis_results: Vec<f64> = vec!(
        analyzer.polarity_scores(data.defend.as_str()).get("compound").unwrap().clone(),
        analyzer.polarity_scores(data.driving.as_str()).get("compound").unwrap().clone(),
        analyzer.polarity_scores(data.overall.as_str()).get("compound").unwrap().clone()
    );

    let mut score: f64 = 0.0;

    score += (analysis_results[0] + 1.0) * 3.75;
    score += (analysis_results[1] + 1.0) * 3.75;
    score += (analysis_results[2] + 1.0) * 7.5;

    let mut speaker_scores: i64 = 0;
    let mut amplifier_scores: i64 = 0;
    let mut trap_note: bool = false;
    let mut climb: bool = false;
    let mut buddy: bool = false;
    let mut intake_time: f64 = 0.0;
    let mut travel_time: f64 = 0.0;
    let mut outtake_time: f64 = 0.0;
    let mut auto_preload: i64 = 0;
    let mut auto_wing: i64 = 0;
    let mut auto_center: i64 = 0;
    let mut auto_scores: i64 = 0;

    for time in &game_data {
        match time.score_type {
            0 => speaker_scores += 1,
            1 => amplifier_scores += 1,
            2 => {
                if time.intake == 1.0 {
                    trap_note = true;
                }
            },
            3 => {
                if time.intake == 1.0 {
                    climb = true;
                }
            },
            4 => {
                if time.intake == 1.0 {
                    buddy = true;
                }
            },
            5 => {
                auto_center = time.intake as i64
            },
            6 => {
                auto_wing = time.intake as i64
            },
            7 => {
                auto_preload = time.intake as i64
            },
            8 => {
                auto_scores = time.intake as i64
            }
            _ => {}
        }
        intake_time += time.intake;
        travel_time += time.travel;
        outtake_time += time.outtake;
    }

    score += auto_scores as f64 * 18.0;
    score += speaker_scores as f64 * 12.0;
    score += amplifier_scores as f64 * 4.0;

    score += real_bool_to_num(trap_note) * 6.0;
    score += real_bool_to_num(climb) * 4.0;
    score += real_bool_to_num(buddy) * 4.0;

    let fast_intake: f64;
    let fast_travel: f64;
    let fast_shoot: f64;
    let fast_cycle: f64;

    if game_data.len() > 3 {
        fast_intake = score * (100.0 / (intake_time / (game_data.len() - 3) as f64));
        fast_travel = score * (100.0 / (travel_time / (game_data.len() - 3) as f64));
        fast_shoot = score * (100.0 / (outtake_time / (game_data.len() - 3) as f64));
        fast_cycle = score * (100.0 / (intake_time + travel_time + outtake_time / (game_data.len() - 3) as f64));
    } else {
        fast_intake = 0.0;
        fast_travel = 0.0;
        fast_shoot = 0.0;
        fast_cycle = 0.0;
    }
    
    let mps_scores: Vec<f64> = vec!(
        score,
        fast_intake,
        fast_travel,
        fast_shoot,
        fast_cycle
    );

    let analysis: Vec<i64> = vec!(
        real_bool_to_num(trap_note) as i64,
        real_bool_to_num(climb) as i64,
        real_bool_to_num(buddy) as i64,
        intake_time as i64,
        travel_time as i64,
        outtake_time as i64,
        speaker_scores,
        amplifier_scores,
        score as i64,
        auto_preload,
        auto_wing,
        auto_center,
        auto_scores
    );

    let string_mps_scores: Vec<String> = mps_scores
                                            .iter()
                                            .map(|float| float.to_string())
                                            .collect();

    let string_analysis_results: Vec<String> = analysis
                                            .iter()
                                            .map(|float| float.to_string())
                                            .collect();

    Ok(AnalysisResults {
        weight: string_mps_scores.join(","),
        analysis: string_analysis_results.join(","),
    })
}
