var quill = new Quill('#editor', {
    theme: 'snow'
});

window.currentEvent = 0;
window.currentTeam = 0;

document.getElementById("editor").style.display = "none";

const waitMs = ms => new Promise(res => setTimeout(res, ms));
function goToHome() {
    window.location.href = "/";
}

async function getNote() {
    eventCode = document.getElementById("eventCode").value
    teamNumber = document.getElementById("teamNumber").value
    window.currentEvent = eventCode
    window.currentTeam = teamNumber

    document.getElementById("viewNoteButton").innerHTML = "Requesting Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/notes/${eventCode}/${teamNumber}/getNotes`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("200 ok")
            console.log(xhr.responseText)
            document.getElementById("viewNoteButton").innerHTML = "Rendering View...";
            document.getElementById("searchContainer").style.display = "none";
            document.getElementById("edit").style.display = "inherit";
            document.getElementById("editor").style.display = "inherit";
            document.getElementById("viewNoteButton").innerHTML = "View";
            quill.setContents(JSON.parse(xhr.responseText))
    } else if (xhr.status === 401) {
        console.log("401 failure")
        document.getElementById("viewNoteButton").innerHTML = "401 Unauthorized";
        await waitMs(1000);
        window.location.href = "/login";
    } else if (xhr.status === 400) {
        console.log("400 failure")
        document.getElementById("viewNoteButton").innerHTML = "400 Bad Request";
    } else if (xhr.status === 500) {
        console.log("500 failure")
        document.getElementById("viewNoteButton").innerHTML = "500 Internal Server Error";
        if (xhr.responseText == "none") {
                const newxhr = new XMLHttpRequest();
                newxhr.open("GET", `/api/notes/${eventCode}/${teamNumber}/createNote`, true);
                newxhr.withCredentials = true;

                newxhr.onreadystatechange = async () => {
                if (newxhr.readyState === XMLHttpRequest.DONE && newxhr.status === 200) {
                    getNote()
                } else if (newxhr.status === 401) {
                    console.log("401 failure")
                    document.getElementById("viewNoteButton").innerHTML = "401 Unauthorized";
                    await waitMs(1000);
                    window.location.href = "/login";
                } else if (newxhr.status === 400) {
                    console.log("400 failure")
                    document.getElementById("viewNoteButton").innerHTML = "400 Bad Request";
                } else if (newxhr.status === 500) {
                    console.log("500 failure")
                    document.getElementById("viewNoteButton").innerHTML = "500 Internal Server Error";
                } else {
                    console.log("awaiting response")
                    document.getElementById("viewNoteButton").innerHTML = "Downloading Data...";
                }
                }

                newxhr.send()
        }
    } else if (xhr.status === 403) {
        if (xhr.responseText == "none") {
                const newxhr = new XMLHttpRequest();
                newxhr.open("GET", `/api/notes/${eventCode}/${teamNumber}/createNote`, true);
                newxhr.withCredentials = true;

                newxhr.onreadystatechange = async () => {
                if (newxhr.readyState === XMLHttpRequest.DONE && newxhr.status === 200) {
                    getNote()
                } else if (newxhr.status === 401) {
                    console.log("401 failure")
                    document.getElementById("viewNoteButton").innerHTML = "401 Unauthorized";
                    await waitMs(1000);
                    window.location.href = "/login";
                } else if (newxhr.status === 400) {
                    console.log("400 failure")
                    document.getElementById("viewNoteButton").innerHTML = "400 Bad Request";
                } else if (newxhr.status === 500) {
                    console.log("500 failure")
                    document.getElementById("viewNoteButton").innerHTML = "500 Internal Server Error";
                } else {
                    console.log("awaiting response")
                    document.getElementById("viewNoteButton").innerHTML = "Downloading Data...";
                }
                }

                newxhr.send()
        }
    } else {
        console.log("awaiting response")
        document.getElementById("viewNoteButton").innerHTML = "Downloading Data...";
    }
    }

    xhr.send()
}

function saveNote() {
    var newContent = JSON.toString(quill.getContents());

    eventCode = document.getElementById("eventCode").value
    teamNumber = document.getElementById("teamNumber").value
    document.getElementById("saveNoteButton").innerHTML = "Saving Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/notes/${eventCode}/${teamNumber}/updateNotes`, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        console.log("200 ok")
        console.log(xhr.responseText)
        document.getElementById("saveNoteButton").innerHTML = "Rendering View...";
        document.getElementById("saveNoteButton").innerHTML = "Saved!";
        await waitMs(1000)
        document.getElementById("saveNoteButton").innerHTML = "Save";
    } else if (xhr.status === 401) {
        console.log("401 failure")
        document.getElementById("viewNoteButton").innerHTML = "401 Unauthorized";
        await waitMs(1000);
        window.location.href = "/login";
    } else if (xhr.status === 400) {
        console.log("400 failure")
        document.getElementById("viewNoteButton").innerHTML = "400 Bad Request";
    } else if (xhr.status === 500) {
        console.log("500 failure")
        document.getElementById("viewNoteButton").innerHTML = "500 Internal Server Error";
    } else {
        console.log("awaiting response")
        document.getElementById("viewNoteButton").innerHTML = "Downloading Data...";
    }
    }

    xhr.send('save=' + JSON.stringify(quill.getContents()));
}