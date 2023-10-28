//data validation
var allTeams: Array<number> = [];

async function getEventTeams() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/events/current/${(document.getElementById('eventCode') as HTMLInputElement).value}/teams`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            allTeams = (xhr.responseText).split(",").map((e) => Number(e));
        } else if (xhr.status === 401) {
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            document.getElementById("viewNoteButton").innerHTML = "bad request";
        } else if (xhr.status === 500) {
            document.getElementById("viewNoteButton").innerHTML = "internal server error";
        } else if (xhr.status === 403) {
            document.getElementById("viewNoteButton").innerHTML = "access denied";
        } else {
            console.log("awaiting response")
        }
    }

    xhr.send()
}

// check session
async function checkLogin() {
    try {
        var response = await fetch(`/api/whoami`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
    } catch (error) {
        console.log("failure")
        window.location.href = "/login";
    }
}

getEventTeams()

document.getElementById('eventCode').addEventListener('change', async function(){console.log(getEventTeams()); console.log(allTeams)});

document.getElementById('validateTeamInput').addEventListener('input', function(event){
    console.log("event!")
    if (allTeams.includes(Number((document.getElementById('validateTeamInput') as HTMLInputElement).value))) {
        document.getElementById('invalidTeamInput').style.display = "none";
        (document.getElementById('submitButton') as HTMLButtonElement).removeAttribute("disabled");
    } else {
        document.getElementById('invalidTeamInput').style.display = "inherit";
        (document.getElementById('submitButton') as HTMLButtonElement).setAttribute("disabled", "disabled");
    }
});

document.getElementById('validateLength').addEventListener('input', () => {
    let currentVal: string = (document.getElementById("validateLength") as HTMLInputElement).value;
    if (Number(currentVal) <= 120 && Number(currentVal) >= 0) {
        document.getElementById('tooLong').style.display = "none";
        (document.getElementById("submitButton") as HTMLButtonElement).removeAttribute("disabled");
    } else {
        document.getElementById('tooLong').style.display = "inherit";
        (document.getElementById('submitButton') as HTMLButtonElement).setAttribute("disabled", "disabled");
    }
});
//end data validation

//grid orientation reminder
if (window.innerHeight > window.innerWidth) {
    document.getElementById('landscapeReminder').style.display = "inline";
}

window.addEventListener('resize', function(event){
    if(window.innerHeight > window.innerWidth){
        document.getElementById('landscapeReminder').style.display = "inline";
    } else {
        document.getElementById('landscapeReminder').style.display = "none";
    }
});
//end grid orientation reminder

//grid script
function getAllCells() {
    var cells: Array<HTMLElement> = [];
    for(let j = 1; j < 4; j++) {
        for(let i = 1; i < 10; i++) {
            cells.push(document.getElementById('sgc_' + j + '_' + i) as HTMLElement);
        }
    }
    return cells;
}
var sgCellStatus: Array<number> = [
    0, 0, 0,  0, 0, 0,  0, 0, 0,
    0, 0, 0,  0, 0, 0,  0, 0, 0,
    0, 0, 0,  0, 0, 0,  0, 0, 0
];
const allCells = getAllCells();
function processCellClick(dataNum, numset) {
    sgCellStatus[Number(dataNum)] = numset;
    (document.getElementById('griddata') as HTMLInputElement).value = sgCellStatus.join('');
    console.log((document.getElementById('griddata') as HTMLInputElement).value);
}
function setGray(that: HTMLElement) {
    that.innerText = "";
    if (that.getAttribute("data-coop") == "true") {
        that.style.background = "#bbb";
    } else {
        that.style.background = "#ddd";
    }
    that.setAttribute("data-state", "0")
    processCellClick(that.getAttribute("data-num"), 0);
}
function setSingleCube(that: HTMLElement) {
    that.style.background = "#a216a2";
    that.innerText = "";
    that.setAttribute("data-state", "1")
    processCellClick(that.getAttribute("data-num"), 1);
}
function setSingleCone(that: HTMLElement) {
    that.style.background = "#ff0";
    that.innerText = "";
    that.setAttribute("data-state", "2")
    processCellClick(that.getAttribute("data-num"), 2);
}
function setDoubleCube(that: HTMLElement) {
    that.style.background = "#a216a2";
    that.style.color = "#ff0";
    that.innerText = "2";
    that.setAttribute("data-state", "3")
    processCellClick(that.getAttribute("data-num"), 3);
}
function setDoubleCone(that: HTMLElement) {
    that.style.background = "#ff0";
    that.style.color = "#a216a2";
    that.innerText = "2";
    that.setAttribute("data-state", "5")
    processCellClick(that.getAttribute("data-num"), 4);
}
for (var i = 0; i < allCells.length; i += 1) {
    allCells[i].addEventListener('click', function (e) {
        if (this.getAttribute("data-gp") === "cube") {
            if (this.getAttribute("data-state") === "0") {
                setSingleCube(this);
            } else if (this.getAttribute("data-state") === "1") {
                setDoubleCube(this);
            } else {
                setGray(this);
            }
        } else if (this.getAttribute("data-gp") === "cone") {
            if (this.getAttribute("data-state") === "0") {
                setSingleCone(this);
            } else if (this.getAttribute("data-state") === "2") {
                setDoubleCone(this);
            } else {
                setGray(this);
            }
        } else if (this.getAttribute("data-gp") === "h") {
            if (this.getAttribute("data-state") === "1") {
                setSingleCone(this);
            } else if (this.getAttribute("data-state") === "0") {
                setSingleCube(this);
            } else if (this.getAttribute("data-state") === "3") {
                setDoubleCone(this);
            } else if (this.getAttribute("data-state") === "2") {
                setDoubleCube(this);
            } else {
                setGray(this);
            }
        }
    });
}