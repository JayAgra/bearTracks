const waitMs = (ms) => new Promise((res) => setTimeout(res, ms));

async function startGame() {
    //start game API request
    //run await play() only if 200 retu\rned
    //for testing, play() is here
    document.getElementById("playBtn").innerHTML = "Requesting Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/casino/plinko/startGame`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("200 ok");
            console.log(xhr.responseText);
            const APIData = JSON.parse(xhr.responseText);
            const token = APIData.token;
            const result = await play();

            const secondXHR = new XMLHttpRequest();
            secondXHR.open("GET", `/api/casino/plinko/endGame/${token}/${result}`, true);
            secondXHR.withCredentials = true;

            secondXHR.onreadystatechange = async () => {
                if (secondXHR.readyState === XMLHttpRequest.DONE && secondXHR.status === 200) {
                    console.log("200 ok");
                    console.log(secondXHR.responseText);
                    document.getElementById("wait").innerText = "points added!"
                } else if (secondXHR.status === 401) {
                    console.log("401 failure")
                    document.getElementById("wait").innerHTML = "401 Unauthorized";
                    await waitMs(1000);
                    window.location.href = "/login";
                } else if (secondXHR.status === 400) {
                    console.log("400 failure")
                    document.getElementById("wait").innerText = "cheating detected 🤨"
                }
            }

            xhr.send()
        } else if (xhr.status === 401) {
            console.log("401 failure")
            document.getElementById("playBtn").innerHTML = "401 Unauthorized";
            await waitMs(1000);
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            console.log("400 failure")
            document.getElementById("playBtn").innerHTML = "400 Bad Request";
        } else if (xhr.status === 500) {
            console.log("500 failure")
            document.getElementById("playBtn").innerHTML = "500 Internal Server Error";
        } else {
            console.log("awaiting response")
            document.getElementById("playBtn").innerHTML = "Downloading Data...";
        }
    }

    xhr.send()
}

