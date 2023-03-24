var cvs = document.getElementById("bjCanvas")
var ctx = document.getElementById("bjCanvas").getContext("2d"); 
window.allCardValues = 0;
window.disableBtns = false;
window.allCards = [];
window.playerCards = [];
window.casinoSecToken = "";
window.dealerTotal = 0;
window.playerAces = 0;
window.cardsURL = "assets/progcards/"
//var allCards = [];
//helper function to get mouse positions
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left),
        y: (event.clientY - rect.top)
    };
}

//helper function to check whether a point is inside a rectangle
function isInside(pos, rect) {
    return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
}

async function getInitialDraw() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/casino/blackjack/startingCards`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        console.log("200 ok")
        console.log(JSON.parse(xhr.responseText))
        return JSON.parse(xhr.responseText)
    } else if (xhr.status === 401) {
        console.log("401 failure");
        window.location.href = "/login";
    } else if (xhr.status === 400) {
        console.log("400 failure")
    } else if (xhr.status === 500) {
        console.log("500 failure")
    } else {
        console.log("awaiting response")
    }
    }

    xhr.send()
}

const waitMs = ms => new Promise(res => setTimeout(res, ms));

async function checkForLoss(cardTotal, card) {
    if (card) {
        if (cardTotal == 21) {
            window.disableBtns = true;
            const newPlayerCard = new Image()
            newPlayerCard.onload = function(){ctx.drawImage(this, (cvs.width/8) + (cvs.width/8)*(window.playerCards.length - 1), (cvs.width/2)*1.25, cvs.width/2, cvs.width/2)}
            newPlayerCard.src = window.cardsURL + card;

            await waitMs(0750)

            var audio = new Audio('assets/yummy.mp3');
            audio.play();

            document.body.style.backgroundColor = "#121212";
            document.getElementById("bjCanvas").style.display = "none"
            document.getElementById("title").style.display = "inline";
            document.getElementById("playBtn").style.display = "inline";
            document.getElementById("backBtn").style.display = "inline";
            document.getElementById("bjCanvas").insertAdjacentHTML("afterend", `<h3 id="gameResult" style="font-family: 'raleway-300'" style="color: var(--gameFlairColor)">Blackjack!</h3>`)
            document.getElementById("playBtn").onclick = function(){window.location.reload();};

            const xhr = new XMLHttpRequest();
            xhr.open("GET", `/api/casino/blackjack/${cardTotal}/${window.casinoSecToken}/wonViaBlackjack`, true);
            xhr.withCredentials = true;

            xhr.onreadystatechange = async () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                console.log("200 good")
            } else if (xhr.status === 401) {
                console.log("401 failure");
                window.location.href = "/login";
            } else if (xhr.status === 400) {
                console.log("400 failure")
            } else if (xhr.status === 500) {
                console.log("500 failure")
            } else {
                console.log("awaiting response")
            }
            }
            xhr.send() 
        } else if (cardTotal > 21) {
            window.disableBtns = true;
            const newPlayerCard = new Image()
            newPlayerCard.onload = function(){ctx.drawImage(this, (cvs.width/8) + (cvs.width/8)*(window.playerCards.length - 1), (cvs.width/2)*1.25, cvs.width/2, cvs.width/2)}
            newPlayerCard.src = window.cardsURL + card;

            await waitMs(0750)

            document.body.style.backgroundColor = "#121212";
            document.getElementById("bjCanvas").style.display = "none"
            document.getElementById("title").style.display = "inline";
            document.getElementById("playBtn").style.display = "inline";
            document.getElementById("backBtn").style.display = "inline";
            document.getElementById("bjCanvas").insertAdjacentHTML("afterend", `<h3 id="gameResult" style="font-family: 'raleway-300'" style="color: var(--gameFlairColor)">Bust!</h3>`)
            document.getElementById("playBtn").onclick = function(){window.location.reload();};
        } else {
            return;
        }
    } else {
        if (cardTotal == 21) {
            var audio = new Audio('assets/yummy.mp3');
            audio.play();

            document.body.style.backgroundColor = "#121212";
            document.getElementById("bjCanvas").style.display = "none"
            document.getElementById("title").style.display = "inline";
            document.getElementById("playBtn").style.display = "inline";
            document.getElementById("backBtn").style.display = "inline";
            document.getElementById("bjCanvas").insertAdjacentHTML("afterend", `<h3 id="gameResult" style="font-family: 'raleway-300'" style="color: var(--gameFlairColor)">Blackjack!</h3>`)
            document.getElementById("playBtn").onclick = function(){window.location.reload();};

            const xhr = new XMLHttpRequest();
            xhr.open("GET", `/api/casino/blackjack/${cardTotal}/${window.casinoSecToken}/wonViaBlackjack`, true);
            xhr.withCredentials = true;

            xhr.onreadystatechange = async () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                console.log("200 good")
            } else if (xhr.status === 401) {
                console.log("401 failure");
                window.location.href = "/login";
            } else if (xhr.status === 400) {
                console.log("400 failure")
            } else if (xhr.status === 500) {
                console.log("500 failure")
            } else {
                console.log("awaiting response")
            }
            }
            xhr.send()
        } else {
            return;
        }
    }
}

async function getNewCard() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/casino/blackjack/newCard`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        const APINewCard = await JSON.parse(JSON.parse(xhr.responseText))
        console.log(APINewCard)
        console.log(APINewCard.card)
        window.allCards.push(APINewCard.card)
        window.playerCards.push(APINewCard.card)
        if (window.playerAces === 1) {
            if ((window.allCardValues + APINewCard.cardValue) === 10) {
                await checkForLoss(21, APINewCard.card)
            } else {
                await checkForLoss(window.allCardValues + APINewCard.cardValue + 1, APINewCard.card)
            }
        }
        await checkForLoss(window.allCardValues + APINewCard.cardValue, APINewCard.card)
        window.allCardValues = window.allCardValues + APINewCard.cardValue;
        ctx.globalCompositeOperation = 'source-over';
        var newCardForPlayer = new Image()
        newCardForPlayer.onload = function(){ctx.drawImage(this, (cvs.width/8) + (cvs.width/8)*(window.playerCards.length - 1), (cvs.width/2)*1.25, cvs.width/2, cvs.width/2)}
        newCardForPlayer.src = window.playerCards[window.playerCards.length - 1];
        return APINewCard.card;
    } else if (xhr.status === 401) {
        console.log("401 unauth");
        window.location.href = "/login";
        return "401";
    } else if (xhr.status === 400) {
        console.log("400 failure")
        return "400";
    } else if (xhr.status === 500) {
        console.log("500 failure")
        return "500";
    } else {
        console.log("awaiting response")
    }
    }

    xhr.send()
}

