import { _get } from "../_modules/get/get.min.js";

function getEventCookie() {
    var cookieString = RegExp("92bdcf1af0a0a23d" + "=[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookieString ? cookieString.toString().replace(/^[^=]+./, "") : "");
}

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const teamNumber = params.get('team')

let pages = Array.from(document.getElementsByClassName("form_pages")) as Array<HTMLDivElement>;

async function getTeamsList() {
    if (teamNumber == null) { window.location.href = "/data" }
    document.getElementsByTagName("tbody")[0].replaceChildren(document.getElementsByTagName("tbody")[0].firstElementChild)
    pages[0].style.display = "flex"; pages[1].style.display = "none";
    _get(`/api/v1/data/brief/team/2025/${getEventCookie()}/${teamNumber}`).then((resJson: { "Brief": { "id": number, "event": String, "season": number, "team": number, "match_num": number, "user_id": number, "name": String, "from_team": number, "weight": String }}[]) => {
        var htmltable = "";
        for (var i = 0; i < resJson.length; i++) {
            htmltable += `<tr><td><a href="/data/detail?id=${resJson[i].Brief.id}" style="font-size: 4vh; color: var(--gameFlairColor);">Match ${resJson[i].Brief.match_num}</a><br><br>#${resJson[i].Brief.id} • from ${resJson[i].Brief.from_team} (${resJson[i].Brief.name})</td></tr>`;
        }
        (document.getElementById("preInsert") as HTMLTableRowElement).insertAdjacentHTML("afterend", htmltable);
        (document.getElementById("eventCodeDisplay") as HTMLHeadingElement).innerText = `Team ${teamNumber} at ${getEventCookie()}`;
        (Array.from(document.getElementsByClassName("actLink")) as Array<HTMLButtonElement>)[0].onclick = () => { window.location.href = `/data/pit?team=${teamNumber}` }
        pages[0].style.display = "none"; pages[1].style.display = "flex";
    }).catch((error: any) => console.log(error));
}

document.body.onload = getTeamsList;