use actix::Message;
use actix::{Actor, StreamHandler};
use actix_web::{web, error, HttpRequest, HttpResponse, Error};
use actix_web_actors::ws;
use rusqlite;
use rand::{Rng, prelude::SliceRandom};
use tokio;

use crate::{db_auth, Databases};
use crate::db_transact;

const SPIN_THING_SPINS: [i64; 12] = [10, 20, 50, -15, -25, -35, -100, -50, 100, 250, -1000, 1250];

pub async fn spin_thing(auth_pool: &db_auth::Pool, transact_pool: &db_transact::Pool, user: db_auth::User) -> Result<String, Error> {
    // we need access to auth and transact because we're inserting a transaction
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
    // rig the spin
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

    // insert transaction & update points
    db_auth::update_points(auth_conn, user.id, SPIN_THING_SPINS[spin as usize])?;
    db_transact::insert_transaction(transact_conn, db_transact::Transact { id: 0, user_id: user.id, trans_type: 0x1500, amount: SPIN_THING_SPINS[spin as usize], time: "".to_string() })?;

    // send spin to client
    Ok(format!("{{\"spin\": {}}}", spin))
}

//
// blackjack
//

// suit and value array constants
const SUITS: [&str; 4] = ["h", "d", "c", "s"];
const VALUES: [&str; 13] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

#[derive(Clone, Debug)]
struct BlackjackSession {
    game: BlackjackGame,
    user_id: i64,
    auth_db: db_auth::Pool,
    transact_db: db_transact::Pool
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
    // convert string to a message type enumerator
    fn from_str(value: &str) -> Option<MessageType> {
        match value {
            "48" => Some(MessageType::Hit),
            "49" => Some(MessageType::Stand),
            _ => None,
        }
    }
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
            // text messages
            Ok(actix_http::ws::Message::Text(text)) => {
                // use the from_str implemented above to convert the message to a message type
                if let Some(message_type) = MessageType::from_str(text.to_string().as_str()) {
                    match message_type {
                        // client wants to hit
                        MessageType::Hit => {
                            // clone the game
                            let mut game_state: BlackjackSession = self.clone();
                            // add a new card to hand, and save the new score to variable
                            let new_score: i64 = self.get_card(&mut game_state.game.player.hand, "player", ctx);
                            // update actual instance's player hand and score
                            self.game.player.hand = game_state.game.player.hand;
                            self.game.player.score = new_score;
                            // end game if player score is above or equal to 21
                            if self.game.player.score >= 21 {
                                self.end_game(ctx);
                            }
                        }
                        // client wants to stand
                        MessageType::Stand => {
                            // repeat until the dealer has more than 17
                            while self.game.dealer.score < 17 {
                                // clone game
                                let mut game_state: BlackjackSession = self.clone();
                                // draw new dealer card and save score
                                let new_score: i64 = self.get_card(&mut game_state.game.dealer.hand, "dealer", ctx);
                                // update actual game's variables
                                self.game.dealer.hand = game_state.game.dealer.hand;
                                self.game.dealer.score = new_score;
                            }
                            self.end_game(ctx);
                        }
                    }
                }
            }
            // don't process any other messages
            Ok(actix_http::ws::Message::Binary(_)) => {}
            // but respond to pings
            Ok(actix_http::ws::Message::Ping(ping)) => {
                ctx.pong(&ping);
            }
            Ok(actix_http::ws::Message::Pong(_)) => {}
            Ok(actix_http::ws::Message::Continuation(_)) => {}
            Ok(actix_http::ws::Message::Nop) => {}
            // and close if client closes
            Ok(actix_http::ws::Message::Close(reason)) => {
                ctx.close(reason);
            }
            // print errors for debug
            Err(err) => {
                println!("blackjack socket error: {:?}", err);
            }
        }
    }
}

