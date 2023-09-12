/*jslint browser: true, es6*/

var myUserID = 0;

const whoamiXHR = new XMLHttpRequest();
whoamiXHR.open("GET", `/api/whoami`, true);
whoamiXHR.withCredentials = true;

whoamiXHR.onreadystatechange = async () => {
    if (whoamiXHR.readyState === XMLHttpRequest.DONE && whoamiXHR.status === 200) {
        console.log("200 good");
        myUserID = whoamiXHR.responseText;
    } else if (whoamiXHR.status === 401) {
        console.log("401 failure");
        window.location.href = "/login";
    } else if (whoamiXHR.status === 400) {
        console.log("400 failure");
    } else if (whoamiXHR.status === 500) {
        console.log("500 failure");
    } else {
        console.log("awaiting response");
    }
};
whoamiXHR.send();

while (myUserID === 0) {}

const blackjackSocket = new WebSocket("/api/casino/blackjack/blackjackSocket");

blackjackSocket.onmessage = (event) => {
    console.log(event.data);
    if (event.data === 0x10) {
        blackjackSocket.send(0x11 + "$" + myUserID);
    } else if (event.data === 0x13) {
        alert("you are ok to gamble");
    } else if (event.data === 0xE1) {
        alert("you are too poor to gamble 💀");
    } else if (Number(event.data.split("%%%")[0]) === 0x32) {
        console.log(JSON.parse(event.data.split("%%%")[1]));
    } else if (event.data === 0xff) {
        blackjackSocket.close();
    }
};

var cvs = document.getElementById("bjCanvas");
var ctx = document.getElementById("bjCanvas").getContext("2d");
window.disableBtns = false;
window.casinoSecToken = "";
window.cardsURL = "assets/progcards/";
//var allCards = [];
//helper function to get mouse positions
function getMousePos(canvas, event) {
    "use strict";
    var rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left),
        y: (event.clientY - rect.top)
    };
}

//helper function to check whether a point is inside a rectangle
function isInside(pos, rect) {
    "use strict";
    return (pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y)
}

function hideGame() {
    document.body.style.backgroundColor = "#121212";
    document.getElementById("bjCanvas").style.display = "none"
    document.getElementById("title").style.display = "inline";
    document.getElementById("playBtn").style.display = "inline";
    document.getElementById("backBtn").style.display = "inline";
}

const waitMs = ms => new Promise(res => setTimeout(res, ms));

function startBlackjack(progdeck) {
    if (progdeck) {
        window.cardsURL = "assets/progcards/"
    } else {
        window.cardsURL = "assets/stdcards/";
    }

    if (window.innerHeight < window.innerWidth) {
        alert("play in portrait mode, on a phone.")
    } else {
        window.allCardValues = 0;
        window.allCards = [];

        /*if (cvs.requestFullScreen) {
            cvs.requestFullScreen();
        } else if (cvs.webkitRequestFullScreen) {
            cvs.webkitRequestFullScreen();
        } else if (cvs.mozRequestFullScreen) {
            cvs.mozRequestFullScreen();
        }*/

        //Scale canvas
        cvs.style.width = window.innerWidth - ((window.innerWidth) % 64) + "px"
        cvs.style.height = window.innerHeight - ((window.innerHeight) % 64) + "px"
        cvs.width = (window.innerWidth - ((window.innerWidth) % 64))
        cvs.height = (window.innerHeight - ((window.innerHeight) % 64))

        //Hide all but canvas
        cvs.style.display = "inline";
        document.body.style.overflow = "hidden";
        document.getElementById("title").style.display = "none";
        document.getElementById("playBtn").style.display = "none";
        document.getElementById("backBtn").style.display = "none";
        try {
            document.getElementById("gameResult").remove()
        } catch (error) {}

        //Clear canvas
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = "#4c8232";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        document.body.style.backgroundColor = "#4c8232";

        //Disable image smoothing
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;

        const cardBack = new Image();
        //const dealerHandCard = new Image();
        //const playerCard = new Image();

        ctx.globalCompositeOperation = 'source-over';

        ctx.shadowColor = "#121212";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = -2.5;
        ctx.shadowOffsetY = 2.5;

        //dealerHandCard.onload = function(){ctx.drawImage(this, (cvs.width/26), 0, cvs.width/2, cvs.width/2);}
        cardBack.onload = function() {
            //Dealer hand
            ctx.drawImage(this, (cvs.width / 8), 0, cvs.width / 2, cvs.width / 2);
            ctx.drawImage(this, (cvs.width / 8) + (cvs.width / 8), 0, cvs.width / 2, cvs.width / 2);
            //Player hand
            ctx.drawImage(this, (cvs.width / 8), (cvs.width / 2) * 1.25, cvs.width / 2, cvs.width / 2);
            ctx.drawImage(this, (cvs.width / 8) + (cvs.width / 8), (cvs.width / 2) * 1.25, cvs.width / 2, cvs.width / 2);
        };
        //Player hand
        //playerCard.onload = function(){ctx.drawImage(this, (cvs.width/20), (cvs.width/2)*1.25, cvs.width/2, cvs.width/2);}

        //playerCard.src = "assets/player.png";
        //dealerHandCard.src = "assets/dealerhand.png";
        cardBack.src = `${window.cardsURL}card_back.png`;

        //buttons
        const dealButton = {
            x: (cvs.width / 2 - cvs.width / 6) - cvs.width / 14,
            y: (cvs.height / 8) * 6,
            width: cvs.width / 6,
            height: cvs.width / 6
        };

        const hitButton = {
            x: cvs.width / 2 - cvs.width / 14,
            y: (cvs.height / 8) * 6,
            width: cvs.width / 6,
            height: cvs.width / 6
        };

        const standButton = {
            x: (cvs.width / 2 + cvs.width / 6) - cvs.width / 14,
            y: (cvs.height / 8) * 6,
            width: cvs.width / 6,
            height: cvs.width / 6
        };

        const dealBtn = new Image();
        const hitBtn = new Image();
        const standBtn = new Image();

        ctx.globalCompositeOperation = 'source-over';
        dealBtn.onload = function() {
            ctx.drawImage(this, dealButton.x, dealButton.y, dealButton.width, dealButton.height);
        }
        hitBtn.onload = function() {
            ctx.drawImage(this, hitButton.x, hitButton.y, hitButton.width, hitButton.height);
        }
        standBtn.onload = function() {
            ctx.drawImage(this, standButton.x, standButton.y, standButton.width, standButton.height);
        }

        dealBtn.src = "assets/deal.png";
        hitBtn.src = "assets/hit.png";
        standBtn.src = "assets/stand.png";

        blackjackSocket.send(0x30);
    }
}