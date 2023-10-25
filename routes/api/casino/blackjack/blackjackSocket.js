const suits = ['h', 'd', 'c', 's'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

async function blackjackSocket(ws, req, transactions, authDb) {
    let playerHand = [];
    let dealerHand = [];
    let playerScore = 0;
    let dealerScore = 0;
    playerScore = sendCardAndUpdateScore(playerHand, playerScore, "player1");
    playerScore = sendCardAndUpdateScore(playerHand, playerScore, "player2");
    dealerScore = sendCardAndUpdateScore(dealerHand, dealerScore, "dealer1");

    function calculateScore(hand) {
        let score = 0;
        let numAces = 0;

        for (const card of hand) {
            const value = card.value;
            if (value === "A") {
                numAces++;
                score += 11;
            } else if (["K", "Q", "J"].includes(value)) {
                score += 10;
            } else {
                score += parseInt(value, 10);
            }
        }

        while (numAces > 0 && score > 21) {
            score -= 10;
            numAces--;
        }

        return score;
    }

    function sendCardAndUpdateScore(hand, score, target) {
        const card = getRandomCard();
        hand.push(card);
        score = calculateScore(hand);
        const response = { card, score, target };
        ws.send(JSON.stringify(response));
        return score;
    }

    function endGame() {
        let playerResult, dealerResult;
        if (playerScore > 21) {
            playerResult = "you bust";
        } else if (dealerScore > 21) {
            dealerResult = "dealer bust";
        } else if (playerScore > dealerScore) {
            playerResult = "you win";
        } else if (playerScore < dealerScore) {
            dealerResult = "dealer win";
        } else {
            playerResult = "tie";
            dealerResult = "tie";
        }
        ws.send(JSON.stringify({ playerResult, dealerResult }));
        ws.close();
    }

    ws.on('message', (message) => {
        if (message === 'hit') {
            playerScore = sendCardAndUpdateScore(playerHand, playerScore, `player${playerHand.length + 1}`);
            if (playerScore > 21) {
                endGame();
            }
        } else if (message === 'stand') {
            while (dealerScore < 17) {
                dealerScore = sendCardAndUpdateScore(dealerHand, dealerScore, `dealer${dealerHand.length + 1}`);
            }
            endGame();
        }
    });
}

function getRandomCard() {
    const randomSuit = suits[Math.floor(Math.random() * suits.length)];
    const randomValue = values[Math.floor(Math.random() * values.length)];
    return { suit: randomSuit, value: randomValue };
}



module.exports = { blackjackSocket };