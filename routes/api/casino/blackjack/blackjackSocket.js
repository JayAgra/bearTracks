const possibleCards = [
    { value: "A", suit: "h" }, { value: 2, suit: "h" },{ value: 3, suit: "h" },{ value: 4, suit: "h" },{ value: 5, suit: "h" },{ value: 6, suit: "h" },{ value: 7, suit: "h" },{ value: 8, suit: "h" },{ value: 9, suit: "h" },{ value: 10, suit: "h" },{ value: "J", suit: "h" },{ value: "K", suit: "h" },{ value: "Q", suit: "h" },
    { value: "A", suit: "d" }, { value: 2, suit: "d" },{ value: 3, suit: "d" },{ value: 4, suit: "d" },{ value: 5, suit: "d" },{ value: 6, suit: "d" },{ value: 7, suit: "d" },{ value: 8, suit: "d" },{ value: 9, suit: "d" },{ value: 10, suit: "d" },{ value: "J", suit: "d" },{ value: "K", suit: "d" },{ value: "Q", suit: "d" },
    { value: "A", suit: "s" }, { value: 2, suit: "s" },{ value: 3, suit: "s" },{ value: 4, suit: "s" },{ value: 5, suit: "s" },{ value: 6, suit: "s" },{ value: 7, suit: "s" },{ value: 8, suit: "s" },{ value: 9, suit: "s" },{ value: 10, suit: "s" },{ value: "J", suit: "s" },{ value: "K", suit: "s" },{ value: "Q", suit: "s" },
    { value: "A", suit: "c" }, { value: 2, suit: "c" },{ value: 3, suit: "c" },{ value: 4, suit: "c" },{ value: 5, suit: "c" },{ value: 6, suit: "c" },{ value: 7, suit: "c" },{ value: 8, suit: "c" },{ value: 9, suit: "c" },{ value: 10, suit: "c" },{ value: "J", suit: "c" },{ value: "K", suit: "c" },{ value: "Q", suit: "c" }
];

