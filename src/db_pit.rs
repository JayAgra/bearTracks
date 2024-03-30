pub struct IncomingPitForm {
    event: String,
    season: i64,
    team: i64,
    game: String,
    images: String,
}

pub struct PitFormGame2024 {
    swerve_drive: bool,
    ground_intake: bool,
    speaker: bool,
    amplifier: bool,
    auto_scores: i64,
    cycles_est: i64,
    details: String,
}

pub struct PitScoutingEntry {
    id: i64,
    event: String,
    season: i64,
    team: i64,
    game: String,
    images: String,
    user_id: i64,
    name: String,
    from_team: i64,
}