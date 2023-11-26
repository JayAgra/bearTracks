import { _get } from "../_modules/get/get.min.js";

var numberInput = document.getElementById("number") as HTMLInputElement,
    eventCode = document.getElementById("event") as HTMLInputElement,
    error = document.getElementById("errorTxt") as HTMLHeadingElement,
    searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;

function eV(value: string): string {
    return value == "true" ? "✅" : "❌";
}

function callSearch(): void {
    search(Number(numberInput.value), eventCode.value, (document.getElementById("type") as HTMLInputElement).value)
}
(window as any).callSearch = callSearch;

type mainFormResponse = { "id": string, "event": string, "season": number, "team": number, "match_num": number, "game": string, "user_id": string, "name": string, "from_team": number, "weight": string, }

function generateSmallAvgRow(avg: any): string {
    return `<tr><td>avg</td><td></td><td>${Math.round(avg.auto_charge)}</td><td></td><td>${Math.round(avg.teleop_charge)}</td><td>${Math.round(avg.grid)}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>${Math.round(avg.cycle)}</td><td>${avg.perf_score.toFixed(2)}</td></tr>`;
}

async function search(num: number, eCode: string, searchType: string = "team"): Promise<void> {
    if (num < 0 || isNaN(num)) {
        numberInput.style.borderColor = "var(--cancelColor)"; return;
    }
    var fetchEndpoint: string, htmlTable: string = "";
    if (searchType === "team") {
        fetchEndpoint = `/api/v1/data/brief/team/${new Date().getFullYear()}/${eCode}/${num}`;
    } else {
        fetchEndpoint = `/api/v1/data/brief/match/${new Date().getFullYear()}/${eCode}/${num}`;
    }

    searchBtn.innerText = "requesting...";
    _get(fetchEndpoint, searchBtn.id).then((listRes: Array<{"Brief": mainFormResponse}>) => {
        if (listRes.length === 0) {
            searchBtn.innerText = "no results"; return;
        }
        if (searchType === "team") {
            let avg: {[index: string]:any} = { "auto_charge": 0, "teleop_charge": 0, "grid": 0, "cycle": 0, "perf_score": 0, "lowCube": 0, "lowCone": 0, "midCube": 0, "midCone": 0, "highCube": 0, "highCone": 0, "low": 0, "mid": 0, "high": 0 };
            let max: {[index: string]:any} = { "auto_charge": 0, "teleop_charge": 0, "grid": 0, "cycle": 0, "perf_score": 0 };
            let min: {[index: string]:any} = { "auto_charge": Number.MAX_SAFE_INTEGER, "teleop_charge": Number.MAX_SAFE_INTEGER, "grid": Number.MAX_SAFE_INTEGER, "cycle": Number.MAX_SAFE_INTEGER, "perf_score": Number.MAX_SAFE_INTEGER };
            function setIfHigher(property: any, value: number): void { if (max[property] < value) max[property] = value; }
            function setIfLower(property: any, value: number): void { if (min[property] > value) min[property] = value; }
            for (var i = 0; i < listRes.length; i++) {
                let game_data = listRes[i].Brief.game.split(",");
                htmlTable += ` <tr><td><a href="/detail?id=${listRes[i].Brief.id}" target="_blank" style="all: unset; color: #2997FF; text-decoration: none;">qual ${listRes[i].Brief.match_num}</a><br><span>${listRes[i].Brief.name} (${listRes[i].Brief.from_team})</span></td>` + // match link
                        `<td>${eV(game_data[1])}${eV(game_data[2])}${eV(game_data[3])}</td>` + // auto score
                        `<td>${game_data[4]}</td>` + // auto charge
                        `<td>${eV(game_data[5])}${eV(game_data[6])}${eV(game_data[7])}</td>` + // teleop score
                        `<td>${game_data[9]}</td>` + // teleop charge
                        `<td>${game_data[24]}</td>` + // grid points
                        `<td>${game_data[20]}</td><td>${game_data[13]}</td><td>${game_data[15]}</td>` + // cubes
                        `<td>${game_data[12]}</td><td>${game_data[14]}</td><td>${game_data[16]}</td>` + // cones
                        `<td>${game_data[17]}</td><td>${game_data[18]}</td><td>${game_data[19]}</td>` + // total
                        `<td>${game_data[10]}</td>` + // cycle time
                        `<td>${Number(listRes[i].Brief.weight.split(",")[0]).toFixed(2)}</td></tr>`; // standard mps
                
                avg.auto_charge += Number(game_data[4]);
                avg.teleop_charge += Number(game_data[9]);
                avg.grid += Number(game_data[24]);
                avg.cycle += Number(game_data[10]);
                avg.perf_score += Number(listRes[i].Brief.weight.split(",")[0]);
                avg.lowCube += Number(game_data[20]);
                avg.lowCone += Number(game_data[12]);
                avg.midCube += Number(game_data[13]);
                avg.midCone += Number(game_data[14]);
                avg.highCube += Number(game_data[15]);
                avg.highCone += Number(game_data[16]);
                avg.low += Number(game_data[17]);
                avg.mid += Number(game_data[18]);
                avg.high += Number(game_data[18]);

                setIfHigher("auto_charge", Number(game_data[4]));
                setIfHigher("teleop_charge", Number(game_data[9]));
                setIfHigher("grid", Number(game_data[24]));
                setIfHigher("cycle", Number(game_data[10]));
                setIfHigher("perf_score", Number(listRes[i].Brief.weight.split(",")[0]));

                setIfLower("auto_charge", Number(game_data[4]));
                setIfLower("teleop_charge", Number(game_data[9]));
                setIfLower("grid", Number(game_data[24]));
                setIfLower("cycle", Number(game_data[10]));
                setIfLower("perf_score", Number(listRes[i].Brief.weight.split(",")[0]));
            }

            for (let key in avg) {
                avg[key] /= listRes.length;
            }

            for (let key in min) {
                if (min[key] === Number.MAX_SAFE_INTEGER) min[key] = "und";        
            }

            htmlTable += `<tr style="font-weight: bold"><td>avg</td>` + // match link
                    `<td></td>` + // auto score
                    `<td>${Math.round(avg.auto_charge)} (${min.auto_charge} - ${max.auto_charge})</td>` + // auto charge
                    `<td></td>` + // teleop score
                    `<td>${Math.round(avg.teleop_charge)} (${min.teleop_charge} - ${max.teleop_charge})</td>` + // teleop charge
                    `<td>${Math.round(avg.grid)} (${min.grid} - ${max.grid})</td>` + // grid points
                    `<td>${Math.round(avg.lowCube)}</td><td>${Math.round(avg.midCube)}</td><td>${Math.round(avg.highCube)}</td>` + // cubes
                    `<td>${Math.round(avg.lowCone)}</td><td>${Math.round(avg.midCone)}</td><td>${Math.round(avg.highCone)}</td>` + // cones
                    `<td>${Math.round(avg.low)}</td><td>${Math.round(avg.mid)}</td><td>${Math.round(avg.high)}</td>` + // total
                    `<td>${Math.round(avg.cycle)} (${min.cycle} - ${max.cycle})</td>` + // cycle time
                    `<td>${avg.perf_score.toFixed(2)} (${min.perf_score.toFixed(2)} - ${max.perf_score.toFixed(2)})</td></tr>`; // standard mps
            
        } else {
            let avg: {[index: string]:any} = { "auto_charge": 0, "teleop_charge": 0, "grid": 0, "cycle": 0, "perf_score": 0 };

            for (var i = 0; i < listRes.length; i++) {
                let game_data = listRes[i].Brief.game.split(",");
                htmlTable += ` <tr><td><strong>Team ${listRes[i].Brief.team}</strong><br><a href="/detail?id=${listRes[i].Brief.id}" target="_blank" style="all: unset; color: #2997FF; text-decoration: none;">qual ${listRes[i].Brief.match_num}</a><br><span>${listRes[i].Brief.name} (${listRes[i].Brief.team})</span></td><td>${eV(game_data[1])}${eV(game_data[2])}${eV(game_data[3])}</td><td>${game_data[4]}</td><td>${eV(game_data[5])}${eV(game_data[6])}${eV(game_data[7])}</td><td>${game_data[9]}</td><td>${game_data[24]}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>${game_data[10]}</td><td>${Number(listRes[i].Brief.weight.split(",")[0]).toFixed(2)}</td></tr>`;
                avg.auto_charge += Number(game_data[4]);
                avg.teleop_charge += Number(game_data[9]);
                avg.grid += Number(game_data[24]);
                avg.cycle += Number(game_data[10]);
                avg.perf_score += Number(listRes[i].Brief.weight.split(",")[0]);
            }
            for (let key in avg) { avg[key] /= listRes.length; }
            htmlTable += generateSmallAvgRow(avg);
        }
        (document.getElementById("subheadings") as HTMLElement).insertAdjacentHTML("afterend", htmlTable);
        (document.getElementById("search") as HTMLElement).style.display = "none";
        (document.getElementById("results") as HTMLElement).style.display = "flex";
    }).catch((err) => console.log(err));
}