function startBlackjack(progdeck) {
if (progdeck) {
    window.cardsURL = "assets/progcards/"
} else {
    window.cardsURL = "assets/"
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
    cvs.style.width = window.innerWidth - ((window.innerWidth)%64) + "px"
    cvs.style.height = window.innerHeight - ((window.innerHeight)%64) + "px"
    cvs.width = (window.innerWidth - ((window.innerWidth)%64))
    cvs.height = (window.innerHeight - ((window.innerHeight)%64))

    //Hide all but canvas
    cvs.style.display = "inline";
    document.body.style.overflow = "hidden";
    document.getElementById("title").style.display = "none";
    document.getElementById("playBtn").style.display = "none";
    document.getElementById("backBtn").style.display = "none";
    try {document.getElementById("gameResult").remove()} catch(error){}

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
    cardBack.onload = function(){
        //Dealer hand
        ctx.drawImage(this, (cvs.width/8), 0, cvs.width/2, cvs.width/2);
        ctx.drawImage(this, (cvs.width/8) + (cvs.width/8), 0, cvs.width/2, cvs.width/2);
        //Player hand
        ctx.drawImage(this, (cvs.width/8), (cvs.width/2)*1.25, cvs.width/2, cvs.width/2);
        ctx.drawImage(this, (cvs.width/8) + (cvs.width/8), (cvs.width/2)*1.25, cvs.width/2, cvs.width/2);
    };
    //Player hand
    //playerCard.onload = function(){ctx.drawImage(this, (cvs.width/20), (cvs.width/2)*1.25, cvs.width/2, cvs.width/2);}

    //playerCard.src = "assets/player.png";
    //dealerHandCard.src = "assets/dealerhand.png";
    cardBack.src = `${window.cardsURL}card_back.png`;

    //buttons
    const dealButton = {
        x: (cvs.width/2 - cvs.width/6) - cvs.width/14,
        y: (cvs.height/8)*6,
        width: cvs.width/6,
        height: cvs.width/6
    };

    const hitButton = {
        x: cvs.width/2 - cvs.width/14,
        y: (cvs.height/8)*6,
        width: cvs.width/6,
        height: cvs.width/6
    };

    const standButton = {
        x: (cvs.width/2 + cvs.width/6) - cvs.width/14,
        y: (cvs.height/8)*6,
        width: cvs.width/6,
        height: cvs.width/6
    };

    const dealBtn = new Image();
    const hitBtn = new Image();
    const standBtn = new Image();

    ctx.globalCompositeOperation = 'source-over';
    dealBtn.onload = function(){ctx.drawImage(this, dealButton.x, dealButton.y, dealButton.width, dealButton.height);}
    hitBtn.onload = function(){ctx.drawImage(this, hitButton.x, hitButton.y, hitButton.width, hitButton.height);}
    standBtn.onload = function(){ctx.drawImage(this, standButton.x, standButton.y, standButton.width, standButton.height);}
    
    dealBtn.src = "assets/deal.png";
    hitBtn.src = "assets/hit.png";
    standBtn.src = "assets/stand.png";

    //gameVars
    var dealt = false;
    window.playerCards = [`${window.cardsURL}card_back.png`, `${window.cardsURL}card_back.png`];
    var drawnCards = [`${window.cardsURL}card_back.png`, `${window.cardsURL}card_back.png`];
        cvs.addEventListener('click', async function(evt) {
            var mousePos = getMousePos(cvs, evt);
            console.log("click!!")
            if (window.disableBtns) {
                console.log("buttons are disabled")
            } else {
            if (isInside(getMousePos(cvs, evt), dealButton)) {
                console.log('deal button')
                if (dealt) {
                    console.log("Already dealt");
                } else {
                    const xhr = new XMLHttpRequest();
                    xhr.open("GET", `/api/casino/blackjack/startingCards`, true);
                    xhr.withCredentials = true;

                    xhr.onreadystatechange = async () => {
                    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                        console.log("200 ok");

                        ctx.globalCompositeOperation = 'destination-over';
                        ctx.fillStyle = "#4c8232";
                        ctx.fillRect(0, 0, cvs.width, cvs.height);

                        const APIFirstCards = JSON.parse(JSON.parse(xhr.responseText));
                        console.log(APIFirstCards);

                        ctx.globalCompositeOperation = 'source-over';
                        window.playerCards = [window.cardsURL + APIFirstCards.player0, window.cardsURL + APIFirstCards.player1];
                        drawnCards = [window.cardsURL + APIFirstCards.dealt, `${window.cardsURL}card_back.png`];
                        window.allCards.push(window.cardsURL + APIFirstCards.player0, window.cardsURL + APIFirstCards.player1, window.cardsURL + APIFirstCards.dealt);

                        const firstDrawnCard = new Image();
                        firstDrawnCard.onload = function(){
                            ctx.drawImage(cardBack, (cvs.width/8), (cvs.width/2)*1.25, cvs.width/2, cvs.width/2);
                            ctx.drawImage(this, (cvs.width/8) + (cvs.width/8), 0, cvs.width/2, cvs.width/2);
                            const firstPlayerCard = new Image();
                            firstPlayerCard.onload = function(){
                                ctx.drawImage(this, (cvs.width/8), (cvs.width/2)*1.25, cvs.width/2, cvs.width/2);
                            }
                            firstPlayerCard.src = window.cardsURL + APIFirstCards.player1;
                            const secondPlayerCard = new Image();
                            secondPlayerCard.onload = function(){
                                ctx.drawImage(this, (cvs.width/8) + (cvs.width/8), (cvs.width/2)*1.25, cvs.width/2, cvs.width/2);
                            }
                            secondPlayerCard.src = window.cardsURL + APIFirstCards.player0;
                        }
                        firstDrawnCard.src = window.cardsURL + APIFirstCards.dealt;

                        ctx.drawImage(hitBtn, hitButton.x, hitButton.y, hitButton.width, hitButton.height);
                        ctx.drawImage(standBtn, standButton.x, standButton.y, standButton.width, standButton.height);

                        //ctx.drawImage(dealerHandCard, (cvs.width/26), 0, cvs.width/2, cvs.width/2)
                        //ctx.drawImage(playerCard, (cvs.width/20), (cvs.width/2)*1.25, cvs.width/2, cvs.width/2);

                        window.allCardValues = Number(APIFirstCards.playerTotal);
                        window.playerAces = APIFirstCards.aces;
                        window.casinoSecToken = APIFirstCards.casinoToken
                        window.dealerTotal = APIFirstCards.dealerTotal

                        //value aces as 11 if total is less than or equal to 10
                        if (APIFirstCards.aces > 0) {
                            if (APIFirstCards.aces === 1 && APIFirstCards.playerTotal === 10) {window.playerTotal = 21; checkForLoss(21)};
                            if (window.playerAces === 2) {window.allCardValues = window.allCardValues + 12; window.playerAces = 0;};
                        }

                        console.log(APIFirstCards.playerTotal)
                        console.log(APIFirstCards.aces)

                        dealt = true;
                    } else if (xhr.status === 401) {
                        console.log("401 unauth");
                        window.location.href = "/login";
                    } else if (xhr.status === 400) {
                        console.log("400 failure")
                    } else if (xhr.status === 403) {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            console.log("403 access denied")
                            document.body.style.backgroundColor = "#121212";
                            document.getElementById("bjCanvas").style.display = "none"
                            document.getElementById("title").style.display = "inline";
                            document.getElementById("playBtn").style.display = "inline";
                            document.getElementById("backBtn").style.display = "inline";
                            document.getElementById("bjCanvas").insertAdjacentHTML("afterend", `<h3 id="gameResult" style="font-family: 'raleway-300'" style="color: var(--gameFlairColor)">You have a balance of under -2000 points, you cannot gamble!</h3>`)
                            document.getElementById("playBtn").onclick = function(){window.location.reload();}
                            throw new Error('unable to gamble');
                        }
                    } else if (xhr.status === 500) {
                        console.log("500 failure")
                    } else {
                        console.log("awaiting response")
                    }
                    }

                    xhr.send()              
                    }
            } else if (isInside(getMousePos(cvs, evt), hitButton)) {
                console.log('hit button');
                if (dealt) {
                    await getNewCard().then(card => async function(){/*
                        ctx.globalCompositeOperation = 'source-over';
                        var newCardForPlayer = new Image()
                        newCardForPlayer.onload = function(){ctx.drawImage(this, (cvs.width/8) + (cvs.width/8)*(window.playerCards.length - 1), (cvs.width/2)*1.25, cvs.width/2, cvs.width/2)}
                        newCardForPlayer.src = window.playerCards[window.playerCards.length - 1];
                    */}).catch()
                } else {
                    console.log("not yet dealt")
                }
            } else if (isInside(getMousePos(cvs, evt), standButton)) {
                console.log('stand button');
                if (dealt) {
                    window.disableBtns = true;
                    const xhr = new XMLHttpRequest();
                    xhr.open("GET", `/api/casino/blackjack/stand/${window.casinoSecToken}/${window.allCardValues}/${window.dealerTotal}`, true);
                    xhr.withCredentials = true;

                    xhr.onreadystatechange = async () => {
                    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                        const APINewCard = await JSON.parse(JSON.parse(xhr.responseText))
                        if (APINewCard.result === "win") {
                            var audio = new Audio('assets/yummy.mp3');
                            audio.play();
                            document.body.style.backgroundColor = "#121212";
                            document.getElementById("bjCanvas").style.display = "none"
                            document.getElementById("title").style.display = "inline";
                            document.getElementById("playBtn").style.display = "inline";
                            document.getElementById("backBtn").style.display = "inline";
                            document.getElementById("bjCanvas").insertAdjacentHTML("afterend", `<h3 id="gameResult" style="font-family: 'raleway-300'" style="color: var(--gameFlairColor)">Win!</h3>`)
                            document.getElementById("playBtn").onclick = function(){window.location.reload();};
                        } else if (APINewCard.result === "loss") {
                            document.body.style.backgroundColor = "#121212";
                            document.getElementById("bjCanvas").style.display = "none"
                            document.getElementById("title").style.display = "inline";
                            document.getElementById("playBtn").style.display = "inline";
                            document.getElementById("backBtn").style.display = "inline";
                            document.getElementById("bjCanvas").insertAdjacentHTML("afterend", `<h3 id="gameResult" style="font-family: 'raleway-300'" style="color: var(--gameFlairColor)">Loss!</h3>`)
                            document.getElementById("playBtn").onclick = function(){window.location.reload();};
                        }
                    } else if (xhr.status === 401) {
                        console.log("401 unauth");
                        window.location.href = "/login";
                        return "401";
                    } else if (xhr.status === 400) {
                        console.log("400 failure")
                        return "400";
                    } else if (xhr.status === 500) {
                        console.log("500 failure")
                        return "500";
                    } else {
                        console.log("awaiting response")
                    }
                    }

                    xhr.send()
                } else {
                    console.log("not yet dealt")
                }
            }
            }
        }, false);
    }
}