function blackjackSocket(ws, req, transactions, authDb) {
    var cards = {
        "player": [],
        "dealer": []
    }
    var sums = {
        "aceLow": {
            "player": 0,
            "dealer": 0,
        },
        "aceHigh": {
            "player": 0,
            "dealer": 0
        }
    }
    var claimedUserId = "";
    ws.on("message", (message) => {
        if (Number(message.split("$")[0]) === 0x11) {
            // 0x12 - recd user id, checking gamble
            // for debug i guess
            ws.send(0x12);
            claimedUserId = message.toString();
            let okToGamble = authDb.get("SELECT score FROM users WHERE userId=?", [claimedUserId], (err, result) => {
                return result.score > -34359738368;
            });

            if (!okToGamble) {
                // 0xE1 - not allowed to gamble
                ws.send(0xe1);
                ws.close();
            }
            // 0x13 - user ok to gamble
            ws.send(0x13);
        } else if (message === 0x31) {
            // 0x31 - ready to play, send cards

            cards.player.push(possibleCards[Math.floor(Math.random() * 51)]);
            cards.player.push(possibleCards[Math.floor(Math.random() * 51)]);
            cards.dealer.push(possibleCards[Math.floor(Math.random() * 51)]);
            cards.dealer.push(possibleCards[Math.floor(Math.random() * 51)]);

            sums.aceLow.player += typeof cards.player[0].value === "string" ? 10 : cards.player[0].value;
            sums.aceLow.player += typeof cards.player[1].value === "string" ? 10 : cards.player[1].value;
            sums.aceLow.dealer += typeof cards.dealer[0].value === "string" ? 10 : cards.dealer[0].value;
            sums.aceLow.dealer += typeof cards.dealer[1].value === "string" ? 10 : cards.dealer[1].value;

            sums.aceHigh.player += typeof cards.player[0].value === "string" ? cards.player[0].value === "A" ? 11 : 10 : cards.player[0].value;
            sums.aceHigh.player += typeof cards.player[1].value === "string" ? cards.player[1].value === "A" ? 11 : 10 : cards.player[1].value;
            sums.aceHigh.dealer += typeof cards.dealer[0].value === "string" ? cards.dealer[0].value === "A" ? 11 : 10 : cards.dealer[0].value;
            sums.aceHigh.dealer += typeof cards.dealer[1].value === "string" ? cards.dealer[1].value === "A" ? 11 : 10 : cards.dealer[1].value;

            // 0x32 - sending cards
            ws.send(0x32 + "%%%" + `{"dealer1": "card-${cards.dealer[0].suit}_${cards.dealer[0].value}.png","player1": "card-${cards.player[0].suit}_${cards.player[0].value}.png","player2": "card-${cards.player[1].suit}_${cards.player[1].value}.png"}`);

            if (sums.aceHigh.player === 21 && sums.aceHigh.dealer !== 21) {
                // win
                ws.send(0x99);
                // TODO credit points here
            } else if (sums.aceHigh.player === 21 && sums.aceHigh.dealer === 21) {

            }
        } else if (message === 0x40) {
            // 0x40 - hit
            cards.player.push(possibleCards[Math.floor(Math.random() * 51)]);

            sums.aceLow.player += typeof cards.player[cards.player.length - 1].value === "string" ? 10 : cards.player[cards.player.length - 1].value;
            sums.aceHigh.player += typeof cards.player[cards.player.length - 1].value === "string" ? cards.player[cards.player.length - 1].value === "A" ? 11 : 10 : cards.player[cards.player.length - 1].value;

            ws.send(0x33 + "%%%" + `{"id": "player${cards.player.length}","player${cards.player.length}": "card-${cards.player[cards.player.length - 1].suit}_${cards.dealer[cards.player.length - 1].value}.png"}`);

            if (sums.aceLow.player === 21 || sums.aceHigh.player === 21) {
                // TODO credit points here
                ws.send(0x99);
                // WIN
            } else if (sums.aceLow.player > 21) {
                // TODO credit points here
                ws.send(0x97);
                // TIE
            }
        } else if (message === 0x41) {
            // 0x41 - stand
            while (sums.aceLow.dealer < 17) {
                cards.dealer.push(possibleCards[Math.floor(Math.random() * 51)]);
                sums.aceLow.dealer += typeof cards.dealer[cards.dealer.length - 1].value === "string" ? 10 : cards.dealer[cards.dealer.length - 1].value;
                sums.aceHigh.dealer += typeof cards.dealer[cards.dealer.length - 1].value === "string" ? cards.dealer[cards.dealer.length - 1].value === "A" ? 11 : 10 : cards.dealer[cards.dealer.length - 1].value;
            }

            const results = {
                "player": {
                    "low": Math.abs(sums.aceLow.player - 21),
                    "high": Math.abs(sums.aceHigh.player - 21)
                },
                "dealer": {
                    "low": Math.abs(sums.aceLow.dealer - 21),
                    "high": Math.abs(sums.aceHigh.dealer - 21)
                }
            }
            if (Math.min(results.player.low, results.player.high) < Math.min(results.dealer.low, results.dealer.high)) {
                authDb.run("UPDATE users SET score = score + 10 WHERE id = ?", [claimedUserId], (err) => {});
                transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [claimedUserId, 0x1502, 10], (err) => {});
                ws.send(0x99);
            } else if (Math.min(results.player.low, results.player.high) === Math.min(results.dealer.low, results.dealer.high)) {
                transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [claimedUserId, 0x1502, 0], (err) => {});
                ws.send(0x97);
            } else {
                authDb.run("UPDATE users SET score = score - 10 WHERE id = ?", [claimedUserId], (err) => {});
                transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [claimedUserId, 0x1502, -10], (err) => {});
                ws.send(0x98);
            }
        }
    });
}

module.exports = { blackjackSocket };