import { _get } from "../_modules/get/get.min.js";
import { _patch } from "../_modules/patch/patch.min.js";
async function getData() {
    _get("/api/manage/myTeam/list", null).then((response) => {
        var listHTML = "";
        for (var i = 0; i < response.length; i++) {
            listHTML += `<tr class="padded"><td>${response[i].username}</td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="disown('${response[i].id}', this)">disown user</button></div></td></tr>`;
        }
        document.getElementById("tableHeader").insertAdjacentHTML("afterend", listHTML);
    }).catch((err) => console.log(err));
}
window.getData = getData;
async function disown(targetId, button) {
    button.innerText = "...";
    _patch(`/api/manage/myTeam/scouts/access/${targetId}/false`, button.id).then((response) => {
        if (response.status === 0xc86) {
            button.innerText = "approved user";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
window.disown = disown;
