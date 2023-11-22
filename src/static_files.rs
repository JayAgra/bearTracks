use actix_files::NamedFile;
use actix_web::Result;
use std::path::PathBuf;

use crate::db_auth;

pub async fn static_index() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/index.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_blackjack() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/blackjack.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_browse() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/browse.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_charts() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/charts.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_create() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/create.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_detail() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/detail.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_login() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/login.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_main() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/main.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_manage(user: db_auth::User) -> Result<NamedFile, std::io::Error> {
    if user.admin == "true" {
        let path: PathBuf = "./static/manage.html".parse().unwrap();
        Ok(NamedFile::open(path)?)
    } else {
        static_login().await
    }
}

pub async fn static_manage_scouts(user: db_auth::User) -> Result<NamedFile, std::io::Error> {
    if user.admin == "true" {
        let path: PathBuf = "./static/manageScouts.html".parse().unwrap();
        Ok(NamedFile::open(path)?)
    } else {
        static_login().await
    }
}

pub async fn static_manage_team(user: db_auth::User) -> Result<NamedFile, std::io::Error> {
    if user.team_admin == 0 {
        static_login().await
    } else {
        let path: PathBuf = "./static/manageTeam.html".parse().unwrap();
        Ok(NamedFile::open(path)?)
    }
}

pub async fn static_manage_teams(user: db_auth::User) -> Result<NamedFile, std::io::Error> {
    if user.admin == "true" {
        let path: PathBuf = "./static/manageTeams.html".parse().unwrap();
        Ok(NamedFile::open(path)?)
    } else {
        static_login().await
    }
}

pub async fn static_matches() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/matches.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_point_records() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/pointRecords.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_points() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/points.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_scouts() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/scouts.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_settings() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/settings.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_spin() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/spin.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}

pub async fn static_teams() -> Result<NamedFile, std::io::Error> {
    let path: PathBuf = "./static/teams.html".parse().unwrap();
    Ok(NamedFile::open(path)?)
}