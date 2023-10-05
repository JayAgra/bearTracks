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
        console.log("200 ok")
        console.log(xhr.responseText)
        document.getElementById("viewScoutsButton").innerHTML = "Rendering View...";
        document.getElementById("preInsert").insertAdjacentHTML("afterend", xhr.responseText)
        document.getElementById("search").style.display = "none";
        document.getElementById("results").style.display = "flex";
        document.getElementById("eventCodeDisplay").innerHTML = `Top scouts`;
        document.getElementById("viewScoutsButton").innerHTML = "Reload Data";
    } else if (xhr.status === 401) {
        console.log("401 failure")
        document.getElementById("viewScoutsButton").innerHTML = "401 Unauthorized";
        await waitMs(1000);
        window.location.href = "/login";
    } else if (xhr.status === 400) {
        console.log("400 failure")
        document.getElementById("viewScoutsButton").innerHTML = "400 Bad Request";
    } else if (xhr.status === 500) {
        console.log("500 failure")
        document.getElementById("viewScoutsButton").innerHTML = "500 Internal Server Error";
    } else {
        console.log("awaiting response")
        document.getElementById("viewScoutsButton").innerHTML = "Downloading Data...";
    }
    }

    xhr.send()
}