async function play() {
    document.getElementById("dummy").style.display = "none";
    //not a canvas element! its a DIV named canvas
    var gameView = document.createElement("div");
    gameView.setAttribute("id", "canvas");
    gameView = document.body.appendChild(gameView);

    //modules from Matter.js
    const { Engine, Events, Render, World, Bodies, Body } = Matter;

    var vpWidth = gameView.clientWidth;
    var vpHeight = gameView.clientHeight;

    const engine = Engine.create();
    const render = Render.create({
        element: gameView,
        engine,
        options: {
            vpWidth,
            vpHeight,
            wireframes: false,
            background: "#000",
        },
    });

    //create the bodies
    const scale = vpHeight * 0.05; //scale the rendering
    //left side offset
    const leftOffset = vpWidth / 2 - scale * 3.5;
    var plinkoPegs = [];
    for (var row = -87; row < 13; row++) {
        //if row # is even, go with 7 pegs
        var cols = row % 2 ? 7 : 8;
        //if even, also need to offset
        var offset = row % 2 ? scale / 2 : 0;
        //y-pos to draw at (scale * 2 is the offset for the top)
        var y = scale * 2 + scale * row;

        //create pegs in row
        for (var col = 0; col < cols; col++) {
            plinkoPegs.push(
                Bodies.circle(
                    leftOffset + offset + scale * col,
                    y,
                    scale / 15,
                    {
                        isStatic: true,
                        render: { fillStyle: "#fff" },
                    }
                )
            );
        }
    }

    var sideWallPoints = [
        { x: 0, y: 0 }, //origin
        { x: scale / 2, y: 0 }, //top right
        { x: scale, y: scale }, //middle
        { x: scale / 2, y: 2 * scale }, //bottom right
        { x: 0, y: 2 * scale }, //bottom left
    ];

    var rightSides = [];
    var leftSides = [];

    for (let i = 1; i < 7; i++) {
        //create right side
        rightSides.push(
            Bodies.fromVertices(
                vpWidth / 2 +
                    scale *
                        4.75 /* x-pos: move to right side from half of the width */,
                2 * scale * i +
                    scale /* y-pos: each block is 2 scales. multiply by i to get y-pos, add scale to offset.*/,
                sideWallPoints,
                { render: { fillStyle: "#333" } }
            )
        );

        //create left side
        leftSides.push(
            Bodies.fromVertices(
                vpWidth / 2 -
                    scale *
                        4.75 /* x-pos: move to left side from half of the width */,
                2 * scale * i +
                    scale /* y-pos: each block is 2 scales. multiply by i to get y-pos, add scale to offset.*/,
                sideWallPoints,
                { render: { fillStyle: "#333" } }
            )
        );
    }

    //create single bodies out of the arrays
    var rightBounds = Body.create({
        parts: rightSides,
        isStatic: true,
    });

    var leftBounds = Body.create({
        parts: leftSides,
        isStatic: true,
    });

    //rotate it 180 degrees (pi rad)
    Body.rotate(rightBounds, Math.PI);

    const bottom = [
        Bodies.rectangle(
            vpWidth / 2,
            16.2 * scale,
            10.28 * scale,
            2.5 * scale,
            {
                // bottom
                isStatic: true,
                render: { fillStyle: "#333" },
            }
        ),
        Bodies.rectangle(
            vpWidth / 2 - scale * 4.89,
            14.5 * scale,
            scale / 2,
            scale,
            {
                isStatic: true,
                render: { fillStyle: "#333" },
            }
        ),
        Bodies.rectangle(
            vpWidth / 2 + scale * 4.89,
            14.5 * scale,
            scale / 2,
            scale,
            {
                isStatic: true,
                render: { fillStyle: "#333" },
            }
        ),
    ];
    for (let i = 0; i < 8; i++) {
        // bottom separators
        bottom.push(
            Bodies.rectangle(
                leftOffset + scale * i,
                14.8 * scale,
                scale / 15,
                scale / 2,
                {
                    isStatic: true,
                    render: { fillStyle: "#333" },
                }
            )
        );
    }

    const sensors = [];
    for (let i = 0; i < 9; i++) {
        const sensor = Bodies.rectangle(
            leftOffset - scale / 2 + scale * i,
            14.6 * scale,
            scale * 0.8,
            scale * 0.7,
            {
                isSensor: true,
                isStatic: true,
                render: { opacity: 0.0 },
            }
        );
        sensor.__data__ = i;
        sensors.push(sensor);
    }

    //support for many balls
    var balls = [];
    for (let i = 0; i < 1; i++) {
        const newBall = Bodies.circle(
            vpWidth / 2 - Math.random() * scale,
            scale * 0.25,
            scale * Math.PI * 0.1075 + Math.random() * 0.105,
            {
                restitution: Math.random() * 0.175 + 0.275,
                render: {
                    fillStyle: "#a216a2",
                },
            }
        );
        balls.push(newBall);
    }

    //collision evt
    Events.on(engine, "collisionStart", function (event) {
        var pairs = event.pairs;
        for (var i = 0, j = pairs.length; i !== j; i++) {
            let pairObj = pairs[i];
            if (pairObj.bodyA.isSensor) {
                pickPointAmount(pairObj.bodyA.__data__);
            } else if (pairObj.bodyB.isSensor) {
                pickPointAmount(pairObj.bodyB.__data__);
            }
        }
    });

    World.add(engine.world, [
        ...plinkoPegs,
        leftBounds,
        rightBounds,
        ...bottom,
        ...sensors,
        ...balls,
    ]);

    Engine.run(engine);
    Render.run(render);

    //copied and pasted from stackoverflow
    function shuffle(a) {
        let j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    //create DIVs with results
    var names = shuffle([
        "0",
        "2",
        "3",
        "5",
        "10",
        "20",
        "75",
        "0",
        "2",
        "3",
        "5",
        "0",
        "2",
        "3",
        "5",
    ])
        .slice(0, 9)
        .map((item, index) => {
            const div = document.createElement("div");
            div.classList.add("score");
            div.style.left = leftOffset - scale * 1.525 + scale * index + "px";
            div.style.top = 15.8 * scale + "px";
            div.style.height = scale * 0.325 + "px";
            div.style.width = 1.6 * scale + "px";
            div.style.padding = scale / 4.5 + "px";
            div.innerText = item;
            document.body.append(div);
            return div;
        });
    
    var endgameRunning = false;
    
    async function pickPointAmount(i) {
        if (endgameRunning) {return;}
        endgameRunning = true;

        names[i].classList.add("sel");
        const amount = Number(names[i].innerText);
        console.log(amount);

        //start API request here

        //start falling animation setup
        document.querySelectorAll(".score").forEach((e) => e.remove());
        Body.setStatic(balls[0], true);
        Body.setStatic(rightBounds, false);
        Body.setStatic(leftBounds, false);
        plinkoPegs.forEach((item) => {
            Body.setMass(item, Math.random() * (item.width * item.height));
            Body.setStatic(item, false);
        });
        bottom.forEach((item) => {
            Body.setMass(item, Math.random() * (item.width * item.height));
            Body.setStatic(item, false);
        });
        sensors.forEach((item) => {
            Body.setMass(item, Math.random() * (item.width * item.height));
            Body.setStatic(item, false);
        });
        Body.applyForce(
            rightBounds,
            { x: 0, y: 0 },
            Matter.Vector.create(0, 0)
        );
        Body.applyForce(leftBounds, { x: 0, y: 0 }, Matter.Vector.create(0, 0));
        //end setup
        //wait for a bit
        await waitMs(1500);
        //have the ball start falling
        Body.setStatic(balls[0], false);
        //wait to stop game
        await waitMs(1000);
        Engine.clear(engine);
        Render.stop(render);
        
        //end game screen
        gameView.style.display = "none";
        document.getElementById("pts").innerText = "you won " + amount + " points"
        document.getElementById("gameover").style.display = "flex";

        return amount;
    }
}