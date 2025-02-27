import { _get } from "../_modules/get/get.min.js";

function getEventCookie() {
    var cookieString = RegExp("92bdcf1af0a0a23d" + "=[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookieString ? cookieString.toString().replace(/^[^=]+./, "") : "");
}

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const idNumber = params.get('id')

let pages = Array.from(document.getElementsByClassName("form_pages")) as Array<HTMLDivElement>;

async function getTeamsList() {
    if (idNumber == null) { window.location.href = "/data" }
    document.getElementsByTagName("tbody")[0].replaceChildren(document.getElementsByTagName("tbody")[0].firstElementChild)
    pages[0].style.display = "flex"; pages[1].style.display = "none";
    _get(`/api/v1/data/detail/${idNumber}}`).then((resJson: { "FullMain": { "id": number, "event": String, "season": number, "team": number, "match_num": number, "level": String, "game": String, "defend": String, "driving": String, "overall": String, "user_id": number, "name": String, "from_team": number, "weight": String, "analysis": String }}) => {
        var htmltable = "";
        
        (document.getElementById("preInsert") as HTMLTableRowElement).insertAdjacentHTML("afterend", htmltable);
        (document.getElementById("eventCodeDisplay") as HTMLHeadingElement).innerText = `Team ${resJson.FullMain.team}, Match ${resJson.FullMain.match_num}`;
        pages[0].style.display = "none"; pages[1].style.display = "flex";
    }).catch((error: any) => console.log(error));
}

document.body.onload = getTeamsList;