var cvss = [];
var ctxs = [];

for (var i = 0; i < document.getElementById('canvasParent').children.length; i++) {
    cvss.push(document.getElementById('canvasParent').children[i])
    ctxs.push(cvss[i].getContext("2d")) 
}

//canvas order
//layer 0 - background
//layer 1 - timer
//layer 2 - red1
//layer 3 - red2
//layer 4 - red3
//layer 5 - blue1
//layer 6 - blue2
//layer 7 - blue3
//layer 8 - red1 object
//layer 9 - red2 object
//layer 10 - red3 object
//layer 11 - blue1 object
//layer 12 - blue2 object
//layer 13 - blue3 object

window.redScore = 0
window.blueScore = 0

var roundNearQtr = function(number) {
    let qtr = Number((100*(Math.round(number * 4) / 4)).toFixed(2))
    if (qtr > 100) {
        return 100;
    } else {
        return qtr;
    }
};

const waitMs = ms => new Promise(res => setTimeout(res, ms));

const assets = ["assets/red-0.png", "assets/red-25.png", "assets/red-50.png", "assets/red-75.png", "assets/red-100.png", "assets/red_disabled.png", "assets/red-d.png", "assets/blue-0.png", "assets/blue-25.png", "assets/blue-50.png", "assets/blue-75.png", "assets/blue-100.png", "assets/blue_disabled.png", "assets/blue-d.png", "assets/cube.png", "assets/cone.png", "assets/clear.png", "assets/charge.png"]

async function loadGame() {
    return assets.map(url => new Promise(resolve => {
        const img = new Image();
        img.onerror = e => reject(`${url} failed to load`);
        img.onload = e => resolve(img);
        img.src = url;
    }));
}

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
    this.canvasNumber = 0,
    this.defended = false,
    this.disabled = false,
    this.startedWait = Math.round(Date.now() / 1000),
    this.init = function() {
        if (this.color === "red") {
            this.canvasNumber = 1 + this.number
        } else {
            this.canvasNumber = 4 + this.number
        }
    },
    this.draw = function() {
        let robonum = this.number;
        let canvasNumber = this.canvasNumber;
        if (this.color === "red") {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber].drawImage(this, cvss[0].width/1.25, cvss[0].height - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/6, cvss[0].height/6)
            }
            image.src = "assets/red-0.png";
        } else {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber].drawImage(this, cvss[0].width/12, cvss[0].height - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/6, cvss[0].height/6)
            }
            image.src = "assets/blue-0.png";
        }
    },
    this.drawPcnt = function(pcnt) {
        let robonum = this.number;
        let canvasNumber = this.canvasNumber;
        if (this.color === "red") {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber].drawImage(this, cvss[0].width/1.25, cvss[0].height - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/6, cvss[0].height/6)
            }
            image.src = "assets/red-" + pcnt + ".png";
        } else {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber].drawImage(this, cvss[0].width/12, cvss[0].height - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/6, cvss[0].height/6)
            }
            image.src = "assets/blue-" + pcnt + ".png";
        }
    },
    this.drawDisabled = function() {
        let robonum = this.number;
        let canvasNumber = this.canvasNumber;
        if (this.color === "red") {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber].drawImage(this, cvss[0].width/1.25, cvss[0].height - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/6, cvss[0].height/6)
            }
            image.src = "assets/red_disabled.png";
        } else {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber].drawImage(this, cvss[0].width/12, cvss[0].height - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/6, cvss[0].height/6)
            }
            image.src = "assets/blue_disabled.png";
        }
    },
    this.drawDefended = function() {
        let robonum = this.number;
        let canvasNumber = this.canvasNumber;
        if (this.color === "red") {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber].drawImage(this, cvss[0].width/1.25, cvss[0].height - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/6, cvss[0].height/6)
            }
            image.src = "assets/red-d.png";
        } else {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber].drawImage(this, cvss[0].width/12, cvss[0].height - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/6, cvss[0].height/6)
            }
            image.src = "assets/blue-d.png";
        }
    },
    this.drawFail = function() {
        let robonum = this.number;
        let canvasNumber = this.canvasNumber;
        if (this.color === "red") {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber].drawImage(this, cvss[0].width/1.25, cvss[0].height - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/6, cvss[0].height/6)
            }
            image.src = "assets/red-fail.png";
        } else {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber].drawImage(this, cvss[0].width/12, cvss[0].height - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/6, cvss[0].height/6)
            }
            image.src = "assets/blue-fail.png";
        }
    },
    this.drawCube = function() {
        let robonum = this.number;
        let canvasNumber = this.canvasNumber;
        if (this.color === "red") {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber].drawImage(this, cvss[0].width/1.475, (cvss[0].height + cvss[0].height/24) - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/12, cvss[0].height/12)
            }
            image.src = "assets/cube.png";
        } else {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber].drawImage(this, cvss[0].width/4, (cvss[0].height + cvss[0].height/24) - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/12, cvss[0].height/12)
            }
            image.src = "assets/cube.png";
        }
    },
    this.drawCone = function() {
        let robonum = this.number;
        let canvasNumber = this.canvasNumber;
        if (this.color === "red") {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber + 6].drawImage(this, cvss[0].width/1.475, cvss[0].height + cvss[0].height/24 - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/12, cvss[0].height/12)
            }
            image.src = "assets/cone.png";
        } else {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber + 6].drawImage(this, cvss[0].width/4, cvss[0].height + cvss[0].height/24 - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/12, cvss[0].height/12)
            }
            image.src = "assets/cone.png";
        }
    },
    this.drawCharge = function() {
        let robonum = this.number;
        let canvasNumber = this.canvasNumber;
        if (this.color === "red") {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber + 6].drawImage(this, cvss[0].width/1.55, cvss[0].height - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/6, cvss[0].height/6)
            }
            image.src = "assets/charge.png";
        } else {
            var image = new Image()
            image.onload = function(){
                ctxs[canvasNumber + 6].drawImage(this, cvss[0].width/4, cvss[0].height - (cvss[0].height/12)*(15 - (robonum*4)), cvss[0].height/6, cvss[0].height/6)
            }
            image.src = "assets/charge.png";
        }
    },
    this.redrawState = function() {
        if (this.disabled) {this.drawDisabled()} else if (this.defended) {this.drawDefended()} else {this.drawPcnt(roundNearQtr(((Date.now() / 1000 - this.startedWait)/this.cycle)))}
    }
}

