import { _get } from "../_modules/get/get.min.js";
async function getTeamData() {
    _get("/api/manage/teams/list", null).then((response) => {
        var listHTML = "";
        for (var i = 0; i < response.length; i++) {
            listHTML += `<tr class="padded"><td>${response[i].team}</td><td><div class="inlineInput"><input type="tel" id="${response[i].id}_key_input" value="${response[i].key}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateKey('${response[i].id}', "${response[i].id}_key_input", this)">save</button><button class="uiButton cancelButton" onclick="revokeTeamKey('${response[i].id}', this)">delete</button></div></td></tr>`;
        }
        document.getElementById("teamsTableHead").insertAdjacentHTML("afterend", listHTML);
    }).catch((err) => console.log(err));
}
window.getTeamData = getTeamData;
async function updateKey(id, eleId, button) {
    button.innerText = "...";
    _get(`/api/manage/teams/updateKey/${id}/${document.getElementById(eleId).value}`, button.id).then((response) => {
        if (response.status === 0xc87) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
window.updateKey = updateKey;
async function revokeTeamKey(id, button) {
    button.innerText = "...";
    _get(`/api/manage/teams/deleteKey/${id}`, button.id).then((response) => {
        if (response.status === 0xc87) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
window.revokeTeamKey = revokeTeamKey;
function setupTeamKeyCreate() {
    document.getElementById("mainsect").style.display = "none";
    document.getElementById("createKey").style.display = "flex";
}
window.setupTeamKeyCreate = setupTeamKeyCreate;
async function createTeamKey() {
    const button = document.getElementById("newTeamKey_btn");
    const key = Number(document.getElementById("newTeamKey_key").value);
    const team = Number(document.getElementById("newTeamKey_team").value);
    button.innerText = "...";
    _get(`/api/manage/teams/createKey/${key}/${team}`, button.id).then(async (response) => {
        if (response.status === 0xc87) {
            button.innerText = "done!";
            await new Promise((res) => setTimeout(res, 250));
            window.location.reload();
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
window.createTeamKey = createTeamKey;
