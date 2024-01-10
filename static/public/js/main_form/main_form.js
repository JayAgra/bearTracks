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
    if (response.status === 401 || response.status === 403)
        window.location.href = "/login";
}
async function loadMatches() {
    try {
        const response = await fetch(`/api/v1/events/matches/2023/${document.getElementById("eventCode").value}/qual/all`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        toLogin(response);
        if (response.status === 204 || !response.ok) {
            return setBadEvent();
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
    _get(`/api/v1/whoami`, null).then((response) => { console.log(response); }).catch((err) => console.log(err));
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
document.getElementById("matchNumberInput").addEventListener("input", (event) => { matchNumberChange(event); });
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
document.getElementById("validateLength").addEventListener("input", () => { validateLengthFn(); });
function requiredFormFields(event) {
    if (String(event.target.value).length > 0) {
        document.getElementById("submitButton").removeAttribute("disabled");
    }
}
Array.from(document.querySelectorAll("[required]")).forEach((element) => {
    element.addEventListener("input", (event) => { requiredFormFields(event); });
});
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
var up_arrows = Array.from(document.getElementsByClassName("sg-c up"));
var count_cells = Array.from(document.getElementsByClassName("sg-c counter"));
var down_arrows = Array.from(document.getElementsByClassName("sg-c down"));
var values = [0, 0, 0];
up_arrows.forEach((arrow) => {
    arrow.addEventListener("click", (e) => {
        up_arrow_click(e);
    });
});
down_arrows.forEach((arrow) => {
    arrow.addEventListener("click", (e) => {
        down_arrow_click(e);
    });
});
function up_arrow_click(e) {
    let ind = Number(e.target.id.substring(3));
    values[ind]++;
    (count_cells[ind].firstChild).innerText = String(values[ind]);
}
function down_arrow_click(e) {
    let ind = Number(e.target.id.substring(3));
    if (values[ind] > 0)
        values[ind]--;
    (count_cells[ind].firstChild).innerText = String(values[ind]);
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
        "season": 2024,
        "event": document.getElementsByName("event")[0].value,
        "match_num": Number(document.getElementsByName("match")[0].value),
        "level": document.getElementsByName("level")[0].value,
        "team": Number(document.getElementsByName("team")[0].value),
        "game": [
            document.getElementsByName("game1")[0].value,
            document.getElementsByName("game2")[0].value,
            document.getElementsByName("game3")[0].value,
            values[0],
            values[1],
            values[2],
            document.getElementsByName("game7")[0].value,
            document.getElementsByName("game8")[0].value,
            document.getElementsByName("game9")[0].value,
            document.getElementsByName("game10")[0].value,
            document.getElementsByName("game11")[0].value,
            document.getElementsByName("game12")[0].value, // NOTE IN TRAP
        ].join(","),
        "defend": document.getElementsByName("defend")[0].value,
        "driving": document.getElementsByName("driving")[0].value,
        "overall": document.getElementsByName("overall")[0].value,
    };
    document.getElementById("mainFormHTML").style.display = "none";
    document.getElementById("submitUi").style.display = "unset";
    document.getElementById("reSubmitButton").style.display = "none";
    const submitText_d = document.getElementById("submitText_d"), submitProgress_d = document.getElementById("submitProgress_d");
    await new Promise((res) => setTimeout(res, 250));
    _post("/api/v1/data/submit", submitText_d.id, responses).then(async (res) => {
        console.log(res.id);
        submitText_d.innerText = "Verifying...";
        await new Promise((res) => setTimeout(res, 250));
        _get(`/api/v1/data/exists/${res.id}`, document.getElementById("submitText_d").id).then(async (checkRemote) => {
            if (checkRemote[0].Exists.team == responses.team && checkRemote[0].Exists.match_num == responses.match_num) {
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
