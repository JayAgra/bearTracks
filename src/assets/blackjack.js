/*jslint browser: true, es6*/
const waitMs = (ms) => new Promise((res) => setTimeout(res, ms));
function goToHome() {
    window.location.href = "/points";
}

window.disableInputs = false;

var blackjackSocket;

function startBlackjack() {
    setupBoard();

    blackjackSocket = new WebSocket("/api/casino/blackjack/blackjackSocket");

    blackjackSocket.addEventListener("open", () => {
        console.info("blackjack socket opened");
    });

    blackjackSocket.addEventListener("close", () => {
        console.info("blackjack socket closed");
    });

    blackjackSocket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log(data);

        if (data.card) {
            drawCard(`assets/progcards/card-${data.card.suit}_${data.card.value}.png`, data.target)
            window.disableInputs = false;
        } else if (data.playerResult || data.dealerResult) {
            console.log('Player: ' + data.playerResult);
            console.log('Dealer: ' + data.dealerResult);
        }
    };
}

document.getElementsByClassName("hit")[0].onclick = (e) => {
    if (!window.disableInputs) {
        blackjackSocket.send("hit");
        window.disableInputs = true;
    }
}

document.getElementsByClassName("stand")[0].onclick = (e) => {
    if (!window.disableInputs) {
        blackjackSocket.send("stand");
        window.disableInputs = true;
    }
}

function setupBoard() {
    // show blackjack
    document.getElementById("start").style.display = "none";
    document.getElementById("game").style.display = "inline";
    
    // scale canvas
    const x = Math.min(document.documentElement.clientWidth / 70, document.documentElement.clientHeight / 142);
    document.getElementsByClassName("bjContainer")[0].style.transform = `scale(${x})`;
}

function drawCard(src, card) {
    document.getElementsByClassName(card)[0].src = src;
}