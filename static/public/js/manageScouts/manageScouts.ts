import { _delete } from "../_modules/delete/delete.min.js";
import { _get } from "../_modules/get/get.min.js"
import { _patch } from "../_modules/patch/patch.min.js";

type scoutsData = { id: number; username: string; team: number; admin: string; team_admin: number; score: number; };

async function getScoutsDataMgmt() {
    _get("/api/v1/manage/all_users", null).then((response: Array<scoutsData>) => {
        var listHTML = "";
        for (var i = 0; i < response.length; i++) {
            if (response[i].admin == "true") {
                listHTML += `<tr class="padded"><td>${response[i].username} (${response[i].team})</td><td><div class="inlineInput"><input type="tel" id="${response[i].id}_input" value="${response[i].score}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateUser('${response[i].id}', ${response[i].score}, this)">save</button></div></td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="modifyAdmin('${response[i].id}', this, false)">remove admin</button></div></td></tr>`;
            } else if (response[i].team_admin !== 0) {
                listHTML += `<tr class="padded"><td>${response[i].username} (${response[i].team})</td><td><div class="inlineInput"><input type="tel" id="${response[i].id}_input" value="${response[i].score}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateUser('${response[i].id}', ${response[i].score}, this)">save</button></div></td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="modifyTeamAdmin('${response[i].id}', '0', this)">remove team admin</button><button class="uiButton cancelButton" onclick="modifyAdmin('${response[i].id}', this, true)">make admin</button><button class="uiButton cancelButton" onclick="userAdminAction('${response[i].id}', 'delete', this)">delete user</button></div></td></tr>`;
            } else {
                listHTML += `<tr class="padded"><td>${response[i].username} (${response[i].team})</td><td><div class="inlineInput"><input type="tel" id="${response[i].id}_input" value="${response[i].score}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateUser('${response[i].id}', ${response[i].score}, this)">save</button></div></td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="modifyTeamAdmin('${response[i].id}', '${response[i].team}', this)">make team admin</button><button class="uiButton cancelButton" onclick="modifyAdmin('${response[i].id}', this, true)">make admin</button><button class="uiButton cancelButton" onclick="userAdminAction('${response[i].id}', 'delete', this)">delete user</button></div></td></tr>`;
            }
        }
        document.getElementById("tableHeader").insertAdjacentHTML("afterend", listHTML);
    }).catch((err: any) => console.log(err));
}

async function updateUser(targetuserId: string, origScore: string, button: any) {
    button.innerText = "..."
    _patch(`/api/v1/manage/user/update_points/${targetuserId}/${Number((document.getElementById(`${targetuserId}_input`) as HTMLInputElement).value) - Number(origScore)}`, button.id).then((response) => {
        if (response.status === 0xc86) { button.innerText = "done"; } else { button.innerText = "error"; }
    }).catch((err: any) => console.log(err));
}

async function userAdminAction(targetId: string, action: string, button: any) {
    button.innerText = "..."
    _delete(`/api/v1/manage/user/delete/${targetId}`, button.id).then((response) => {
        if (response.status === 0xc86) { button.innerText = "done"; } else { button.innerText = "error"; }
    }).catch((err: any) => console.log(err));
}

async function modifyAdmin(userId: string, button: any, admin: boolean) {
    button.innerText = "..."
    _patch(`/api/v1/manage/user/update_admin/${userId}/${admin}`, button.id).then((response) => {
        if (response.status === 0xc86) { button.innerText = "done"; } else { button.innerText = "error"; }
    }).catch((err: any) => console.log(err));
}

async function modifyTeamAdmin(userId: string, targetTeam: string, button: any) {
    button.innerText = "..."
    _patch(`/api/v1/manage/user/update_team_admin/${userId}/${targetTeam}`, button.id).then((response) => {
        if (response.status === 0xc86) { button.innerText = "done"; } else { button.innerText = "error"; }
    }).catch((err: any) => console.log(err));
}

(window as any).getScoutsDataMgmt = getScoutsDataMgmt;
(window as any).updateUser = updateUser;
(window as any).userAdminAction = userAdminAction;
(window as any).modifyAdmin = modifyAdmin;
(window as any).modifyTeamAdmin = modifyTeamAdmin;