impl BlackjackSession {
    // draw starting cards
    fn starting_cards(&mut self, ctx: &mut ws::WebsocketContext<Self>) {
        // TODO put bet subtraction here
        // first player card
        let card1: Card = self.new_card();
        // add to player hand
        self.game.player.hand.push(card1.clone());
        // update player score
        self.game.player.score = self.get_score(&self.game.player.hand);
        // send card to client
        ctx.text(format!(r#"{{"card": {{"suit": "{}", "value": "{}"}}, "target": "player1"}}"#, card1.suit, card1.value));

        // second player card
        let card2: Card = self.new_card();
        self.game.player.hand.push(card2.clone());
        self.game.player.score = self.get_score(&self.game.player.hand);
        ctx.text(format!(r#"{{"card": {{"suit": "{}", "value": "{}"}}, "target": "player2"}}"#, card2.suit, card2.value));

        // first dealer card
        let dealer_card: Card = self.new_card();
        // add to dealer hand
        self.game.dealer.hand.push(dealer_card.clone());
        // update dealer score
        self.game.dealer.score = self.get_score(&self.game.dealer.hand);
        // first dealer card may be sent to client
        ctx.text(format!(r#"{{"card": {{"suit": "{}", "value": "{}"}}, "target": "dealer1"}}"#, dealer_card.suit, dealer_card.value));

        // end if either player got blackjack
        if self.game.player.score == 21 || self.game.dealer.score == 21 {
            self.end_game(ctx);
        }
    }

    // get new card and return current score
    fn get_card(&mut self, hand: &mut Vec<Card>, target: &str, ctx: &mut ws::WebsocketContext<Self>) -> i64 {
        // draw card
        let new_card = self.new_card();
        // insert into hand
        hand.push(new_card.clone());
        // get score
        let new_score: i64 = self.get_score(hand);

        // different logic for player/dealer
        if target == "player" {
            // update game instance with new scores and hands
            // i don't know id this is needed
            self.game.player.hand = hand.clone();
            self.game.player.score = new_score;
            // send card to client
            ctx.text(format!(r#"{{"card": {{"suit": "{}", "value": "{}"}}, "target": "{}{}"}}"#, new_card.suit, new_card.value, target, self.game.player.hand.len()));
        } else {
            // update game instance
            self.game.dealer.hand = hand.clone();
            self.game.dealer.score = new_score;
            // send dealer card to client
            // this is safe because the dealer only draws once game is over
            ctx.text(format!(r#"{{"card": {{"suit": "{}", "value": "{}"}}, "target": "{}{}"}}"#, new_card.suit, new_card.value, target, self.game.dealer.hand.len()));
        }

        new_score
    }

    // new card function
    fn new_card(&self) -> Card {
        Card {
            // pick random suit
            suit: SUITS.choose(&mut rand::thread_rng()).unwrap().to_string(),
            // pick random value
            value: VALUES.choose(&mut rand::thread_rng()).unwrap().to_string(),
        }
    }

    // calculate score
    fn get_score(&self, hand: &Vec<Card>) -> i64 {
        // mutable variables for score and ace count
        let mut score: i64 = 0;
        let mut aces: i64 = 0;

        // iterate through cards
        for card in hand {
            // value is a reference to the card's value
            let value = &card.value;
            match value.as_str() {
                // increment aces and score
                "A" => {
                    aces += 1;
                    score += 11;
                }
                // add 10 for face cards
                "K" | "Q" | "J" => score += 10,
                // parse &str as i64 and add to total
                _ => score += value.parse::<i64>().unwrap(),
            }
        }

        // ace logic
        // while there is at least one ace and the score is over 21, change an ace value to 1
        while aces > 0 && score > 21 {
            score -= 10;
            aces -= 1;
        }

        // return the score
        score
    }

    // game end logic
    #[tokio::main]
    async fn end_game(&mut self, ctx: &mut ws::WebsocketContext<Self>) {
        // result string that will be sent to client
        let result: String;

        // if player busts
        if self.game.player.score > 21 {
            result = "LB".to_string();
            ctx.text(self.credit_points(-10).await.unwrap_or("bad".to_string()));
        // if dealer busts
        } else if self.game.dealer.score > 21 {
            result = "WD".to_string();
            ctx.text(self.credit_points(10).await.unwrap_or("bad".to_string()));
        // if player score is more than dealer score
        } else if self.game.player.score > self.game.dealer.score {
            result = "WN".to_string();
            ctx.text(self.credit_points(10).await.unwrap_or("bad".to_string()));
        // if dealer score is more than player score
        } else if self.game.player.score < self.game.dealer.score {
            result = "LS".to_string();
            ctx.text(self.credit_points(-10).await.unwrap_or("bad".to_string()));
        // draw
        } else {
            result = "DR".to_string();
            ctx.text(self.credit_points(0).await.unwrap_or("bad".to_string()));
        }

        // send result
        ctx.text(format!(r#"{{"result": "{}"}}"#, result));
        // close socket
        ctx.close(Some(ws::CloseReason { code: ws::CloseCode::Normal, description: Some("".to_string()) }));
    }

    async fn credit_points(&self, amount: i64) -> Result<String, Error> {
        let auth_db_clone = self.auth_db.clone();
        let transact_db_clone = self.transact_db.clone();
        let user_id_clone = self.user_id.clone();

        let auth_conn = web::block(move || auth_db_clone.get())
            .await?
            .map_err(error::ErrorInternalServerError)?;

        let transact_conn = web::block(move || transact_db_clone.get())
            .await?
            .map_err(error::ErrorInternalServerError)?;

        web::block(move || {
            credit_points(auth_conn, transact_conn, user_id_clone, amount)
        })
        .await?
        .map_err(error::ErrorInternalServerError)
    }

}

fn credit_points(auth_conn: db_auth::Connection, transact_conn: db_transact::Connection, user_id: i64, amount: i64) -> Result<String, rusqlite::Error> {
    db_auth::update_points(auth_conn, user_id, amount)?;
    db_transact::insert_transaction(
        transact_conn, 
        db_transact::Transact {
            id: 0,
            user_id,
            trans_type: 0x1502,
            amount,
            time: "".to_string()
        }
    )?;

    Ok("ok".to_string())
}

// websocket route
pub async fn websocket_route(req: HttpRequest, stream: web::Payload, db: web::Data<Databases>, user: db_auth::User) -> Result<HttpResponse, Error> {
    // start websocket connection with clean game state
    ws::start(BlackjackSession {
        game: BlackjackGame {
            player: Player {
                hand: Vec::new(),
                score: 0
            },
            dealer: Player {
                hand: Vec::new(),
                score: 0
            },
        },
        user_id: user.id,
        auth_db: db.auth.clone(),
        transact_db: db.transact.clone()
    }, &req, stream)
}