async function drawTimer() {
    ctxs[1].clearRect(0, 0, cvss[1].width, cvss[1].height);
    ctxs[1].font = "40px mono";
    ctxs[1].fillStyle = "#fff";
    ctxs[1].textAlign = "center"; 
    ctxs[1].fillText(120 - (Math.round(Date.now() / 1000) - window.gameStarted), (cvss[1].width/2) - cvss[1].width/32, cvss[1].height/2);
    ctxs[1].fillText("Blue: " + window.blueScore + "      Red: " + window.redScore, (cvss[1].width/2) - cvss[1].width/32, (cvss[1].height/2) + cvss[1].height/8);
}

function okayToScore(color, level) {
    if (color === "red") {
        return (redGrid[level] < 9)
    } else {
        return (blueGrid[level] < 9)
    }
}

function reportScore(color, level) {
    if (color === "red") {
        redGrid[level]++
    } else {
        blueGrid[level]++
    }
}

function animateMovement(canvas, context, robot, tox, toy) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(imgTag, x, y);
    x += 4;
    y += 4;
    if (x < tox) requestAnimationFrame(animate)
    if (y < toy) requestAnimationFrame(animate)
} 

async function gameTick(robot) {
    if (!robot.disabled) {
        if (((Math.round(Date.now() / 1000) - robot.startedWait)/robot.cycle) > 1) {
            robot.startedWait = Math.round(Date.now() / 1000);
            if (Math.random() < 80/100) {
                if (robot.upper && okayToScore(robot.color, 2)) {
                    if (robot.color === "red") {window.redScore += 5} else {window.blueScore += 5}
                    reportScore(robot.color, 2)
                } else if (robot.middle && okayToScore(robot.color, 1)) {
                    if (robot.color === "red") {window.redScore += 3} else {window.blueScore += 3}
                    reportScore(robot.color, 1)
                } else if (okayToScore(robot.color, 0)) {
                    if (robot.color === "red") {window.redScore += 2} else {window.blueScore += 2}
                    reportScore(robot.color, 0)
                }
                if (robot.cube && robot.cone) {
                    if (Math.random() < 50/100) {
                        robot.drawCube()
                    } else {
                        robot.drawCone()
                    }
                } else if (robot.cube) {
                    robot.drawCube()
                } else {
                    robot.drawCone()
                }
            } else {
                robot.drawFail()
                robot.startedWait = Math.round(Date.now() / 1000);
            }
        }

        if (Math.random() < 0.1/100) {
            //small chance of disabling
            robot.disabled = true;
        }

        if (robot.defends && Math.random() < 25/100) {
            //robot.disabled = true;
        }

        /*await waitMs(200 + Math.random()*800)
        if (((Math.round(Date.now() / 1000) - window.gameStarted) >= 100) && !((Math.round(Date.now() / 1000) - window.gameStarted) >= 120)) {
            console.log("endgame time idiot")
            if (Math.random() < robot.chargePcnt/100) {
                robot.disabled = true;
                robot.drawCharge()
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
        }*/
        return 0;
    }
}

