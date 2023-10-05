const waitMs = ms => new Promise(res => setTimeout(res, ms));
function goToHome() {
    window.location.href = "/";
}
async function getTeamRanks() {
    eventCode = document.getElementById("eventCode").value
    document.getElementById("viewTeamsButton").innerText = "Requesting Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/teams/2023/${eventCode}`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("200 ok")
            console.log(xhr.responseText)
            document.getElementById("viewTeamsButton").innerText = "Rendering View...";
            document.getElementById("preInsert").insertAdjacentHTML("afterend", xhr.responseText)
            document.getElementById("search").style.display = "none";
            document.getElementById("results").style.display = "flex";
            document.getElementById("eventCodeDisplay").innerText = `Top teams at ${eventCode}`;
            document.getElementById("viewTeamsButton").innerText = "View";
        } else if (xhr.status === 401) {
            console.log("401 failure")
            document.getElementById("viewTeamsButton").innerText = "401 Unauthorized";
            await waitMs(1000);
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            console.log("400 failure")
            document.getElementById("viewTeamsButton").innerText = "400 Bad Request";
        } else if (xhr.status === 500) {
            console.log("500 failure")
            document.getElementById("viewTeamsButton").innerText = "500 Internal Server Error";
        } else {
            console.log("awaiting response")
            document.getElementById("viewTeamsButton").innerText = "Downloading Data...";
        }
    }

    xhr.send()
}