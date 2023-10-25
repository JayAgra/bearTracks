/*jslint browser: true, es6*/
const waitMs = (ms) => new Promise((res) => setTimeout(res, ms));
function goToHome() {
    window.location.href = "/points";
}

window.disableInputs = false;

function startBlackjack() {
    var whoami = 1;
    // get who i am TODO
    while (whoami === 0) {}

    window.blackjackSocket = new WebSocket("/api/casino/blackjack/blackjackSocket");
    window.blackjackSocket.onmessage = async (event) => {
        console.log(event.data);
        if (event.data === 0x10) {
            window.blackjackSocket.send(0x11 + "$" + myUserID);
        } else if (event.data === 0x13) {
            setupBoard();
        } else if (event.data === 0xe1) {
            alert("you are too poor to gamble 💀");
        } else if (Number(event.data.split("%%%")[0]) === 0x32) {
            var sCards = JSON.parse(event.data.split("%%%")[1]);
            drawCard("assets/progcards/" + sCards.dealer1 + "dealer1");
            drawCard("assets/progcards/" + sCards.player1 + "player1");
            drawCard("assets/progcards/" + sCards.player2 + "player2");
        } else if (Number(event.data.split("%%%")[0]) === 0x33) {
            var nCard = JSON.parse(event.data.split("%%%%")[1]);
            drawCard("assets/progcards/" + nCard[nCard.id] + nCard.id)
            window.disableInputs = false;
        } else if (event.data === 0x99) {
            window.blackjackSocket.close();
            window.disableInputs = true;
            await waitMs(5000);
            alert("you won");
        } else if (event.data === 0x98) {
            window.blackjackSocket.close();
            window.disableInputs = true;
            await waitMs(5000);
            alert("you lost");
        } else if (event.data === 0x97) {
            window.blackjackSocket.close();
            window.disableInputs = true;
            await waitMs(5000);
            alert("you tied");
        } else if (event.data === 0xff) {
            window.blackjackSocket.close();
        }
    };
}

document.getElementsByClassName("hit")[0].onclick = (e) => {
    if (!window.disableInputs) {
        window.blackjackSocket.send(0x40);
        window.disableInputs = true;
    }
}

document.getElementsByClassName("stand")[0].onclick = (e) => {
    if (!window.disableInputs) {
        window.blackjackSocket.send(0x41);
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