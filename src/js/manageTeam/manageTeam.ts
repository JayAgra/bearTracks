import { _get } from "../_modules/get/get.min.js"

type scoutData = {
    "id": number;
    "score": number;
    "nickName": string;
    "accessOk": string;
};

async function getData() {
    _get("/api/manage/myTeam/list", null).then((response: Array<scoutData>) => {
        var listHTML = "";
        for (var i = 0; i < response.length; i++) {
            if (response[i].accessOk == "true") {
                listHTML += `<tr class="padded"><td>${response[i].nickName}</td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="disown('${response[i].id}', this)">disown user</button></div></td></tr>`;
            } else {
                listHTML += `<tr class="padded"><td>${response[i].nickName}</td><td><div class="inlineInput"><button class="uiButton returnButton" onclick="approveTeamUser('${response[i].id}', this)">re-approve user</button></div></td></tr>`;
            }
        }
        document.getElementById("tableHeader").insertAdjacentHTML("afterend", listHTML);  
    }).catch((err: any) => console.log(err));
}
(window as any).getData = getData;

async function approveTeamUser(targetId: string, button: any) {
    button.innerText = "..."
    _get(`/api/manage/myTeam/scouts/access/${targetId}/true`, button.id).then((response) => {
        if (response.status === 0xc86) {
            button.innerText = "approved user";
        } else {
            button.innerText = "error";
        }
    }).catch((err: any) => console.log(err));
}
(window as any).approveTeamUser = approveTeamUser;

async function disown(targetId: string, button: any) {
    button.innerText = "..."
    _get(`/api/manage/myTeam/scouts/access/${targetId}/false`, button.id).then((response) => {
        if (response.status === 0xc86) {
            button.innerText = "disowned";
        } else {
            button.innerText = "error";
        }
    }).catch((err: any) => console.log(err));
}
(window as any).disown = disown;