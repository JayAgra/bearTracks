use a2::{Client, DefaultNotificationBuilder};
use actix_web::{web, Error};
use serde::Deserialize;
use std::{collections::HashSet, sync::Arc};
use tokio::sync::Mutex;

use crate::db_main;
use crate::db_auth;

pub async fn thank_event_scouts(pool: &db_main::Pool, auth_pool: &db_auth::Pool, path: web::Path<String>, client: Arc<Mutex<Client>>) -> Result<bool, Error> {
    let submissions: Result<Vec<db_main::Main>, Error> = db_main::execute(pool, db_main::MainData::BriefEvent, path.clone().into()).await;
    match submissions {
        Ok(event_submissions) => {
            let count = event_submissions.len();
            let args = path.split("/").collect::<Vec<_>>(); // season 0, event 1
            let participating_users: Vec<i64> = event_submissions.iter().filter_map(|submission| {
                if let db_main::Main::Brief { user_id, .. } = submission {
                    Some(*user_id)
                } else {
                    None
                }
            }).collect();
            let unique_ids: HashSet<_> = participating_users.into_iter().collect();
            let unique_ids_vec: Vec<i64> = unique_ids.into_iter().collect();
            let message: String = format!("Thank you for using bearTracks at {} {}! A total of {} match scouting data forms were submitted, from {} scouts.", args.get(1).unwrap_or(&"default"), args.get(0).unwrap_or(&"default"), count, unique_ids_vec.len());
            let str_message: &str = message.as_str();
            let builder = DefaultNotificationBuilder::new()
                .set_title("Event Conclusion")
                .set_body(str_message)
                .set_sound("default")
                .set_badge(0u32);
            for user in unique_ids_vec {
                let _notification_send = db_auth::send_notification_to_user(&auth_pool, user, builder.clone(), client.lock().await).await;
            }
        }
        Err(e) => {
            return Err(e)
        }
    }
    
    Ok(true)
}

#[derive(Deserialize)]
pub struct NotificationSendTeam {
    pub team: i64,
    pub title: String,
    pub body: String,
}

pub async fn send_general_notification_to_team_members(auth_pool: &db_auth::Pool, data: web::Json<NotificationSendTeam>, client: Arc<Mutex<Client>>) -> Result<bool, Error> {
    let team_members = db_auth::execute_get_users_mgmt(&auth_pool.clone(), db_auth::UserQueryType::Team, db_auth::User { id: 0, username: "".to_string(), current_challenge: "".to_string(), full_name: "".to_string(), team: 0, data: "".to_string(), pass_hash: "".to_string(), admin: "".to_string(), team_admin: data.team, access_ok: "".to_string(), score: 0 }).await;
    match team_members {
        Ok(members) => {
            let builder = DefaultNotificationBuilder::new()
                .set_title(&data.title)
                .set_body(&data.body)
                .set_sound("default")
                .set_badge(0u32);
            for user in members {
                let _notification_send = db_auth::send_notification_to_user(&auth_pool, user.id, builder.clone(), client.lock().await).await;
            }
        }
        Err(e) => {
            return Err(e)
        }
    }

    Ok(true)
}

pub async fn send_general_notification_to_all(auth_pool: &db_auth::Pool, data: web::Json<NotificationSendTeam>, client: Arc<Mutex<Client>>) -> Result<bool, Error> {
    let all_members = db_auth::execute_scores(&auth_pool.clone(), db_auth::AuthData::GetUserScores).await;
    match all_members {
        Ok(members) => {
            let builder = DefaultNotificationBuilder::new()
                .set_title(&data.title)
                .set_body(&data.body)
                .set_sound("default")
                .set_badge(0u32);
            for user in members {
                let _notification_send = db_auth::send_notification_to_user(&auth_pool, user.id, builder.clone(), client.lock().await).await;
            }
        }
        Err(e) => {
            return Err(e)
        }
    }

    Ok(true)
}

pub async fn send_general_notification_to_user(auth_pool: &db_auth::Pool, data: web::Json<NotificationSendTeam>, client: Arc<Mutex<Client>>) -> Result<bool, Error> {
    let builder = DefaultNotificationBuilder::new()
        .set_title(&data.title)
        .set_body(&data.body)
        .set_sound("default")
        .set_badge(0u32);
    let _notification_send = db_auth::send_notification_to_user(&auth_pool, data.team, builder.clone(), client.lock().await).await;

    Ok(true)
}