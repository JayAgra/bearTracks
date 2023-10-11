const waitMs = ms => new Promise(res => setTimeout(res, ms));
function goToHome() {
    window.location.href = "/";
}
async function getTeamRanks() {
    eventCode = document.getElementById("eventCode").value;
    weight = Number(document.getElementById("weightType").value);
    document.getElementById("viewTeamsButton").innerText = "Requesting Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/teams/2023/${eventCode}/${weight}`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            document.getElementById("viewTeamsButton").innerText = "Rendering View...";
            document.getElementById("preInsert").insertAdjacentHTML("afterend", xhr.responseText)
            document.getElementById("search").style.display = "none";
            document.getElementById("results").style.display = "flex";
            document.getElementById("eventCodeDisplay").innerText = `Top teams at ${eventCode}`;
            document.getElementById("viewTeamsButton").innerText = "View";
        } else if (xhr.status === 401 || xhr.status === 403) {
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            document.getElementById("viewTeamsButton").innerText = "bad request";
        } else if (xhr.status === 500) {
            document.getElementById("viewTeamsButton").innerText = "internal server error";
        } else if (xhr.status === 502) {
            document.getElementById("viewTeamsButton").innerText = "server error: bad gateway";
        } else {
            document.getElementById("viewTeamsButton").innerText = "downloading data...";
        }
    }

    xhr.send()
}