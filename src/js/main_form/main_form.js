import { _get } from "../_modules/get/get.min.js";
import { _post } from "../_modules/post/post.min.js";
var eventMatches;
var matchesOk = false;
function setBadEvent() {
    document.getElementById("badEvent").innerHTML = "&emsp;no results";
    document.getElementById("badEvent").style.display = "unset";
    matchesOk = false;
}
function toLogin(response) {
    if (response.status === 401 || response.status === 403) {
        window.location.href = "/login";
        return;
    }
    else {
        return;
    }
}
async function loadMatches() {
    try {
        const response = await fetch(`/api/matches/current/${document.getElementById("eventCode").value}/qual/all`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        toLogin(response);
        if (response.status === 204 || !response.ok) {
            setBadEvent();
            return;
        }
        eventMatches = await response.json();
        matchesOk = true;
        document.getElementById("badEvent").style.display = "none";
        matchNumberChange({ "target": document.getElementById("matchNumberInput") });
    }
    catch (err) {
        setBadEvent();
    }
}
// check session
async function checkLogin() {
    _get(`/api/whoami`, null).then((response) => { console.log(response); }).catch((err) => console.log(err));
}
window.checkLogin = checkLogin;
loadMatches();
validateLengthFn();
document.getElementById("eventCode").addEventListener("change", async () => {
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
            document.getElementById("submitButton").setAttribute("disabled", "disabled");
        }
    }
    else {
        window.setTimeout((event) => { matchNumberChange(event); }, 1000);
        document.getElementById("submitButton").setAttribute("disabled", "disabled");
    }
}
document.getElementById("matchNumberInput").addEventListener("input", (event) => {
    matchNumberChange(event);
});
function validateLengthFn() {
    let currentVal = document.getElementById("validateLength").value;
    if (Number(currentVal) <= 120 && Number(currentVal) >= 0) {
        document.getElementById("tooLong").style.display = "none";
        document.getElementById("submitButton").removeAttribute("disabled");
    }
    else {
        document.getElementById("tooLong").style.display = "inherit";
    }
}
document.getElementById("validateLength").addEventListener("input", () => {
    validateLengthFn();
});
function requiredFormFields(event) {
    if (String(event.target.value).length > 0) {
        document.getElementById("submitButton").removeAttribute("disabled");
    }
}
Array.from(document.querySelectorAll("[required]")).forEach((element) => {
    element.addEventListener("input", (event) => {
        requiredFormFields(event);
    });
});
//end data validation
function landscapeReminder() {
    if (window.innerHeight > window.innerWidth) {
        document.getElementById("landscapeReminder").style.display = "inline";
    }
    else {
        document.getElementById("landscapeReminder").style.display = "none";
    }
}
window.addEventListener("resize", landscapeReminder);
function checkFormState() {
    Array.from(document.querySelectorAll("[required]")).forEach((element) => {
        if (element.value.length <= 0) {
            document.getElementById("submitButton").setAttribute("disabled", "disabled");
            return false;
        }
    });
    const currentVal = document.getElementById("validateLength");
    if (Number(currentVal) > 120 && Number(currentVal) < 0) {
        document.getElementById("submitButton").setAttribute("disabled", "disabled");
        return false;
    }
    if (document.getElementById("teamNumber").value === "") {
        document.getElementById("submitButton").setAttribute("disabled", "disabled");
        return false;
    }
    return true;
}
window.checkFormState = checkFormState;
setInterval(checkFormState, 2000);
//grid script
function getAllCells() {
    var cells = [];
    for (let j = 3; j > 0; j--) {
        for (let i = 9; i > 0; i--) {
            document.getElementsByClassName("sg")[0].insertAdjacentHTML("afterbegin", `<div class="sg-c" data-coop="${Math.floor((i - 1) / 3) === 1}" data-num="${26 - cells.length}" id="sgc_${j}_${i}" data-state="0" data-gp="${j === 3 ? "h" : ((i + 1) % 3) === 0 ? "cube" : "cone"}"></div>`);
            cells.push(document.getElementById("sgc_" + j + "_" + i));
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
    document.getElementById("griddata").value = sgCellStatus.join("");
    console.log(document.getElementById("griddata").value);
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
function setThat(that, backgroundHex, textContent, stateAttr, value, color) {
    that.style.background = backgroundHex;
    that.style.color = color;
    that.innerText = textContent;
    that.setAttribute("data-state", stateAttr);
    processCellClick(that.getAttribute("data-num"), value);
}
function setSingleCube(that) {
    setThat(that, "#a216a2", "", "1", 1, "#ff0");
}
function setSingleCone(that) {
    setThat(that, "#ff0", "", "2", 2, "#a216a2");
}
function setDoubleCube(that) {
    setThat(that, "#a216a2", "2", "3", 3, "#ff0");
}
function setDoubleCone(that) {
    setThat(that, "#ff0", "2", "5", 4, "#a216a2");
}
for (var i = 0; i < allCells.length; i += 1) {
    allCells[i].addEventListener("click", function () {
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
function mainFormError(error) {
    document.getElementById("submitText_d").innerText = "ERROR!!!";
    document.getElementById("submitProgress_d").value = 0;
    document.getElementById("reSubmitButton").style.display = "unset";
    console.error(error);
}
async function uploadForm() {
    if (!checkFormState()) {
        alert("there are issues with your form");
        return;
    }
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
    const submitText_d = document.getElementById("submitText_d"), submitProgress_d = document.getElementById("submitProgress_d");
    await new Promise((res) => setTimeout(res, 250));
    _post("/submit", submitText_d.id, responses).then(async (res) => {
        console.log(res.id);
        submitText_d.innerText = "Verifying...";
        await new Promise((res) => setTimeout(res, 250));
        _get(`/api/data/exists/${res.id}`, document.getElementById("submitText_d")).then(async (checkRemote) => {
            if (checkRemote.team == responses.team && checkRemote.match == responses.match) {
                submitText_d.innerText = "Done!";
                submitProgress_d.value = 100;
                submitProgress_d.max = 100;
                await new Promise((res) => setTimeout(res, 1500));
                window.location.href = "/";
            }
            else {
                mainFormError("data mismatch");
            }
        }).catch((error) => {
            mainFormError(error);
        });
    }).catch((error) => {
        mainFormError(error);
    });
}
window.uploadForm = uploadForm;
