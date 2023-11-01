var eventMatches;
var matchesOk = false;
async function loadMatches() {
    try {
        const response = await fetch(`/api/matches/current/${document.getElementById('eventCode').value}/qual/all`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            return window.location.href = "/login";
        }
        if (response.status === 204 || !response.ok) {
            document.getElementById("badEvent").innerHTML = "&emsp;no results";
            document.getElementById("badEvent").style.display = "unset";
        }
        eventMatches = await response.json();
        matchesOk = true;
        document.getElementById("badEvent").style.display = "none";
    }
    catch (err) {
        document.getElementById("badEvent").innerHTML = "&emsp;no results";
        document.getElementById("badEvent").style.display = "unset";
        matchesOk = false;
    }
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
    }
    catch (error) {
        console.log("failure");
        window.location.href = "/login";
    }
}
loadMatches();
validateLengthFn();
matchNumberChange({ "target": document.getElementById('matchNumberInput') });
document.getElementById('eventCode').addEventListener('change', async () => {
    await loadMatches();
});
function setOption(element, value) {
    element.value = String(value);
    element.innerText = String(value);
}
function matchNumberChange(event) {
    if (matchesOk) {
        const errorElement = document.getElementById("badMatchNum");
        if (Number(event.target.value) > 0 && Number(event.target.value) <= eventMatches.Schedule.length) {
            errorElement.style.display = "none";
            document.getElementById("submitButton").removeAttribute("disabled");
            const matchTeams = eventMatches.Schedule[Number(event.target.value) - 1].teams;
            const teamSelectOpts = Array.from(document.getElementsByClassName("teamNumOption"));
            setOption(teamSelectOpts[3], matchTeams[0].teamNumber);
            setOption(teamSelectOpts[4], matchTeams[1].teamNumber);
            setOption(teamSelectOpts[5], matchTeams[2].teamNumber);
            setOption(teamSelectOpts[0], matchTeams[3].teamNumber);
            setOption(teamSelectOpts[1], matchTeams[4].teamNumber);
            setOption(teamSelectOpts[2], matchTeams[5].teamNumber);
        }
        else {
            errorElement.innerHTML = "&emsp;match number must be between 1 and " + eventMatches.Schedule.length;
            errorElement.style.display = "unset";
            document.getElementById('submitButton').setAttribute("disabled", "disabled");
        }
    }
    else {
        window.setTimeout((event) => { matchNumberChange(event); }, 1000);
    }
}
document.getElementById('matchNumberInput').addEventListener('input', (event) => {
    matchNumberChange(event);
});
function validateLengthFn() {
    let currentVal = document.getElementById("validateLength").value;
    if (Number(currentVal) <= 120 && Number(currentVal) >= 0) {
        document.getElementById('tooLong').style.display = "none";
        document.getElementById("submitButton").removeAttribute("disabled");
    }
    else {
        document.getElementById('tooLong').style.display = "inherit";
        document.getElementById('submitButton').setAttribute("disabled", "disabled");
    }
}
document.getElementById('validateLength').addEventListener('input', () => {
    validateLengthFn();
});
function requiredFormFields(event) {
    if (String(event.target.value).length > 0) {
        document.getElementById("submitButton").removeAttribute("disabled");
    }
    else {
        document.getElementById('submitButton').setAttribute("disabled", "disabled");
    }
}
Array.from(document.querySelectorAll("[required]")).forEach((element) => {
    element.addEventListener('input', (event) => {
        requiredFormFields(event);
    });
});
//end data validation
//grid orientation reminder
if (window.innerHeight > window.innerWidth) {
    document.getElementById('landscapeReminder').style.display = "inline";
}
window.addEventListener('resize', function () {
    if (window.innerHeight > window.innerWidth) {
        document.getElementById('landscapeReminder').style.display = "inline";
    }
    else {
        document.getElementById('landscapeReminder').style.display = "none";
    }
});
//end grid orientation reminder
//grid script
function getAllCells() {
    var cells = [];
    for (let j = 1; j < 4; j++) {
        for (let i = 1; i < 10; i++) {
            cells.push(document.getElementById('sgc_' + j + '_' + i));
        }
    }
    return cells;
}
var sgCellStatus = [
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0
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
    }
    else {
        that.style.background = "#ddd";
    }
    that.setAttribute("data-state", "0");
    processCellClick(that.getAttribute("data-num"), 0);
}
function setSingleCube(that) {
    that.style.background = "#a216a2";
    that.innerText = "";
    that.setAttribute("data-state", "1");
    processCellClick(that.getAttribute("data-num"), 1);
}
function setSingleCone(that) {
    that.style.background = "#ff0";
    that.innerText = "";
    that.setAttribute("data-state", "2");
    processCellClick(that.getAttribute("data-num"), 2);
}
function setDoubleCube(that) {
    that.style.background = "#a216a2";
    that.style.color = "#ff0";
    that.innerText = "2";
    that.setAttribute("data-state", "3");
    processCellClick(that.getAttribute("data-num"), 3);
}
function setDoubleCone(that) {
    that.style.background = "#ff0";
    that.style.color = "#a216a2";
    that.innerText = "2";
    that.setAttribute("data-state", "5");
    processCellClick(that.getAttribute("data-num"), 4);
}
for (var i = 0; i < allCells.length; i += 1) {
    allCells[i].addEventListener('click', function () {
        if (this.getAttribute("data-gp") === "cube") {
            if (this.getAttribute("data-state") === "0") {
                setSingleCube(this);
            }
            else if (this.getAttribute("data-state") === "1") {
                setDoubleCube(this);
            }
            else {
                setGray(this);
            }
        }
        else if (this.getAttribute("data-gp") === "cone") {
            if (this.getAttribute("data-state") === "0") {
                setSingleCone(this);
            }
            else if (this.getAttribute("data-state") === "2") {
                setDoubleCone(this);
            }
            else {
                setGray(this);
            }
        }
        else if (this.getAttribute("data-gp") === "h") {
            if (this.getAttribute("data-state") === "1") {
                setSingleCone(this);
            }
            else if (this.getAttribute("data-state") === "0") {
                setSingleCube(this);
            }
            else if (this.getAttribute("data-state") === "3") {
                setDoubleCone(this);
            }
            else if (this.getAttribute("data-state") === "2") {
                setDoubleCube(this);
            }
            else {
                setGray(this);
            }
        }
    });
}
async function post(url, data) {
    const response = await fetch(url, {
        method: "POST",
        cache: "no-cache",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(data),
    });
    return response.json();
}
async function uploadForm() {
    const responses = {
        "event": document.getElementsByName("event")[0].value,
        "match": Number(document.getElementsByName("match")[0].value),
        "level": document.getElementsByName("level")[0].value,
        "team": Number(document.getElementsByName("team")[0].value),
        "game1": document.getElementsByName("game1")[0].value,
        "game2": document.getElementsByName("game2")[0].value,
        "game3": document.getElementsByName("game3")[0].value,
        "game4": document.getElementsByName("game4")[0].value,
        "game5": document.getElementsByName("game5")[0].value,
        "game6": document.getElementsByName("game6")[0].value,
        "game7": document.getElementsByName("game7")[0].value,
        "game8": document.getElementsByName("game8")[0].value,
        "game9": document.getElementsByName("game9")[0].value,
        "game10": Number(document.getElementsByName("game10")[0].value),
        "game11": document.getElementsByName("game11")[0].value,
        "game12": document.getElementsByName("game12")[0].value,
        "game13": Number(document.getElementsByName("game13")[0].value),
        "game14": Number(document.getElementsByName("game14")[0].value),
        "game15": Number(document.getElementsByName("game15")[0].value),
        "game16": Number(document.getElementsByName("game16")[0].value),
        "game17": Number(document.getElementsByName("game17")[0].value),
        "game18": Number(document.getElementsByName("game18")[0].value),
        "game19": Number(document.getElementsByName("game19")[0].value),
        "game20": Number(document.getElementsByName("game20")[0].value),
        "game21": Number(document.getElementsByName("game21")[0].value),
        "game22": Number(document.getElementsByName("game22")[0].value),
        "game23": Number(document.getElementsByName("game23")[0].value),
        "game24": Number(document.getElementsByName("game24")[0].value),
        "game25": Number(document.getElementsByName("game25")[0].value),
        "defend": document.getElementsByName("defend")[0].value,
        "driving": document.getElementsByName("driving")[0].value,
        "overall": document.getElementsByName("overall")[0].value,
    };
    document.getElementById("mainFormHTML").style.display = "none";
    document.getElementById("submitUi").style.display = "unset";
    document.getElementById("reSubmitButton").style.display = "none";
    await new Promise((res) => setTimeout(res, 250));
    post("/submit", responses).then(async (response) => {
        const r = response;
        console.log(r.id);
        document.getElementById("submitText_d").innerText = "Verifying...";
        await new Promise((res) => setTimeout(res, 250));
        try {
            const verifyResp = await fetch(`/api/data/exists/${r.id}`, {
                method: "GET",
                cache: "no-cache",
                credentials: "include",
                redirect: "follow",
            });
            if (verifyResp.status === 401 || verifyResp.status === 403) {
                window.location.href = "/login";
            }
            const checkRemote = await verifyResp.json();
            if (checkRemote.team == responses.team && checkRemote.match == responses.match) {
                document.getElementById("submitText_d").innerText = "Done!";
                document.getElementById("submitProgress_d").value = 100;
                document.getElementById("submitProgress_d").max = 100;
                await new Promise((res) => setTimeout(res, 1500));
                window.location.href = "/";
            }
            else {
                document.getElementById("submitText_d").innerText = "Possible Error";
                document.getElementById("submitProgress_d").value = 0;
                document.getElementById("reSubmitButton").style.display = "unset";
            }
        }
        catch (err) {
            console.log("failure");
            window.location.href = "/login";
        }
    }).catch((error) => {
        document.getElementById("submitText_d").innerText = "ERROR!!!";
        document.getElementById("submitProgress_d").value = 0;
        document.getElementById("reSubmitButton").style.display = "unset";
        console.error(error);
    });
}
