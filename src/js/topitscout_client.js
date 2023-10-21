const waitMs = ms => new Promise((res) => {setTimeout(res, ms)});
function goToHome() {
    window.location.href = "/";
}
window.allTeams = [];
window.scoutedTeams = [];
function getAllTeams() {
    eventCode = document.getElementById("eventCode").value
    document.getElementById("viewTeamsButton").innerHTML = "Requesting Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/events/current/${eventCode}/teams`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            window.allTeams = xhr.responseText.split(",")
            console.log(getDifference())
            document.getElementById("eventLabel").style.display = "none"
            document.getElementById("eventCode").insertAdjacentHTML("afterend", `<div id="unscouted"><br><span>To Scout: </span><br>${getDifference().join("<br>")}</div>`);
            document.getElementById("eventCode").style.display = "none"
            document.getElementById("viewTeamsButton").innerHTML = "Done!";
            return 0;
        } else if (xhr.status === 401 || xhr.status === 403) {
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            document.getElementById("viewTeamsButton").innerHTML = "bad request";
        } else if (xhr.status === 500) {
            document.getElementById("viewTeamsButton").innerHTML = "internal server error";
        } else {
            document.getElementById("viewTeamsButton").innerHTML = "downloading data...";
        }
    }

    xhr.send()
}

function getScoutedTeams() {
    eventCode = document.getElementById("eventCode").value
    document.getElementById("viewTeamsButton").innerHTML = "Requesting Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/teams/current/${eventCode}/pitscoutedteams`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            window.scoutedTeams = xhr.responseText.split(",")
            getAllTeams()
            return 0;
        } else if (xhr.status === 401 || xhr.status == 403) {
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            document.getElementById("viewTeamsButton").innerHTML = "bad request";
        } else if (xhr.status === 500) {
            document.getElementById("viewTeamsButton").innerHTML = "internal server error";
        } else {
            document.getElementById("viewTeamsButton").innerHTML = "downloading data...";
        }
    }

    xhr.send()
}

function getDifference() {
    return window.allTeams.filter(teamNumber => !window.scoutedTeams.includes(teamNumber))
}

function getUnscoutedTeams() {
    getScoutedTeams();
}