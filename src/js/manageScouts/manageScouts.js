import { _get } from "../_modules/get/get.min.js";
async function getScoutsDataMgmt() {
    _get("/api/scouts", null).then((response) => {
        var listHTML = "";
        for (var i = 0; i < response.length; i++) {
            if (response[i].accessOk == "true") {
                if (response[i].admin == "true") {
                    listHTML += `<tr class="padded"><td>${response[i].nickName} (${response[i].team})</td><td><div class="inlineInput"><input type="tel" id="${response[i].id}_input" value="${response[i].score}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateUser('${response[i].id}', ${response[i].score}, this)">save</button></div></td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="userAdminAction('${response[i].id}', 'revokeKey', this)">logout</button><button class="uiButton cancelButton" onclick="modifyAdmin('${response[i].id}', this, false)">remove admin</button></div></td></tr>`;
                }
                else if (response[i].teamAdmin !== 0) {
                    listHTML += `<tr class="padded"><td>${response[i].nickName} (${response[i].team})</td><td><div class="inlineInput"><input type="tel" id="${response[i].id}_input" value="${response[i].score}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateUser('${response[i].id}', ${response[i].score}, this)">save</button></div></td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="userAdminAction('${response[i].id}', 'revokeKey', this)">logout</button><button class="uiButton cancelButton" onclick="modifyTeamAdmin('${response[i].id}', '0', this)">remove team admin</button><button class="uiButton cancelButton" onclick="modifyAdmin('${response[i].id}', this, true)">make admin</button></div></td></tr>`;
                }
                else {
                    listHTML += `<tr class="padded"><td>${response[i].nickName} (${response[i].team})</td><td><div class="inlineInput"><input type="tel" id="${response[i].id}_input" value="${response[i].score}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateUser('${response[i].id}', ${response[i].score}, this)">save</button></div></td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="userAdminAction('${response[i].id}', 'revokeKey', this)">logout</button><button class="uiButton cancelButton" onclick="modifyTeamAdmin('${response[i].id}', '${response[i].team}', this)">make team admin</button><button class="uiButton cancelButton" onclick="modifyAdmin('${response[i].id}', this, true)">make admin</button></div></td></tr>`;
                }
            }
            else {
                listHTML += `<tr class="padded"><td>${response[i].nickName} (${response[i].team})</td><td></td><td><div class="inlineInput"><button class="uiButton returnButton" onclick="userAdminAction('${response[i].id}/true', 'access', this)">approve user</button><button class="uiButton cancelButton" onclick="userAdminAction('${response[i].id}', 'delete', this)">delete user</button></div></td></tr>`;
            }
        }
        document.getElementById("tableHeader").insertAdjacentHTML("afterend", listHTML);
    }).catch((err) => console.log(err));
}
async function updateUser(targetuserId, origScore, button) {
    button.innerText = "...";
    const modifyAmt = Number(document.getElementById(`${targetuserId}_input`).value) - Number(origScore);
    _get(`/api/manage/user/points/${targetuserId}/${modifyAmt}/6553`, button.id).then((response) => {
        if (response.status === 0xc84) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
// valid actions:
//   access
//   delete
//   revokeKey
async function userAdminAction(targetId, action, button) {
    button.innerText = "...";
    _get(`/api/manage/user/${action}/${targetId}`, button.id).then((response) => {
        if (response.status === 0xc86 || response.status === 0xc87) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
async function modifyAdmin(userId, button, admin) {
    button.innerText = "...";
    _get(`/api/manage/user/updateAdmin/${userId}/${admin}`, button.id).then((response) => {
        if (response.status === 0xc86) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
async function modifyTeamAdmin(userId, targetTeam, button) {
    button.innerText = "...";
    _get(`/api/manage/user/updateTeamAdmin/${userId}/${targetTeam}`, button.id).then((response) => {
        if (response.status === 0xc86) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
window.getScoutsDataMgmt = getScoutsDataMgmt;
window.updateUser = updateUser;
window.userAdminAction = userAdminAction;
window.modifyAdmin = modifyAdmin;
window.modifyTeamAdmin = modifyTeamAdmin;
