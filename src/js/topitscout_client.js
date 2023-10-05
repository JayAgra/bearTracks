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
    xhr.open("GET", `/api/events/${eventCode}/teams`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("200 ok")
            console.log(xhr.responseText)
            window.allTeams = xhr.responseText.split(",")
            console.log(getDifference())
            document.getElementById("eventLabel").style.display = "none"
            document.getElementById("eventCode").insertAdjacentHTML("afterend", `<div id="unscouted"><br><span>To Scout: </span><br>${getDifference().join("<br>")}</div>`);
            document.getElementById("eventCode").style.display = "none"
            document.getElementById("viewTeamsButton").innerHTML = "Done!";
            return 0;
        } else if (xhr.status === 401) {
            console.log("401 failure")
            document.getElementById("viewTeamsButton").innerHTML = "401 Unauthorized";
            await waitMs(1000);
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            console.log("400 failure")
            document.getElementById("viewTeamsButton").innerHTML = "400 Bad Request";
        } else if (xhr.status === 500) {
            console.log("500 failure")
            document.getElementById("viewTeamsButton").innerHTML = "500 Internal Server Error";
        } else {
            console.log("awaiting response")
            document.getElementById("viewTeamsButton").innerHTML = "Downloading Data...";
        }
    }

    xhr.send()
}

function getScoutedTeams() {
    eventCode = document.getElementById("eventCode").value
    document.getElementById("viewTeamsButton").innerHTML = "Requesting Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/events/${eventCode}/pitscoutedteams`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("200 ok")
            console.log(xhr.responseText)
            window.scoutedTeams = xhr.responseText.split(",")
            getAllTeams()
            return 0;
        } else if (xhr.status === 401) {
            console.log("401 failure")
            document.getElementById("viewTeamsButton").innerHTML = "401 Unauthorized";
            await waitMs(1000);
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            console.log("400 failure")
            document.getElementById("viewTeamsButton").innerHTML = "400 Bad Request";
        } else if (xhr.status === 500) {
            console.log("500 failure")
            document.getElementById("viewTeamsButton").innerHTML = "500 Internal Server Error";
        } else {
            console.log("awaiting response")
            document.getElementById("viewTeamsButton").innerHTML = "Downloading Data...";
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