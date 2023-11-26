use actix::prelude::*;
use actix::Message;
use actix::{Actor, StreamHandler};
use actix_web::{web, error, HttpRequest, HttpResponse, Error};
use actix_web_actors::ws;
use rusqlite;
use rand::{Rng, prelude::SliceRandom};

use crate::db_auth;
use crate::db_transact;

const SPIN_THING_SPINS: [i64; 12] = [10, 20, 50, -15, -25, -35, -100, -50, 100, 250, -1000, 1250];

pub async fn spin_thing(auth_pool: &db_auth::Pool, transact_pool: &db_transact::Pool, user: db_auth::User) -> Result<String, Error> {
    let auth_pool = auth_pool.clone();
    let transact_pool = transact_pool.clone();

    let auth_conn = web::block(move || auth_pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    let transact_conn = web::block(move || transact_pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        spin_thing_process(auth_conn, transact_conn, user)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}

fn spin_thing_process(auth_conn: db_auth::Connection, transact_conn: db_transact::Connection, user: db_auth::User) -> Result<String, rusqlite::Error> {
    let mut spin: i64 = rand::thread_rng().gen_range(0..11);
    for _i in 0..3 {
        if spin >= 8 {
            spin = rand::thread_rng().gen_range(0..11);
            if spin >= 9 {
                rand::thread_rng().gen_range(0..11);
                if spin >= 10 {
                    rand::thread_rng().gen_range(0..11);
                }
            }
        }
    }

    db_auth::update_points(auth_conn, user.id, SPIN_THING_SPINS[spin as usize])?;
    db_transact::insert_transaction(transact_conn, db_transact::Transact { id: 0, user_id: user.id, trans_type: 0x1500, amount: SPIN_THING_SPINS[spin as usize], time: "".to_string() })?;

    Ok(format!("{{\"spin\": {}}}", spin))
}

const SUITS: [&str; 4] = ["h", "d", "c", "s"];
const VALUES: [&str; 13] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

#[derive(Clone, Debug)]
struct BlackjackSession {
    game: BlackjackGame,
}

#[derive(Clone, Debug)]
struct BlackjackGame {
    player: Player,
    dealer: Player,
}

#[derive(Clone, Debug)]
struct Player {
    hand: Vec<Card>,
    score: i64,
}

impl Iterator for Player {
    type Item = Card;

    fn next(&mut self) -> Option<Self::Item> {
        self.hand.pop()
    }
}

#[derive(Clone, Debug)]
struct Card {
    suit: String,
    value: String,
}

#[derive(Debug, Clone, PartialEq)]
struct ClientMessage {
    pub message_type: MessageType,
}

impl Message for ClientMessage {
    type Result = ();
}

#[derive(Debug, Clone, PartialEq)]
pub enum MessageType {
    Hit = 0x30,
    Stand = 0x31,
}

impl Message for MessageType {
    type Result = ();
}

impl MessageType {
    fn from_str(value: &str) -> Option<MessageType> {
        match value {
            "48" => Some(MessageType::Hit),
            "49" => Some(MessageType::Stand),
            _ => None,
        }
    }
}

#[derive(Clone, Debug)]
struct ResultMessage {
    result: String,
}

impl Message for ResultMessage {
    type Result = ();
}

impl Actor for BlackjackSession {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        ctx.text(format!(r#"{{"status": {}}}"#, 0x91));
        self.starting_cards(ctx);
    }
}

impl StreamHandler<Result<actix_http::ws::Message, actix_http::ws::ProtocolError>> for BlackjackSession {
    fn handle(&mut self, msg: Result<actix_http::ws::Message, actix_http::ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(actix_http::ws::Message::Text(text)) => {
                if let Some(message_type) = MessageType::from_str(text.to_string().as_str()) {
                    match message_type {
                        MessageType::Hit => {
                            let mut game_state: BlackjackSession = self.clone();
                            let new_score: i64 = self.get_card(&mut game_state.game.player.hand, "player", ctx);
                            self.game.player.hand = game_state.game.player.hand;
                            self.game.player.score = new_score;
                            if self.game.player.score >= 21 {
                                self.end_game(ctx);
                            }
                        }
                        MessageType::Stand => {
                            while self.game.dealer.score < 17 {
                                let mut game_state: BlackjackSession = self.clone();
                                let new_score: i64 = self.get_card(&mut game_state.game.dealer.hand, "dealer", ctx);
                                self.game.dealer.hand = game_state.game.dealer.hand;
                                self.game.dealer.score = new_score;
                                if self.game.player.score >= 21 {
                                    self.end_game(ctx);
                                }
                            }
                            self.end_game(ctx);
                        }
                    }
                }
            }
            Ok(actix_http::ws::Message::Binary(_)) => {}
            Ok(actix_http::ws::Message::Ping(ping)) => {
                ctx.pong(&ping);
            }
            Ok(actix_http::ws::Message::Pong(_)) => {}
            Ok(actix_http::ws::Message::Continuation(_)) => {}
            Ok(actix_http::ws::Message::Nop) => {}
            Ok(actix_http::ws::Message::Close(reason)) => {
                ctx.close(reason);
            }
            Err(err) => {
                println!("blackjack socket error: {:?}", err);
            }
        }
    }
}

impl BlackjackSession {
    fn starting_cards(&mut self, ctx: &mut ws::WebsocketContext<Self>) {
        let card1: Card = self.new_card();
        self.game.player.hand.push(card1.clone());
        self.game.player.score = self.get_score(&self.game.player.hand);
        ctx.text(format!(r#"{{"card": {{"suit": "{}", "value": "{}"}}, "target": "player1"}}"#, card1.suit, card1.value));

        let card2: Card = self.new_card();
        self.game.player.hand.push(card2.clone());
        self.game.player.score = self.get_score(&self.game.player.hand);
        ctx.text(format!(r#"{{"card": {{"suit": "{}", "value": "{}"}}, "target": "player2"}}"#, card2.suit, card2.value));

        let dealer_card: Card = self.new_card();
        self.game.dealer.hand.push(dealer_card.clone());
        self.game.dealer.score = self.get_score(&self.game.dealer.hand);
        ctx.text(format!(r#"{{"card": {{"suit": "{}", "value": "{}"}}, "target": "dealer1"}}"#, dealer_card.suit, dealer_card.value));

        if self.game.player.score > 21 {
            self.end_game(ctx);
        }
    }

    fn get_card(&mut self, hand: &mut Vec<Card>, target: &str, ctx: &mut ws::WebsocketContext<Self>) -> i64 {
        let new_card = self.new_card();
        hand.push(new_card.clone());
        let new_score: i64 = self.get_score(hand);

        if target == "player" {
            let new_game: BlackjackGame = BlackjackGame {
                player: Player {
                    hand: hand.clone(),
                    score: new_score,
                },
                dealer: self.game.dealer.clone(),
            };

            self.game = new_game;
            ctx.text(format!(r#"{{"card": {{"suit": "{}", "value": "{}"}}, "target": "{}{}"}}"#, new_card.suit, new_card.value, target, self.game.player.hand.len()));
        } else {
            let new_game: BlackjackGame = BlackjackGame {
                dealer: Player {
                    hand: hand.clone(),
                    score: new_score,
                },
                player: self.game.player.clone(),
            };

            self.game = new_game;
            ctx.text(format!(r#"{{"card": {{"suit": "{}", "value": "{}"}}, "target": "{}{}"}}"#, new_card.suit, new_card.value, target, self.game.dealer.hand.len()));
        }

        new_score
    }

    fn new_card(&self) -> Card {
        Card {
            suit: SUITS.choose(&mut rand::thread_rng()).unwrap().to_string(),
            value: VALUES.choose(&mut rand::thread_rng()).unwrap().to_string(),
        }
    }

    fn get_score(&self, hand: &Vec<Card>) -> i64 {
        let mut score: i64 = 0;
        let mut aces: i64 = 0;

        for card in hand {
            let value = &card.value;
            match value.as_str() {
                "A" => {
                    aces += 1;
                    score += 11;
                }
                "K" | "Q" | "J" => score += 10,
                _ => score += value.parse::<i64>().unwrap(),
            }
        }

        while aces > 0 && score > 21 {
            score -= 10;
            aces -= 1;
        }

        score
    }

    fn end_game(&mut self, ctx: &mut ws::WebsocketContext<Self>) {
        let result;

        if self.game.player.score > 21 {
            result = "LB".to_string();
            self.credit_loss();
        } else if self.game.dealer.score > 21 {
            result = "WD".to_string();
            self.credit_win();
        } else if self.game.player.score > self.game.dealer.score {
            result = "WN".to_string();
            self.credit_win();
        } else if self.game.player.score < self.game.dealer.score {
            result = "LS".to_string();
            self.credit_loss();
        } else {
            result = "DR".to_string();
            self.credit_tie();
        }

        ctx.text(format!(r#"{{"result": "{}"}}"#, result));
        ctx.close(Some(ws::CloseReason { code: ws::CloseCode::Normal, description: Some("".to_string()) }));
    }

    fn credit_win(&self) {
        // credit logic
    }

    fn credit_tie(&self) {
        // credit logic
    }

    fn credit_loss(&self) {
        // credit logic
    }
}

impl Handler<ResultMessage> for BlackjackSession {
    type Result = ();

    fn handle(&mut self, msg: ResultMessage, ctx: &mut Self::Context) {
        ctx.text(format!(r#"{{"result": "{}"}}"#, msg.result));
        ctx.close(Some(ws::CloseReason { code: ws::CloseCode::Normal, description: Some("".to_string()) }));
    }
}

pub async fn websocket_route(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    ws::start(BlackjackSession {
        game: BlackjackGame {
            player: Player { hand: Vec::new(), score: 0 },
            dealer: Player { hand: Vec::new(), score: 0 },
        },
    }, &req, stream)
}