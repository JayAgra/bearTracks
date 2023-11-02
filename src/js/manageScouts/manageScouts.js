import { _get } from "../_modules/get/get.min.js";
async function getScoutsDataMgmt() {
    _get("/api/scouts", null).then((response) => {
        var listHTML = "";
        for (var i = 0; i < response.length; i++) {
            if (response[i].accessOk == "true") {
                if (response[i].admin == "true") {
                    listHTML += `<tr class="padded"><td>${response[i].nickName} (${response[i].team})</td><td><div class="inlineInput"><input type="tel" id="${response[i].id}_input" value="${response[i].score}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateUser('${response[i].id}', ${response[i].score}, this)">save</button></div></td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="revokeKey('${response[i].id}', this)">logout</button><button class="uiButton cancelButton" onclick="removeAdmin('${response[i].id}', this)">remove admin</button></div></td></tr>`;
                }
                else if (response[i].teamAdmin !== 0) {
                    listHTML += `<tr class="padded"><td>${response[i].nickName} (${response[i].team})</td><td><div class="inlineInput"><input type="tel" id="${response[i].id}_input" value="${response[i].score}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateUser('${response[i].id}', ${response[i].score}, this)">save</button></div></td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="revokeKey('${response[i].id}', this)">logout</button><button class="uiButton cancelButton" onclick="removeTeamAdmin('${response[i].id}', this)">remove team admin</button><button class="uiButton cancelButton" onclick="makeAdmin('${response[i].id}', this)">make admin</button></div></td></tr>`;
                }
                else {
                    listHTML += `<tr class="padded"><td>${response[i].nickName} (${response[i].team})</td><td><div class="inlineInput"><input type="tel" id="${response[i].id}_input" value="${response[i].score}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateUser('${response[i].id}', ${response[i].score}, this)">save</button></div></td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="revokeKey('${response[i].id}', this)">logout</button><button class="uiButton cancelButton" onclick="makeTeamAdmin('${response[i].id}', '${response[i].team}', this)">make team admin</button><button class="uiButton cancelButton" onclick="makeAdmin('${response[i].id}', this)">make admin</button></div></td></tr>`;
                }
            }
            else {
                listHTML += `<tr class="padded"><td>${response[i].nickName} (${response[i].team})</td><td></td><td><div class="inlineInput"><button class="uiButton returnButton" onclick="approveUser('${response[i].id}', this)">approve user</button><button class="uiButton cancelButton" onclick="deleteUser('${response[i].id}', this)">delete user</button></div></td></tr>`;
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
async function approveUser(targetId, button) {
    button.innerText = "...";
    _get(`/api/manage/user/access/${targetId}/true`, button.id).then((response) => {
        if (response.status === 0xc86) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
async function deleteUser(targetId, button) {
    button.innerText = "...";
    _get(`/api/manage/user/delete/${targetId}`, button.id).then((response) => {
        if (response.status === 0xc86) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
async function revokeKey(targetId, button) {
    button.innerText = "...";
    _get(`/api/manage/user/revokeKey/${targetId}`, button.id).then((response) => {
        if (response.status === 0xc87) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
async function makeAdmin(userId, button) {
    button.innerText = "...";
    _get(`/api/manage/user/updateAdmin/${userId}/true`, button.id).then((response) => {
        if (response.status === 0xc87) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
async function removeAdmin(userId, button) {
    button.innerText = "...";
    _get(`/api/manage/user/updateAdmin/${userId}/false`, button.id).then((response) => {
        if (response.status === 0xc87) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
async function makeTeamAdmin(userId, targetTeam, button) {
    button.innerText = "...";
    _get(`/api/manage/user/updateTeamAdmin/${userId}/${targetTeam}`, button.id).then((response) => {
        if (response.status === 0xc87) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
async function removeTeamAdmin(userId, button) {
    button.innerText = "...";
    _get(`/api/manage/user/updateTeamAdmin/${userId}/0`, button.id).then((response) => {
        if (response.status === 0xc87) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }).catch((err) => console.log(err));
}
window.getScoutsDataMgmt = getScoutsDataMgmt;
window.updateUser = updateUser;
window.approveUser = approveUser;
window.deleteUser = deleteUser;
window.revokeKey = revokeKey;
window.makeAdmin = makeAdmin;
window.removeAdmin = removeAdmin;
window.makeTeamAdmin = makeTeamAdmin;
window.removeTeamAdmin = removeTeamAdmin;
