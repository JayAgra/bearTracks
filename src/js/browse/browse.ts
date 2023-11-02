import { _get } from "../_modules/get/get.min.js";

var numberInput = document.getElementById("number") as HTMLInputElement,
    eventCode = document.getElementById("event") as HTMLInputElement,
    error = document.getElementById("errorTxt") as HTMLHeadingElement,
    searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;

function eV(value: string): string {
    if (value == "true") {
        return "✅";
    } else {
        return "❌";
    }
}

function callSearch(): void {
    search(Number(numberInput.value), eventCode.value, (document.getElementById("type") as HTMLInputElement).value)
}

type mainFormResponse = {
	"id": string,
	"event": string,
	"season": number,
	"team": number,
	"match": number,
	"level": string,
	"game1": string,
	"game2": string,
	"game3": string,
	"game4": string,
	"game5": string,
	"game6": string,
	"game7": string,
	"game8": string,
	"game9": string,
	"game10": string,
	"game11": string,
	"game12": string,
	"game13": string,
	"game14": string,
	"game15": string,
	"game16": string,
	"game17": string,
	"game18": string,
	"game19": string,
	"game20": string,
	"game21": string,
	"game22": string,
	"game23": string,
	"game24": string,
	"game25": string,
	"defend": string,
	"driving": string,
	"overall": string,
	"userId": string,
	"name": string,
    "fromTeam": number,
	"weight": string,
	"analysis": string,
}

function generateSmallAvgRow(avg: any): string {
    return `<tr><td>avg</td><td></td><td>${Math.round(avg.auto_charge)}</td><td></td><td>${Math.round(avg.teleop_charge)}</td><td>${Math.round(avg.grid)}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>${Math.round(avg.cycle)}</td><td>${avg.perf_score.toFixed(2)}</td></tr>`;
}

