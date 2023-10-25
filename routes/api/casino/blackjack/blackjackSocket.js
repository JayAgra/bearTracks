const suits = ['h', 'd', 'c', 's'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function newCard() {
    return { "suit": suits[Math.floor(Math.random() * suits.length)], "value": values[Math.floor(Math.random() * values.length)] };
}

async function blackjackSocket(ws, req, transactions, authDb) {
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
    game.player.score = populateCard(game.player.hand, game.player.score, "player1");
    game.player.score = populateCard(game.player.hand, game.player.score, "player2");
    game.dealer.score = populateCard(game.dealer.hand, game.dealer.score, "dealer1");
    if (game.player.score > 21) endGame();

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

    function populateCard(hand, score, target) {
        const card = newCard();
        hand.push(card);
        score = getScore(hand);
        ws.send(JSON.stringify({ card, score, target }));
        return score;
    }

    function endGame() {
        let result;
        if (game.player.score > 21) {
            result = "you bust";
        } else if (game.dealer.score > 21) {
            result = "you win- dealer bust";
        } else if (game.player.score > game.dealer.score) {
            result = "you win";
        } else if (game.player.score < game.dealer.score) {
            result = "you lose";
        } else {
            result = "tie";
        }
        ws.send(JSON.stringify({ "playerResult": result }));
        ws.close();
    }

    ws.on('message', (message) => {
        if (message == 0x30) {
            // hit
            game.player.score = populateCard(game.player.hand, game.player.score, `player${game.player.hand.length + 1}`);
            if (game.player.score > 21) {
                endGame();
            }
        } else if (message == 0x31) {
            // stand
            while (game.dealer.score < 17) {
                game.dealer.score = populateCard(game.dealer.hand, game.dealer.score, `dealer${game.dealer.hand.length + 1}`);
            }
            endGame();
        }
    });
}

module.exports = { blackjackSocket };