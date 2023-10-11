function addProperty(object, property, amount) {
    if (object[property] !== undefined) {
        object[property] += amount;
    } else {
        object[property] = 0;
        addProperty(object, property, amount);
    }
}
const waitMs = ms => new Promise(res => setTimeout(res, ms));
function goToHome() {
    window.location.href = "/";
}
async function getTeamRanks() {
    const eventCode = document.getElementById("eventCode").value;
    const weight = Number(document.getElementById("weightType").value);
    document.getElementById("viewTeamsButton").innerText = "Requesting Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/teams/2023/${eventCode}`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            document.getElementById("viewTeamsButton").innerText = "Rendering View...";
            var teams = {};
            var teamsCount = {};
            JSON.parse(xhr.responseText).forEach((e) => {
                addProperty(teams, e.team, Number(e.weight.split(",")[Number(weight)]));
                addProperty(teamsCount, e.team, 1);
            });
            for (let team in teams) {
                teams[team] /= teamsCount[team];
            }
            var htmltable = ``;
            Object.entries(teams).sort((a, b) => b[1] - a[1]).forEach((e, i, a) => {
                htmltable += `<tr><td>${i + 1}</td><td><a href="/browse?number=${e[0]}&type=team&event=${eventCode}" style="all: unset; color: #2997FF; text-decoration: none;">${e[0]}</a></td><td>${Math.round(e[1])}%</td><td><progress id="scoreWt" max="${a[0][1]}" value="${Math.round(e[1])}"></progress></td>`;
            });
            document.getElementById("preInsert").insertAdjacentHTML("afterend", htmltable)
            document.getElementById("search").style.display = "none";
            document.getElementById("results").style.display = "flex";
            document.getElementById("eventCodeDisplay").innerHTML = `Top teams at ${eventCode}<br>${document.getElementById("weightType").selectedOptions[0].innerText}`;
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