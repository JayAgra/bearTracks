var cvs = document.getElementById("frcCvs")
var ctx = document.getElementById("frcCvs").getContext("2d"); 

window.redScore = 0
window.blueScore = 0

var roundNearQtr = function(number) {
    return Number((Math.round(number * 4) / 4).toFixed(2));
};

const waitMs = ms => new Promise(res => setTimeout(res, ms));

function Robot(color, number, team, cycle, cone, cube, upper, middle, bottom, defends, charge) {
    this.color = color,
    this.number = number,
    this.team = team,
    this.cycle = cycle,
    this.cone = cone,
    this.cube = cube,
    this.upper = upper,
    this.middle = middle,
    this.bottom = bottom,
    this.defends = defends,
    this.chargePcnt = charge,
    this.defended = false,
    this.disabled = false,
    this.startedWait = Math.round(Date.now() / 1000),
    this.draw = function() {
        if (this.color === "red") {
            let robonum = this.number;
            var image = new Image()
            image.onload = function(){
                ctx.drawImage(this, cvs.width/1.25, cvs.height - (cvs.height/12)*(15 - (robonum*4)), cvs.height/6, cvs.height/6)
            }
            image.src = "assets/red.png";
        } else {
            let robonum = this.number;
            var image = new Image()
            image.onload = function(){
                ctx.drawImage(this, cvs.width/12, cvs.height - (cvs.height/12)*(15 - (robonum*4)), cvs.height/6, cvs.height/6)
            }
            image.src = "assets/blue.png";
        }
    },
    this.drawPcnt = function(pcnt) {
        if (this.color === "red") {
            let robonum = this.number;
            var image = new Image()
            image.onload = function(){
                ctx.drawImage(this, cvs.width/1.25, cvs.height - (cvs.height/12)*(15 - (robonum*4)), cvs.height/6, cvs.height/6)
            }
            image.src = "assets/red" + pcnt + ".png";
        } else {
            let robonum = this.number;
            var image = new Image()
            image.onload = function(){
                ctx.drawImage(this, cvs.width/12, cvs.height - (cvs.height/12)*(15 - (robonum*4)), cvs.height/6, cvs.height/6)
            }
            image.src = "assets/blue" + pcnt + ".png";
        }
    },
    this.drawDisabled = function() {
        if (this.color === "red") {
            let robonum = this.number;
            var image = new Image()
            image.onload = function(){
                ctx.drawImage(this, cvs.width/1.25, cvs.height - (cvs.height/12)*(15 - (robonum*4)), cvs.height/6, cvs.height/6)
            }
            image.src = "assets/red_disabled.png";
        } else {
            let robonum = this.number;
            var image = new Image()
            image.onload = function(){
                ctx.drawImage(this, cvs.width/12, cvs.height - (cvs.height/12)*(15 - (robonum*4)), cvs.height/6, cvs.height/6)
            }
            image.src = "assets/blue_disabled.png";
        }
    },
    this.drawDefended = function() {
        if (this.color === "red") {
            let robonum = this.number;
            var image = new Image()
            image.onload = function(){
                ctx.drawImage(this, cvs.width/1.25, cvs.height - (cvs.height/12)*(15 - (robonum*4)), cvs.height/6, cvs.height/6)
            }
            image.src = "assets/red_disabled.png";
        } else {
            let robonum = this.number;
            var image = new Image()
            image.onload = function(){
                ctx.drawImage(this, cvs.width/12, cvs.height - (cvs.height/12)*(15 - (robonum*4)), cvs.height/6, cvs.height/6)
            }
            image.src = "assets/blue_disabled.png";
        }
    },
    this.redrawState = function() {
        if (this.disabled) {this.drawDisabled()} else if (this.defended) {this.drawDefended()} else {this.draw()}
    }
}

async function drawTimer() {
    ctx.fillStyle = "#121212";
    ctx.fillRect((cvs.width/4), cvs.height/3, cvs.width/2, cvs.width/2)
    ctx.font = "40px mono";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center"; 
    ctx.fillText(120 - (Math.round(Date.now() / 1000) - window.gameStarted), (cvs.width/2) - cvs.width/32, cvs.height/2);
    ctx.fillText("Blue: " + window.blueScore + "      Red: " + window.redScore, (cvs.width/2) - cvs.width/32, (cvs.height/2) + cvs.height/8);
    await waitMs(10)
    if ((Math.round(Date.now() / 1000) - window.gameStarted) <= 120) {
        drawTimer()
    }
}

async function gameTick(robot) {
    if (!robot.disabled) {
        //robot.drawPcnt(100*Number(roundNearQtr((Date.now - robot.startedWait)/robot.cycle)))
        console.log(robot.startedWait)
        if (((Math.round(Date.now() / 1000) - robot.startedWait)/robot.cycle) >= 1) {
            robot.startedWait = Math.round(Date.now() / 1000);
            if (Math.random() < 70/100) {
                if (robot.upper) {
                    if (robot.color === "red") {window.redScore += 5} else {window.blueScore += 5}
                } else if (robot.middle) {
                    if (robot.color === "red") {window.redScore += 3} else {window.blueScore += 3}
                } else {
                    if (robot.color === "red") {window.redScore += 2} else {window.blueScore += 2}
                }
            }
        }

        if (Math.random() < 0.01/100) {
            //small chance of disabling
            robot.disabled = true;
            robot.drawDisabled()
        }

        await waitMs(200 + Math.random()*800)
        if (((Math.round(Date.now() / 1000) - window.gameStarted) >= 100) && !((Math.round(Date.now() / 1000) - window.gameStarted) >= 120)) {
            console.log("endgame time idiot")
            if (Math.random() < robot.chargePcnt/100) {
                robot.disabled = true;
                if (robot.color === "red") {window.redScore += 10} else {window.blueScore += 10}
            } else {
                await waitMs(200 + Math.random()*800)
                gameTick(robot)
            }
        } else {
            gameTick(robot)
        }

        if ((Math.round(Date.now() / 1000) - window.gameStarted) >= 120) {
            robot.disabled = true;
            console.log("game done")
        }
        return 0;
    }
}

function startGame() {
if (window.innerHeight > window.innerWidth) {
    alert("play in landscape mode, ideally on a phone.")
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
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    document.body.style.backgroundColor = "#000";
    ctx.globalCompositeOperation = 'source-over';

    //Disable image smoothing
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    var red1 = new Robot("red", 1, 766, 4, false, true, false, false, true, true, 0.75)
    var red2 = new Robot("red", 2, 1072, 10, true, true, false, true, true, false, 0.1)
    var red3 = new Robot("red", 3, 20, 6619, true, false, true, false, false, false, 0.99)

    var blue1 = new Robot("blue", 1, 2637, 10, false, true, false, false, true, true, 0.1)
    var blue2 = new Robot("blue", 2, 4159, 10, false, true, false, true, true, false, 0.5)
    var blue3 = new Robot("blue", 3, 6941, 20, false, true, false, false, false, false, 0)

    red1.draw()
    red2.draw()
    red3.draw()

    blue1.draw()
    blue2.draw()
    blue3.draw()

    window.gameStarted = Math.round(Date.now() / 1000);

    gameTick(red1)
    gameTick(red2)
    gameTick(red3)

    gameTick(blue1)
    gameTick(blue2)
    gameTick(blue3)

    drawTimer()
}
}