var red1 = new Robot("red", 1, 766, 4, false, true, false, false, true, true, 0.75)
var red2 = new Robot("red", 2, 1072, 10, true, true, false, true, true, false, 0.1)
var red3 = new Robot("red", 3, 6619, 20, true, false, true, false, false, false, 0.99)

var blue1 = new Robot("blue", 1, 2637, 10, true, true, false, false, true, true, 0.1)
var blue2 = new Robot("blue", 2, 4159, 10, true, true, false, true, true, false, 0.5)
var blue3 = new Robot("blue", 3, 6941, 20, false, true, false, false, false, false, 0)

//bottom, middle, top
var blueGrid = [0, 0, 0]
var redGrid = [0, 0, 0]

async function startGame() {
    if (window.innerHeight > window.innerWidth) {
        alert("play in landscape mode, ideally on a phone.")
    } else {
        red1.init()
        red2.init()
        red3.init()

        blue1.init()
        blue2.init()
        blue3.init()
        await loadGame()

        /*if (cvs.requestFullScreen) {
            cvs.requestFullScreen();
        } else if (cvs.webkitRequestFullScreen) {
            cvs.webkitRequestFullScreen();
        } else if (cvs.mozRequestFullScreen) {
            cvs.mozRequestFullScreen();
        }*/

        //Scale canvas
        cvss.forEach(element => {
            element.style.width = window.innerWidth - ((window.innerWidth)%64) + "px"
            element.style.height = window.innerHeight - ((window.innerHeight)%64) + "px"
            element.width = (window.innerWidth - ((window.innerWidth)%64))
            element.height = (window.innerHeight - ((window.innerHeight)%64))
            element.style.display = "inherit";
        });

        ctxs.forEach(element => {
            element.imageSmoothingEnabled = false;
            element.webkitImageSmoothingEnabled = false;
            element.globalCompositeOperation = 'source-over';
        })

        //Hide all but canvas
        document.body.style.overflow = "hidden";
        document.getElementById("title").style.display = "none";
        document.getElementById("playBtn").style.display = "none";
        document.getElementById("backBtn").style.display = "none";
        try {document.getElementById("gameResult").remove()} catch(error){}

        //Clear canvas
        ctxs[0].globalCompositeOperation = 'destination-over';
        ctxs[0].fillStyle = "#121212";
        ctxs[0].fillRect(0, 0, cvss[0].width, cvss[0].height);
        document.body.style.backgroundColor = "#121212";
        ctxs[0].globalCompositeOperation = 'source-over';

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

        window.requestAnimationFrame(runGame)
    }
}

async function runGame() {

    if ((Math.round(Date.now() / 1000) - window.gameStarted) <= 120) {

        drawTimer()

        gameTick(red1)
        gameTick(red2)
        gameTick(red3)

        gameTick(blue1)
        gameTick(blue2)
        gameTick(blue3)

        await waitMs(1000)
    }

    ctxs[0].globalCompositeOperation = 'source-over';
    ctxs[0].fillStyle = "#121212";
    ctxs[0].clearRect(0, 0, cvss[0].width, cvss[0].height);

    red1.redrawState()
    red2.redrawState()
    red3.redrawState()

    blue1.redrawState()
    blue2.redrawState()
    blue3.redrawState()

    window.requestAnimationFrame(runGame)
}