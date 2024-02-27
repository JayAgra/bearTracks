import { _get } from "../_modules/get/get.min.js";

async function getScoutRanks() {
    const vsButton = (document.getElementById("viewScoutsButton") as HTMLButtonElement);
    vsButton.innerText = "Requesting Data...";
    _get("/api/v1/points/all", vsButton.id).then((resJson) => {
        var htmltable = "";
        for (var i = 0; i < resJson.length; i++) {
            htmltable += `<tr><td><p>${resJson[i].username} (${resJson[i].team})</p></td><td>${Math.round(resJson[i].score)}</td></tr>`;
        }
        (document.getElementById("preInsert") as HTMLTableRowElement).insertAdjacentHTML("afterend", htmltable);
        (document.getElementById("eventCodeDisplay") as HTMLHeadingElement).innerText = `Top scouts`;
        vsButton.innerText = "Reload Data";
    }).catch((error: any) => console.log(error));
}

document.body.onload = getScoutRanks;