function newCard(req, res) {
    // no aces!!
    const possibleCards = [
        { value: 2, suit: "h" },{ value: 3, suit: "h" },{ value: 4, suit: "h" },{ value: 5, suit: "h" },{ value: 6, suit: "h" },{ value: 7, suit: "h" },{ value: 8, suit: "h" },{ value: 9, suit: "h" },{ value: 10, suit: "h" },{ value: "J", suit: "h" },{ value: "Q", suit: "h" },{ value: "K", suit: "h" },
        { value: 2, suit: "d" },{ value: 3, suit: "d" },{ value: 4, suit: "d" },{ value: 5, suit: "d" },{ value: 6, suit: "d" },{ value: 7, suit: "d" },{ value: 8, suit: "d" },{ value: 9, suit: "d" },{ value: 10, suit: "d" },{ value: "J", suit: "d" },{ value: "Q", suit: "d" },{ value: "K", suit: "d" },
        { value: 2, suit: "s" },{ value: 3, suit: "s" },{ value: 4, suit: "s" },{ value: 5, suit: "s" },{ value: 6, suit: "s" },{ value: 7, suit: "s" },{ value: 8, suit: "s" },{ value: 9, suit: "s" },{ value: 10, suit: "s" },{ value: "J", suit: "s" },{ value: "Q", suit: "s" },{ value: "K", suit: "s" },
        { value: 2, suit: "c" },{ value: 3, suit: "c" },{ value: 4, suit: "c" },{ value: 5, suit: "c" },{ value: 6, suit: "c" },{ value: 7, suit: "c" },{ value: 8, suit: "c" },{ value: 9, suit: "c" },{ value: 10, suit: "c" },{ value: "J", suit: "c" },{ value: "Q", suit: "c" },{ value: "K", suit: "c" }
    ];
    var cards = [];
    var cardValue = 0;
    cards.push(possibleCards[Math.floor(Math.random() * 47)]);
    if (typeof cards[0].value !== "number") {
        cardValue = 10;
    } else {
        cardValue = cards[0].value;
    }
    res.status(200).json(
        `{"card": "card-${cards[0].suit}_${cards[0].value}.png", "cardValue": ${cardValue}}`
    );
}

module.exports = { newCard };