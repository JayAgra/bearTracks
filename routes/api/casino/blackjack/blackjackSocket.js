function blackjackSocket(ws, req, db) {
    var cards = [];
    // 0x10 - send user id
    ws.send(0x10);
    ws.on("message", (message) => {
        if (Number(message.split("$")[0]) === 0x11) {
            // 0x12 - recd user id, checking gamble
            // for debug i guess
            ws.send(0x12);
            let okToGamble = db.get(
                "SELECT score FROM scouts WHERE userId=?",
                [message.toString()],
                (err, result) => {
                    return result.score > -2000;
                }
            );

            if (!okToGamble) {
                // 0xE1 - not allowed to gamble
                ws.send(0xe1);
                ws.close();
            }
            // 0x13 - user ok to gamble
            ws.send(0x13);
        } else if (message === 0x31) {
            // 0x31 - ready to play, send cards

            cards.push(possibleCards[Math.floor(Math.random() * 51)]);
            cards.push(possibleCards[Math.floor(Math.random() * 51)]);
            cards.push(possibleCards[Math.floor(Math.random() * 51)]);

            // 0x32 - sending cards
            ws.send(0x32 + "%%%" + `{"dealt": "card-${cards[0].suit}_${cards[0].value}.png","player0": "card-${cards[1].suit}_${cards[1].value}.png","player1": "card-${cards[2].suit}_${cards[2].value}.png"`);
        }
    });
}

module.exports = { blackjackSocket };