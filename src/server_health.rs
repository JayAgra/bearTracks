use std::sync::RwLock;
use actix_web::web;
use serde::Serialize;

use crate::Sessions;

#[derive(Serialize)]
pub struct HealthData {
    pub sessions_size: i64
}

pub fn get_server_health(session: web::Data<RwLock<Sessions>>) -> HealthData {
    HealthData {
        sessions_size: session.read().unwrap().user_map.len() as i64
    }
}