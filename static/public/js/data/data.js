import { _get } from "../_modules/get/get.min.js";
function getEventCookie() {
    var cookieString = RegExp("92bdcf1af0a0a23d" + "=[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookieString ? cookieString.toString().replace(/^[^=]+./, "") : "");
}
let pages = Array.from(document.getElementsByClassName("form_pages"));
let buttons = Array.from(document.getElementsByClassName("actionButton"));
async function getTeamsList() {
    disableButton(0);
    showPage(0);
    document.getElementsByTagName("tbody")[0].replaceChildren(document.getElementsByTagName("tbody")[0].firstElementChild);
    _get(`/api/v1/data/teams/2025/${getEventCookie()}`).then((resJson) => {
        resJson.sort((a, b) => {
            const weightA = parseFloat(a.Team.weight.split(",")[0]);
            const weightB = parseFloat(b.Team.weight.split(",")[0]);
            return weightB - weightA;
        });
        var htmltable = "";
        for (var i = 0; i < resJson.length; i++) {
            htmltable += `<tr><td>&emsp;<a href="/data/team?team=${resJson[i].Team.team}" style="font-size: 5vh; color: var(--gameFlairColor);">${resJson[i].Team.team}</a>&emsp;</td><td><span style="font-size: 3.5vh">&emsp;${Math.round(parseFloat(resJson[i].Team.weight.split(",")[0]))}&emsp;</span></td></tr>`;
        }
        document.getElementById("preInsert").insertAdjacentHTML("afterend", htmltable);
        showPage(1);
    }).catch((error) => console.log(error));
}
async function getMatchesList() {
    disableButton(1);
    showPage(0);
    document.getElementById("preInsertMatch").innerHTML = "";
    _get(`/api/v1/events/matches/2025/${getEventCookie()}/qualification/all`).then((resJson) => {
        var htmltable = "";
        for (var i = 0; i < resJson.Schedule.length; i++) {
            htmltable += `<hr><div class="VStack"><label><b>${resJson.Schedule[i].description}</b><br>${(resJson.Schedule[i].startTime).replace("T", " ")}</label><br><div class="HStack"><div class="VStack" style="padding: 0.25em"><a href="/data/team?team=${resJson.Schedule[i].teams[0].teamNumber}" style="border-bottom: none; color: #FF4000">${resJson.Schedule[i].teams[0].teamNumber}</a><br><a href="/data/team?team=${resJson.Schedule[i].teams[3].teamNumber}" style="border-bottom: none; color: #00BFFF">${resJson.Schedule[i].teams[3].teamNumber}</a></div><div class="VStack" style="padding: 0.25em"><a href="/data/team?team=${resJson.Schedule[i].teams[1].teamNumber}" style="border-bottom: none; color: #FF4000">${resJson.Schedule[i].teams[1].teamNumber}</a><br><a href="/data/team?team=${resJson.Schedule[i].teams[4].teamNumber}" style="border-bottom: none; color: #00BFFF">${resJson.Schedule[i].teams[4].teamNumber}</a></div><br><div class="VStack" style="padding: 0.25em"><a href="/data/team?team=${resJson.Schedule[i].teams[2].teamNumber}" style="border-bottom: none; color: #FF4000">${resJson.Schedule[i].teams[2].teamNumber}</a><br><a href="/data/team?team=${resJson.Schedule[i].teams[5].teamNumber}" style="border-bottom: none; color: #00BFFF">${resJson.Schedule[i].teams[5].teamNumber}</a></div></div></div>`;
        }
        document.getElementById("preInsertMatch").insertAdjacentHTML("afterbegin", htmltable + "<hr>");
        showPage(2);
    }).catch((error) => console.log(error));
}
function showPage(page) {
    pages[0].style.display = "none";
    pages[1].style.display = "none";
    pages[2].style.display = "none";
    pages[page].style.display = "flex";
}
function disableButton(button) {
    buttons[0].removeAttribute("disabled");
    buttons[1].removeAttribute("disabled");
    buttons[button].setAttribute("disabled", "disabled");
}
document.body.onload = getTeamsList;
buttons[0].addEventListener("click", () => getTeamsList());
buttons[1].addEventListener("click", () => getMatchesList());
