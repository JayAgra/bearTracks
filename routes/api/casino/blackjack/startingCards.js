const crypto = require("crypto");

async function startingCards(req, res, db, possibleCards, casinoToken) {
    var cards = [];
    var cardValues = 0;
    var numOfAces = 0;
    cards.push(possibleCards[Math.floor(Math.random() * 51)]);
    cards.push(possibleCards[Math.floor(Math.random() * 51)]);
    cards.push(possibleCards[Math.floor(Math.random() * 51)]);
    // prevent cards from being duplicated
    if (cards[0] == cards[1] || cards[1] == cards[2] || cards[0] == cards[2]) {
        while (cards[0] == cards[1] || cards[1] == cards[2] || cards[0] == cards[2]) {
            if (cards[0] == cards[1] || cards[1] == cards[2] || cards[0] == cards[2]) {
                cards = [];
                cards.push(possibleCards[Math.floor(Math.random() * 51)]);
                cards.push(possibleCards[Math.floor(Math.random() * 51)]);
                cards.push(possibleCards[Math.floor(Math.random() * 51)]);
            } else {
                break;
            }
        }
    }

    for (var i = 1; i < 3; i++) {
        if (typeof cards[i].value !== "number") {
            if (cards[i].value === "A") {
                numOfAces = numOfAces + 1;
            } else {
                cardValues = cardValues + 10;
            }
        } else {
            cardValues = cardValues + cards[i].value;
        }
    }

    function findDealerTotal() {
        if (typeof cards[0].value !== "number") {
            return 10;
        } else {
            return cards[0].value;
        }
    }

    let pointStmt = `UPDATE scouts SET score = score - 10 WHERE discordID=?`;
    let pointValues = [req.user.id];
    db.run(pointStmt, pointValues, (err) => {
        if (err) {
            res.status(500).send("" + 0x1f42);
            return;
        }
    });
    let stmt = `SELECT score FROM scouts WHERE discordID=?`;
    let values = [req.user.id];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("" + 0x1f41);
            return;
        } else {
            res.status(200).json(
                `{"dealt": "card-${cards[0].suit}_${cards[0].value}.png","player0": "card-${cards[1].suit}_${cards[1].value}.png","player1": "card-${cards[2].suit}_${cards[2].value}.png","playerTotal": ${cardValues}, "dealerTotal": ${findDealerTotal()},"casinoToken": "${crypto.createHash('sha1').update(casinoToken + req.user.id + dbQueryResult.score).digest('hex')}","aces": ${numOfAces}}`
            );
        }
    });
}

module.exports = { startingCards };