async function searchOnLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userId");
    if (userId) {
        _get(`/api/v1/data/user/${new Date().getFullYear()}/${userId}`, error.id).then((listRes) => {
            if (listRes.length === 0) {
                searchBtn.innerText = "no results"; return;
            }
            var avg: {[index: string]:any} = { "auto_charge": 0, "teleop_charge": 0, "grid": 0, "cycle": 0, "perf_score": 0 };

            var htmlTable = "";
            for (var i = 0; i < listRes.length; i++) {
                let game_data = listRes[i].game.split(",");
                htmlTable += ` <tr><td><strong>Team ${listRes[i].team}</strong><br><a href="/detail?id=${listRes[i].id}" target="_blank" style="all: unset; color: #2997FF; text-decoration: none;">qual ${listRes[i].match_num}</a></td><td>${eV(game_data[1])}${eV(game_data[2])}${eV(game_data[3])}</td><td>${game_data[4]}</td><td>${eV(game_data[5])}${eV(game_data[6])}${eV(game_data[7])}</td><td>${game_data[9]}</td><td>${game_data[24]}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>${game_data[10]}</td><td>${Number(listRes[i].weight.split(",")[0]).toFixed(2)}</td></tr>`;
                avg.auto_charge += Number(game_data[4]);
                avg.teleop_charge += Number(game_data[9]);
                avg.grid += Number(game_data[24]);
                avg.cycle += Number(game_data[10]);
                avg.perf_score += Number(listRes[i].weight.split(",")[0]);
            }

            for (let key in avg) { avg[key] /= listRes.length; }

            htmlTable += generateSmallAvgRow(avg);
            (document.getElementById("subheadings") as HTMLElement).insertAdjacentHTML("afterend", htmlTable);
            (document.getElementById("search") as HTMLElement).style.display = "none";
            (document.getElementById("results") as HTMLElement).style.display = "flex";
        }).catch((err) => console.log(err));
    } else {
        if (urlParams.get("number") && urlParams.get("event") && urlParams.get("type")) {
            search(Number(urlParams.get("number")), urlParams.get("event") as string, urlParams.get("type") as string);
        }
    }
}

(window as any).searchOnLoad = searchOnLoad;
(window as any).search = search;

(document.getElementById("number") as HTMLInputElement).addEventListener("keyup", (e) => {
    if ((e.target as HTMLInputElement).value !== "") {
        (document.getElementById("number") as HTMLInputElement).style.borderColor = "var(--defaultInputColor)";
    }
})

window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (document.getElementById("results") as HTMLElement).style.display === "none") { callSearch(); }
})