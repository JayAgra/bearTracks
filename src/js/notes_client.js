var quill = new Quill('#editor', {
    theme: 'snow'
});

window.currentEvent = 0;
window.currentTeam = 0;

document.getElementById("editor").style.display = "none";

function goToHome() {
    history.back();
}

async function getNote() {
    var eventCode = document.getElementById("eventCode").value;
    var teamNumber = document.getElementById("teamNumber").value;
    window.currentEvent = eventCode;
    window.currentTeam = teamNumber;

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
        } else if (xhr.status === 401 || xhr.status === 403) {
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            document.getElementById("viewNoteButton").innerHTML = "bad request";
        } else if (xhr.status === 500) {
            document.getElementById("viewNoteButton").innerHTML = "500 Internal Server Error";
        } else if (xhr.status === 204 && xhr.responseText == String(0xcc2)) {
            const newxhr = new XMLHttpRequest();
            newxhr.open("GET", `/api/notes/${eventCode}/${teamNumber}/createNote`, true);
            newxhr.withCredentials = true;

            newxhr.onreadystatechange = async () => {
                if (newxhr.readyState === XMLHttpRequest.DONE && newxhr.status === 200) {
                    if (newxhr.responseText == String(0xc81)) {
                        getNote();
                    }
                } else if (newxhr.status === 401 || newxhr.status === 403) {
                    window.location.href = "/login";
                } else if (newxhr.status === 400) {
                    document.getElementById("viewNoteButton").innerHTML = "bad request";
                } else if (newxhr.status === 500) {
                    document.getElementById("viewNoteButton").innerHTML = "internal server error";
                } else {
                    document.getElementById("viewNoteButton").innerHTML = "downloading data...";
                }
            }

            newxhr.send();
        } else {
            document.getElementById("viewNoteButton").innerHTML = "Downloading Data...";
        }
    }

    xhr.send()
}

function saveNote() {
    let eventCode = document.getElementById("eventCode").value
    let teamNumber = document.getElementById("teamNumber").value
    document.getElementById("saveNoteButton").innerHTML = "Saving Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/notes/${eventCode}/${teamNumber}/updateNotes`, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            document.getElementById("saveNoteButton").innerHTML = "rendering...";
            document.getElementById("saveNoteButton").innerHTML = "saved!";
            await waitMs(1000);
            document.getElementById("saveNoteButton").innerHTML = "save";
        } else if (xhr.status === 401 || xhr.status === 403) {
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            document.getElementById("viewNoteButton").innerHTML = "bad request";
        } else if (xhr.status === 500) {
            document.getElementById("viewNoteButton").innerHTML = "internal server error";
        } else {
            document.getElementById("viewNoteButton").innerHTML = "downloading data...";
        }
    }

    xhr.send('save=' + JSON.stringify(quill.getContents()));
}