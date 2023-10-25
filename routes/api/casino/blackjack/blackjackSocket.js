const suits = ['h', 'd', 'c', 's'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const dealerValues = ['2', '3', '4', '5', '6', '7', '8', '9', 'A'];

function newCard() {
    return { "suit": suits[Math.floor(Math.random() * 4)], "value": values[Math.floor(Math.random() * 13)] };
}

function newDealerCard() {
    return { "suit": suits[Math.floor(Math.random() * 4)], "value": dealerValues[Math.floor(Math.random() * 9)] };
}

function blackjackSocket(ws, req, transactions, authDb) {
    const user = {
        "key": req.cookies.key,
        "id": "0"
    }

    var game = {
        "player": {
            "hand": [],
            "score": 0
        },
        "dealer": {
            "hand": [],
            "score": 0
        }
    }

    authDb.get("SELECT * FROM keys WHERE key=? LIMIT 1", [req.cookies.key], (err, result) => {
        if (err || !result || Number(result.expires) < Date.now()) {
            ws.send(JSON.stringify({ "status": 0x90 }));
            ws.close();
            return;
        } else {
            user.id = result.userId;
            authDb.get("SELECT id, score FROM users WHERE id=?", [user.id], (err, result) => {
                if (err || !result || result.score < -2000) {
                    ws.send(JSON.stringify({ "status": 0x90 }));
                    ws.close();
                    return;
                } else {
                    authDb.run("UPDATE users SET score = score - 10 WHERE id=?", [user.id], (err) => {});
                    transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [user.id, 0x1502, -10], (err) => {});
                    ws.send(JSON.stringify({ "status": 0x91 }));
                    game.player.score = populateCard(game.player.hand, game.player.score, "player1");
                    game.player.score = populateCard(game.player.hand, game.player.score, "player2");
                    game.dealer.score = populateCard(game.dealer.hand, game.dealer.score, "dealer1");
                    if (game.player.score > 21) endGame();
                }
            });
        }
    });

    function getScore(hand) {
        let score = 0;
        let aces = 0;
        for (const card of hand) {
            const value = card.value;
            if (value === "A") {
                aces++;
                score += 11;
            } else if (["K", "Q", "J"].includes(value)) {
                score += 10;
            } else {
                score += parseInt(value, 10);
            }
        }
        while (aces > 0 && score > 21) {
            score -= 10;
            aces--;
        }
        return score;
    }

    function populateCard(hand, score, target, rigged) {
        var card;
        if (rigged) {
            card = newDealerCard();
        } else {
            card = newCard();
        }
        hand.push(card);
        score = getScore(hand);
        ws.send(JSON.stringify({ card, score, target }));
        return score;
    }

    function creditWin() {
        authDb.run("UPDATE users SET score = score + 20 WHERE id=?", [user.id], (err) => {});
        transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [user.id, 0x1503, 20], (err) => {});
    }

    function creditTie() {
        authDb.run("UPDATE users SET score = score + 10 WHERE id=?", [user.id], (err) => {});
        transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [user.id, 0x1504, 10], (err) => {});
    }

    function creditLoss() {
        transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [user.id, 0x1505, 0], (err) => {});
    }

    function endGame() {
        let result;
        if (game.player.score > 21) {
            result = "you bust";
            creditLoss();
        } else if (game.dealer.score > 21) {
            result = "you win- dealer bust";
            creditWin();
        } else if (game.player.score > game.dealer.score) {
            result = "you win";
            creditWin();
        } else if (game.player.score < game.dealer.score) {
            result = "you lose";
            creditLoss();
        } else {
            result = "tie";
            creditTie();
        }
        ws.send(JSON.stringify({ "result": result }));
        ws.close();
        return;
    }

    ws.on('message', (message) => {
        if (message == 0x30) {
            // hit
            game.player.score = populateCard(game.player.hand, game.player.score, `player${game.player.hand.length + 1}`, false);
            if (game.player.score > 21) {
                endGame();
            }
        } else if (message == 0x31) {
            // stand
            while (game.dealer.score < 17) {
                game.dealer.score = populateCard(game.dealer.hand, game.dealer.score, `dealer${game.dealer.hand.length + 1}`, true);
            }
            endGame();
        }
    });
}

module.exports = { blackjackSocket };