async function search(num: number, eCode: string, searchType: string = "team"): Promise<void> {
    if (num < 0 || isNaN(num)) {
        numberInput.style.borderColor = "var(--cancelColor)";
        return;
    }
    var fetchEndpoint: string,
        type: string,
        htmlTable: string = "";
    if (searchType === "team") {
        fetchEndpoint = `/api/data/current/team/${eCode}/${num}`;
        type = "team";
    } else {
        fetchEndpoint = `/api/data/current/match/${eCode}/${num}`;
        type = "match";
    }

    searchBtn.innerText = "requesting...";
    _get(fetchEndpoint, searchBtn.id).then((listRes: Array<mainFormResponse>) => {
        if (type === "team") {
            let avg: {[index: string]:any} = {
                "auto_charge": 0,
                "teleop_charge": 0,
                "grid": 0,
                "cycle": 0,
                "perf_score": 0,
                "lowCube": 0,
                "lowCone": 0,
                "midCube": 0,
                "midCone": 0,
                "highCube": 0,
                "highCone": 0,
                "low": 0,
                "mid": 0,
                "high": 0
            };
            let max: {[index: string]:any} = {
                "auto_charge": 0,
                "teleop_charge": 0,
                "grid": 0,
                "cycle": 0,
                "perf_score": 0
            };
            let min: {[index: string]:any} = {
                "auto_charge": Number.MAX_SAFE_INTEGER,
                "teleop_charge": Number.MAX_SAFE_INTEGER,
                "grid": Number.MAX_SAFE_INTEGER,
                "cycle": Number.MAX_SAFE_INTEGER,
                "perf_score": Number.MAX_SAFE_INTEGER
            };
            function setIfHigher(property: any, value: number): void {
                if (max[property] < value) max[property] = value;
            }
            
            function setIfLower(property: any, value: number): void {
                if (min[property] > value) min[property] = value;
            }
            for (var i = 0; i < listRes.length; i++) {
                htmlTable += ` <tr><td><a href="/detail?id=${listRes[i].id}" target="_blank" style="all: unset; color: #2997FF; text-decoration: none;">${listRes[i].level} ${listRes[i].match}</a><br><span>${listRes[i].name} (${listRes[i].fromTeam})</span></td>` + // match link
                        `<td>${eV(listRes[i].game2)}${eV(listRes[i].game3)}${eV(listRes[i].game4)}</td>` + // auto score
                        `<td>${listRes[i].game5}</td>` + // auto charge
                        `<td>${eV(listRes[i].game6)}${eV(listRes[i].game7)}${eV(listRes[i].game8)}</td>` + // teleop score
                        `<td>${listRes[i].game10}</td>` + // teleop charge
                        `<td>${listRes[i].game25}</td>` + // grid points
                        `<td>${listRes[i].game21}</td><td>${listRes[i].game14}</td><td>${listRes[i].game16}</td>` + // cubes
                        `<td>${listRes[i].game13}</td><td>${listRes[i].game15}</td><td>${listRes[i].game17}</td>` + // cones
                        `<td>${listRes[i].game18}</td><td>${listRes[i].game19}</td><td>${listRes[i].game20}</td>` + // total
                        `<td>${listRes[i].game11}</td>` + // cycle time
                        `<td>${Number(listRes[i].weight.split(",")[0]).toFixed(2)}</td></tr>`; // standard mps
                
                avg.auto_charge += Number(listRes[i].game5);
                avg.teleop_charge += Number(listRes[i].game10);
                avg.grid += Number(listRes[i].game25);
                avg.cycle += Number(listRes[i].game11);
                avg.perf_score += Number(listRes[i].weight.split(",")[0]);
                avg.lowCube += Number(listRes[i].game21);
                avg.lowCone += Number(listRes[i].game13);
                avg.midCube += Number(listRes[i].game14);
                avg.midCone += Number(listRes[i].game15);
                avg.highCube += Number(listRes[i].game16);
                avg.highCone += Number(listRes[i].game17);
                avg.low += Number(listRes[i].game18);
                avg.mid += Number(listRes[i].game19);
                avg.high += Number(listRes[i].game20);

                setIfHigher("auto_charge", Number(listRes[i].game5));
                setIfHigher("teleop_charge", Number(listRes[i].game10));
                setIfHigher("grid", Number(listRes[i].game25));
                setIfHigher("cycle", Number(listRes[i].game11));
                setIfHigher("perf_score", Number(listRes[i].weight.split(",")[0]));

                setIfLower("auto_charge", Number(listRes[i].game5));
                setIfLower("teleop_charge", Number(listRes[i].game10));
                setIfLower("grid", Number(listRes[i].game25));
                setIfLower("cycle", Number(listRes[i].game11));
                setIfLower("perf_score", Number(listRes[i].weight.split(",")[0]));
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
            let avg: {[index: string]:any} = {
                "auto_charge": 0,
                "teleop_charge": 0,
                "grid": 0,
                "cycle": 0,
                "perf_score": 0
            };

            for (var i = 0; i < listRes.length; i++) {
                htmlTable += ` <tr><td><strong>Team ${listRes[i].team}</strong><br><a href="/detail?id=${listRes[i].id}" target="_blank" style="all: unset; color: #2997FF; text-decoration: none;">${listRes[i].level} ${listRes[i].match}</a><br><span>${listRes[i].name} (${listRes[i].team})</span></td><td>${eV(listRes[i].game2)}${eV(listRes[i].game3)}${eV(listRes[i].game4)}</td><td>${listRes[i].game5}</td><td>${eV(listRes[i].game6)}${eV(listRes[i].game7)}${eV(listRes[i].game8)}</td><td>${listRes[i].game10}</td><td>${listRes[i].game25}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>${listRes[i].game11}</td><td>${Number(listRes[i].weight.split(",")[0]).toFixed(2)}</td></tr>`;
                avg.auto_charge += Number(listRes[i].game5);
                avg.teleop_charge += Number(listRes[i].game10);
                avg.grid += Number(listRes[i].game25);
                avg.cycle += Number(listRes[i].game11);
                avg.perf_score += Number(listRes[i].weight.split(",")[0]);
            }

            for (let key in avg) {
                avg[key] /= listRes.length;
            }

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
        _get(`/api/data/current/scout/${userId}`, error.id).then((listRes) => {
            var avg: {[index: string]:any} = {
                "auto_charge": 0,
                "teleop_charge": 0,
                "grid": 0,
                "cycle": 0,
                "perf_score": 0
            };

            var htmlTable = "";
            for (var i = 0; i < listRes.length; i++) {
                htmlTable += ` <tr><td><strong>Team ${listRes[i].team}</strong><br><a href="/detail?id=${listRes[i].id}" target="_blank" style="all: unset; color: #2997FF; text-decoration: none;">${listRes[i].level} ${listRes[i].match}</a></td><td>${eV(listRes[i].game2)}${eV(listRes[i].game3)}${eV(listRes[i].game4)}</td><td>${listRes[i].game5}</td><td>${eV(listRes[i].game6)}${eV(listRes[i].game7)}${eV(listRes[i].game8)}</td><td>${listRes[i].game10}</td><td>${listRes[i].game25}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>${listRes[i].game11}</td><td>${Number(listRes[i].weight.split(",")[0]).toFixed(2)}</td></tr>`;
                avg.auto_charge += Number(listRes[i].game5);
                avg.teleop_charge += Number(listRes[i].game10);
                avg.grid += Number(listRes[i].game25);
                avg.cycle += Number(listRes[i].game11);
                avg.perf_score += Number(listRes[i].weight.split(",")[0]);
            }

            for (let key in avg) {
                avg[key] /= listRes.length;
            }

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
    if (e.key === "Enter") {
        if ((document.getElementById("results") as HTMLElement).style.display === "none") {
            callSearch();
        }
    }
})