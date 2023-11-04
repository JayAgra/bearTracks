/*jslint browser: true, es6*/
declare var waitMs: any;
function goToHome() {
    window.location.href = "/points";
}

const x = Math.min(document.documentElement.clientWidth / 85, document.documentElement.clientHeight / 125);
const styleSheet = `<style>.bjContainer{margin:0;padding:0;}.bjContainer{display:flex;flex-direction:column;align-items:center;justify-content:center;position:fixed;left:-17.5vw;}.blackjack{image-rendering:pixelated;}.cardImg,.handImg{height:${64 * x}px;position:fixed;filter:drop-shadow(0 0 ${x * 2}px #000);}.bjBtn{height:${20 * x}px;position:fixed;filter:drop-shadow(0 0 ${x * 2}px #000)}.dealer1{top:0;left:${5 * x}px;}.dealer2{top:0;left:${15 * x}px;}.dealer3{top:0;left:${25 * x}px;}.dealer4{top:0;left:${35 * x}px;}.dealer5{top:0;left:${45 * x}px;}.dealer6{top:0;left:${55 * x}px;}.dealer7{top:0;left:${65 * x}px;}.player1{top:${50 * x}px;left:${5 * x}px;}.player2{top:${50 * x}px;left:${15 * x}px;}.player3{top:${50 * x}px;left:${25 * x}px;}.player4{top:${50 * x}px;left:${35 * x}px;}.player5{top:${50 * x}px;left:${45 * x}px;}.player6{top:${50 * x}px;left:${55 * x}px;}.player7{top:${50 * x}px;left:${65 * x}px;}.deal{top:${102 * x}px;left:${-22 * x}px;}.hit{top:${102 * x}px;left:${-2 * x}px;}.stand{top:${102 * x}px;left:${18 * x}px;}.deal.noDeal{display:none;}.hit.noDeal{top:${102 * x}px;left:${46 * x}px;}.stand.noDeal{top:${102 * x}px;left:${18 * x}px;}.gruvboxBlackjack {background-image:url(/assets/gruvcards/honerkamp-bkg.jpeg);background-repeat:repeat-y;}</style>`;
document.head.insertAdjacentHTML("afterbegin", styleSheet);

(window as any).disableInputs = false;

var blackjackSocket: WebSocket;

function startBlackjack() {
    blackjackSocket = new WebSocket("wss://beartracks.io/api/casino/blackjack/blackjackSocket");

    blackjackSocket.addEventListener("open", () => {
        console.info("blackjack socket opened");
    });

    blackjackSocket.addEventListener("close", () => {
        console.info("blackjack socket closed");
    });

    blackjackSocket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.status) {
            if (data.status === 0x90) {
                console.info("balance too low");
                alert("balance too low to gamble");
            } else if (data.status === 0x91) {
                console.info("balance ok");
                setupBoard();
            }
        } else if (data.card) {
            console.info("new card");
            var deckType: HTMLInputElement | null = document.getElementById("deck") as HTMLInputElement;
            drawCard(`${deckType.value == null ? "stdcards" : deckType.value}card-${data.card.suit}_${data.card.value}.png`, data.target);
            (window as any).disableInputs = false;
        } else if (data.result) {
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

(document.getElementsByClassName("hit")[0] as HTMLElement).onclick = () => {
    if (!(window as any).disableInputs) {
        console.info("hitting...");
        blackjackSocket.send("" + 0x30);
        (window as any).disableInputs = true;
    } else {console.info("buttons disabled");}
}

(document.getElementsByClassName("stand")[0] as HTMLElement).onclick = () => {
    if (!(window as any).disableInputs) {
        console.info("standing...");
        blackjackSocket.send("" + 0x31);
        (window as any).disableInputs = true;
    } else {console.info("buttons disabled");}
}

function setupBoard() {
    // show blackjack
    (document.getElementById("start") as HTMLElement).style.display = "none";
    (document.getElementById("game") as HTMLElement).style.display = "inline";
    (document.getElementsByClassName("dealer1")[0] as HTMLImageElement).src = `${(document.getElementById("deck") as HTMLInputElement).value}card_back.png`;
    (document.getElementsByClassName("dealer2")[0] as HTMLImageElement).src = `${(document.getElementById("deck") as HTMLInputElement).value}card_back.png`;
    (document.getElementsByClassName("player1")[0] as HTMLImageElement).src = `${(document.getElementById("deck") as HTMLInputElement).value}card_back.png`;
    (document.getElementsByClassName("player2")[0] as HTMLImageElement).src = `${(document.getElementById("deck") as HTMLInputElement).value}card_back.png`;

    if ((document.getElementById("deck") as HTMLInputElement).value === "assets/gruvcards/") {
        document.body.classList.add("gruvboxBlackjack");
    }
}

function drawCard(src: string, card: string) {
    (document.getElementsByClassName(card)[0] as HTMLImageElement).src = src;
}

function playSound(type: string) {
    const number = type === "tie" ? Math.floor(Math.random() * 6) : Math.floor(Math.random() * 12);
    var clip = new Audio("assets/sounds/min/" + type + "_" + number + ".min.mp3");
    clip.play();
}