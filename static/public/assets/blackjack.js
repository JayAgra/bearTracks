function goToHome() {
    window.location.href = "/points";
}
const x = Math.min(document.documentElement.clientWidth / 85, document.documentElement.clientHeight / 125);
const styleSheet = `<style>body,html{image-rendering: pixelated;}.bjContainer{margin:0;padding:0;}.bjContainer{display:flex;flex-direction:column;align-items:center;justify-content:center;position:fixed;left:-17.5vw;}.blackjack{image-rendering:pixelated;}.cardImg,.handImg{height:${64 * x}px;position:fixed;filter:drop-shadow(0 0 ${x * 2}px #000);}.bjBtn{height:${20 * x}px;position:fixed;filter:drop-shadow(0 0 ${x * 2}px #000)}.dealer1{top:0;left:${5 * x}px;}.dealer2{top:0;left:${15 * x}px;}.dealer3{top:0;left:${25 * x}px;}.dealer4{top:0;left:${35 * x}px;}.dealer5{top:0;left:${45 * x}px;}.dealer6{top:0;left:${55 * x}px;}.dealer7{top:0;left:${65 * x}px;}.player1{top:${50 * x}px;left:${5 * x}px;}.player2{top:${50 * x}px;left:${15 * x}px;}.player3{top:${50 * x}px;left:${25 * x}px;}.player4{top:${50 * x}px;left:${35 * x}px;}.player5{top:${50 * x}px;left:${45 * x}px;}.player6{top:${50 * x}px;left:${55 * x}px;}.player7{top:${50 * x}px;left:${65 * x}px;}.deal{top:${102 * x}px;left:${-22 * x}px;}.hit{top:${102 * x}px;left:${-2 * x}px;}.stand{top:${102 * x}px;left:${18 * x}px;}.deal.noDeal{display:none;}.hit.noDeal{top:${102 * x}px;left:${46 * x}px;}.stand.noDeal{top:${102 * x}px;left:${18 * x}px;}.gruvboxBlackjack {background:url(/static/assets/gruvcards/honerkamp-bkg.png) no-repeat center fixed;image-rendering:pixelated;background-size:cover;}</style>`;
document.head.insertAdjacentHTML("afterbegin", styleSheet);
window.disableInputs = false;
var blackjackSocket;
function startBlackjack() {
    blackjackSocket = new WebSocket(`wss://${window.location.host}/api/v1/casino/blackjack`);
    blackjackSocket.addEventListener("open", () => {
        console.info("blackjack socket opened");
        setupBoard();
    });
    blackjackSocket.addEventListener("close", () => {
        console.info("blackjack socket closed");
    });
    blackjackSocket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.card) {
            console.info("new card");
            var deckType = document.getElementById("deck");
            drawCard(`${deckType.value == null ? "static/assets/stdcards/" : deckType.value}card-${data.card.suit}_${data.card.value}.png`, data.target);
            window.disableInputs = false;
        }
        else if (data.result) {
            console.info("game over");
            switch (data.result) {
                case "WN":
                    playSound("win");
                    await waitMs(2000);
                    alert("you win");
                    break;
                case "LS":
                    playSound("loss");
                    await waitMs(2000);
                    alert("you lose");
                    break;
                case "LB":
                    playSound("loss");
                    await waitMs(2000);
                    alert("you lose (bust)");
                    break;
                case "WD":
                    playSound("win");
                    await waitMs(2000);
                    alert("you win (dealer bust)");
                    break;
                case "DR":
                    playSound("tie");
                    await waitMs(2000);
                    alert("tie");
                    break;
                default:
                    alert("unknown error");
                    break;
            }
        }
    };
}
document.getElementsByClassName("hit")[0].onclick = () => {
    if (!window.disableInputs) {
        console.info("hitting...");
        blackjackSocket.send("" + 0x30);
        window.disableInputs = true;
    }
    else {
        console.info("buttons disabled");
    }
};
document.getElementsByClassName("stand")[0].onclick = () => {
    if (!window.disableInputs) {
        console.info("standing...");
        blackjackSocket.send("" + 0x31);
        window.disableInputs = true;
    }
    else {
        console.info("buttons disabled");
    }
};
function setupBoard() {
    // show blackjack
    document.getElementById("start").style.display = "none";
    document.getElementById("game").style.display = "inline";
    document.getElementsByClassName("dealer1")[0].src = `${document.getElementById("deck").value}card_back.png`;
    document.getElementsByClassName("dealer2")[0].src = `${document.getElementById("deck").value}card_back.png`;
    document.getElementsByClassName("player1")[0].src = `${document.getElementById("deck").value}card_back.png`;
    document.getElementsByClassName("player2")[0].src = `${document.getElementById("deck").value}card_back.png`;
    document.body.classList.add("gruvboxBlackjack");
    document.getElementById("themeMeta").content = "#10131d";
}
function drawCard(src, card) {
    document.getElementsByClassName(card)[0].src = src;
}
function playSound(type) {
    const number = type === "tie" ? Math.floor(Math.random() * 6) : Math.floor(Math.random() * 12);
    var clip = new Audio("static/assets/sounds/min/" + type + "_" + number + ".min.mp3");
    clip.play();
}
document.onload = () => {
    console.log(`%c bearTracks                                      "What's 18 U.S.C. § 1955?"\n   █████████    █████████    █████████  █████ ██████   █████    ███████   \n  ███░░░░░███  ███░░░░░███  ███░░░░░███░░███ ░░██████ ░░███   ███░░░░░███ \n ███     ░░░  ░███    ░███ ░███    ░░░  ░███  ░███░███ ░███  ███     ░░███\n░███          ░███████████ ░░█████████  ░███  ░███░░███░███ ░███      ░███\n░███          ░███░░░░░███  ░░░░░░░░███ ░███  ░███ ░░██████ ░███      ░███\n░░███     ███ ░███    ░███  ███    ░███ ░███  ░███  ░░█████ ░░███     ███ \n ░░█████████  █████   █████░░█████████  █████ █████  ░░█████ ░░░███████░  \n  ░░░░░░░░░  ░░░░░   ░░░░░  ░░░░░░░░░  ░░░░░ ░░░░░    ░░░░░    ░░░░░░░    \nEducational Gambling℠                            proudly rigged since 2023`, 'font-family: monospace;');
};
