function addProperty(object: any, property: any, amount: any): void {
    if (object[property] !== undefined) {
        object[property] += amount;
    } else {
        object[property] = 0;
        addProperty(object, property, amount);
    }
}
function goToHome() {
    history.back();
}
async function getTeamRanks() {
    const eventCode = (document.getElementById("eventCode") as HTMLInputElement).value;
    const weight = Number((document.getElementById("weightType") as HTMLInputElement).value);
    (document.getElementById("viewTeamsButton") as HTMLButtonElement).innerText = "Requesting Data...";

    const xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open("GET", `/api/teams/current/${eventCode}`, true);
    xhr.withCredentials = true;
    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            (document.getElementById("viewTeamsButton") as HTMLButtonElement).innerText = "Rendering View...";
            var teams: any = {};
            var teamsCount: any = {};
            JSON.parse(xhr.responseText).forEach((e: any) => {
                addProperty(teams, e.team, Number(e.weight.split(",")[Number(weight)]));
                addProperty(teamsCount, e.team, 1);
            });
            for (let team in teams) {
                teams[team] /= teamsCount[team];
            }
            var htmltable: string = "";
            Object.entries(teams).sort((a, b) => Number(b[1]) - Number(a[1])).forEach((e, i, a) => {
                htmltable += `<tr><td>${i + 1}</td><td><a href="/browse?number=${e[0]}&type=team&event=${eventCode}" style="all: unset; color: #2997FF; text-decoration: none;">${e[0]}</a></td><td>${Math.round(Number(e[1]))}%</td><td><progress id="scoreWt" max="${a[0][1]}" value="${Math.round(Number(e[1]))}"></progress></td>`;
            });
            (document.getElementById("preInsert") as HTMLElement).insertAdjacentHTML("afterend", htmltable);
            (document.getElementById("search") as HTMLDivElement).style.display = "none";
            (document.getElementById("results") as HTMLDivElement).style.display = "flex";
            (document.getElementById("eventCodeDisplay") as HTMLHeadingElement).innerHTML = `Top teams at ${eventCode}<br>${(document.getElementById("weightType") as HTMLSelectElement).selectedOptions[0].innerText}`;
            (document.getElementById("viewTeamsButton") as HTMLButtonElement).innerText = "View";
        } else if (xhr.status === 401 || xhr.status === 403) {
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            (document.getElementById("viewTeamsButton") as HTMLButtonElement).innerText = "bad request";
        } else if (xhr.status === 500) {
            (document.getElementById("viewTeamsButton") as HTMLButtonElement).innerText = "internal server error";
        } else if (xhr.status === 502) {
            (document.getElementById("viewTeamsButton") as HTMLButtonElement).innerText = "server error: bad gateway";
        } else {
            (document.getElementById("viewTeamsButton") as HTMLButtonElement).innerText = "downloading data...";
        }
    }
    xhr.send()
}