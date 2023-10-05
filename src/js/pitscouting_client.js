var allTeams = [];

async function getEventTeams() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/events/${document.getElementById('eventCode').value}/teams`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        console.log("200 ok")
        console.log(xhr.responseText)
        allTeams = (xhr.responseText).split(",")
    } else if (xhr.status === 401) {
        console.log("401 failure")
        window.location.href = "/login";
    } else if (xhr.status === 400) {
        console.log("400 failure")
        document.getElementById("viewNoteButton").innerHTML = "400 Bad Request";
    } else if (xhr.status === 500) {
        console.log("500 failure")
    } else if (xhr.status === 403) {
        console.log("403 failure")
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
        console.log("good boy")
        document.getElementById('invalidTeamInput').style.display = "none";
        document.getElementById('submitButton').disabled = "false";
    } else {
        console.log("bad bad bad boy")
        document.getElementById('invalidTeamInput').style.display = "inherit";
        document.getElementById('submitButton').disabled = "true";
    }
});

function goToHome() {
    window.location.href = "/";
}