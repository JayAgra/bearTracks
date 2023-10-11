//data validation
var allTeams = [];

async function getEventTeams() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/events/${document.getElementById('eventCode').value}/teams`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            allTeams = (xhr.responseText).split(",");
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

getEventTeams()

document.getElementById('eventCode').addEventListener('change', async function(){console.log(getEventTeams()); console.log(allTeams)});

document.getElementById('validateTeamInput').addEventListener('input', function(event){
    console.log("event!")
    if (allTeams.includes(document.getElementById('validateTeamInput').value)) {
        document.getElementById('invalidTeamInput').style.display = "none";
        document.getElementById('submitButton').removeAttribute("disabled");
    } else {
        document.getElementById('invalidTeamInput').style.display = "inherit";
        document.getElementById('submitButton').setAttribute("disabled", "disabled");
    }
});

document.getElementById('validateLength').addEventListener('input', () => {
    let currentVal = document.getElementById("validateLength").value;
    if (currentVal <= 120 && currentVal >= 0) {
        document.getElementById('tooLong').style.display = "none";
        submitButton.removeAttribute("disabled");
    } else {
        document.getElementById('tooLong').style.display = "inherit";
        submitButton.setAttribute("disabled", "disabled");
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
    var cells = [];
    for(let j = 1; j < 4; j++) {
        for(let i = 1; i < 10; i++) {
            cells.push(document.getElementById('sgc_' + j + '_' + i))
        }
    }
    return cells;
}
var sgCellStatus = [
    0, 0, 0,  0, 0, 0,  0, 0, 0,
    0, 0, 0,  0, 0, 0,  0, 0, 0,
    0, 0, 0,  0, 0, 0,  0, 0, 0
];
const allCells = getAllCells();
function processCellClick(dataNum, numset) {
    sgCellStatus[Number(dataNum)] = numset;
    document.getElementById('griddata').value = sgCellStatus.join('');
    console.log(document.getElementById('griddata').value);
}
function setGray(that) {
    that.innerText = "";
    if (that.getAttribute("data-coop") == "true") {
        that.style.background = "#bbb";
    } else {
        that.style.background = "#ddd";
    }
    that.setAttribute("data-state", "0")
    processCellClick(that.getAttribute("data-num"), 0);
}
function setSingleCube(that) {
    that.style.background = "#a216a2";
    that.innerText = "";
    that.setAttribute("data-state", "1")
    processCellClick(that.getAttribute("data-num"), 1);
}
function setSingleCone(that) {
    that.style.background = "#ff0";
    that.innerText = "";
    that.setAttribute("data-state", "2")
    processCellClick(that.getAttribute("data-num"), 2);
}
function setDoubleCube(that) {
    that.style.background = "#a216a2";
    that.style.color = "#ff0";
    that.innerText = "2";
    that.setAttribute("data-state", "3")
    processCellClick(that.getAttribute("data-num"), 3);
}
function setDoubleCone(that) {
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