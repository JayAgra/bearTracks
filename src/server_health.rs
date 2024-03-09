use actix_web::web;
use serde::Serialize;
use std::{env, sync::RwLock};
use sysinfo::SystemExt;

use crate::Sessions;

#[derive(Serialize)]
pub struct HealthData {
    pub team: String,
    pub hostname: String,
    pub total_mem_kb: u64,
    pub used_mem_kb: u64,
    pub total_swap_kb: u64,
    pub used_swap_kb: u64,
    pub last_boot_time_sec: u64,
    pub uptime_sec: u64,
    pub load_avg_one: f64,
    pub load_avg_five: f64,
    pub load_avg_fifteen: f64,
    pub sessions_size: i64,
}

pub fn get_server_health(session: web::Data<RwLock<Sessions>>) -> HealthData {
    let mut system = sysinfo::System::new_all();
    system.refresh_all();
    HealthData {
        team: env::var("MY_TEAM").unwrap_or_else(|_| "766".to_string()),
        hostname: env::var("HOSTNAME").unwrap_or_else(|_| "localhost".to_string()),
        total_mem_kb: system.get_total_memory(),
        used_mem_kb: system.get_used_memory(),
        total_swap_kb: system.get_total_swap(),
        used_swap_kb: system.get_used_swap(),
        last_boot_time_sec: system.get_boot_time(),
        uptime_sec: system.get_uptime(),
        load_avg_one: system.get_load_average().one,
        load_avg_five: system.get_load_average().five,
        load_avg_fifteen: system.get_load_average().fifteen,
        sessions_size: session.read().unwrap().user_map.values().len() as i64
    }
}
