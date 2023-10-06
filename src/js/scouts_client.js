const waitMs = ms => new Promise(res => setTimeout(res, ms));
function goToHome() {
    window.location.href = "/";
}
async function getTeamRanks() {
    document.getElementById("viewScoutsButton").innerHTML = "Requesting Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/scouts`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            document.getElementById("viewScoutsButton").innerHTML = "Rendering View...";
            document.getElementById("preInsert").insertAdjacentHTML("afterend", xhr.responseText)
            document.getElementById("search").style.display = "none";
            document.getElementById("results").style.display = "flex";
            document.getElementById("eventCodeDisplay").innerHTML = `Top scouts`;
            document.getElementById("viewScoutsButton").innerHTML = "Reload Data";
        } else if (xhr.status === 204 && xhr.responseText == 0xcc1) {
            document.getElementById("viewScoutsButton").innerHTML = "no results";
        } else if (xhr.status === 401 || xhr.status === 403) {
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            document.getElementById("viewScoutsButton").innerHTML = "bad request";
        } else if (xhr.status === 500) {
            document.getElementById("viewScoutsButton").innerHTML = "internal server error";
        } else {
            document.getElementById("viewScoutsButton").innerHTML = "downloading data...";
        }
    }

    xhr.send()
}