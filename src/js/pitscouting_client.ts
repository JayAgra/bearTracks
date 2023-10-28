var allTeams: Array<number> = [];

async function getEventTeams() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/events/current/${(document.getElementById('eventCode') as HTMLInputElement).value}/teams`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            allTeams = (xhr.responseText).split(",").map((e) => Number(e));
        } else if (xhr.status === 401 || xhr.status === 403) {
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            document.getElementById("viewNoteButton").innerHTML = "bad request";
        } else if (xhr.status === 500) {
            document.getElementById("viewNoteButton").innerHTML = "internal server error";
        } else if (xhr.status === 502) {
            document.getElementById("viewNoteButton").innerHTML = "server error: bad gateway";
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
    if (allTeams.includes(Number((document.getElementById('validateTeamInput') as HTMLInputElement).value))) {
        console.log("good boy")
        document.getElementById('invalidTeamInput').style.display = "none";
        (document.getElementById('submitButton') as HTMLButtonElement).disabled = false;
    } else {
        console.log("bad bad bad boy")
        document.getElementById('invalidTeamInput').style.display = "inherit";
        (document.getElementById('submitButton') as HTMLButtonElement).disabled = true;
    }
});