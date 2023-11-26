import { _delete } from "../_modules/delete/delete.min.js";
import { _get } from "../_modules/get/get.min.js";
import { _patch } from "../_modules/patch/patch.min.js";
import { _post } from "../_modules/post/post.min.js";

type teamsData = { "id": number; "team": number; "key": string; };

async function getTeamData() {
    _get("/api/v1/manage/all_access_keys", null).then((response: Array<teamsData>) => {
        var listHTML = "";
        for (var i = 0; i < response.length; i++) {
            listHTML += `<tr class="padded"><td>${response[i].team}</td><td><div class="inlineInput"><input type="tel" id="${response[i].id}_key_input" value="${response[i].key}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateKey('${response[i].id}', '${response[i].id}_key_input', this)">save</button><button class="uiButton cancelButton" onclick="revokeTeamKey('${response[i].id}', this)">delete</button></div></td></tr>`;
        }
        document.getElementById("teamsTableHead").insertAdjacentHTML("afterend", listHTML); 
    }).catch((err: any) => console.log(err));
}
(window as any).getTeamData = getTeamData;

async function updateKey(id: string, eleId: string, button: any) {
    button.innerText = "..."
    _patch(`/api/v1/manage/access_key/update/${id}/${(document.getElementById(eleId) as HTMLInputElement).value}`, button.id).then((response) => {
        if (response.status === 0xc87) { button.innerText = "done"; } else { button.innerText = "error"; }
    }).catch((err: any) => console.log(err));
}
(window as any).updateKey = updateKey;

async function revokeTeamKey(id: string, button: any) {
    button.innerText = "..."
    _delete(`/api/v1/manage/access_key/delete/${id}`, button.id).then((response) => {
        if (response.status === 0xc87) { button.innerText = "done"; } else { button.innerText = "error"; }
    }).catch((err: any) => console.log(err));
}
(window as any).revokeTeamKey = revokeTeamKey;

function setupTeamKeyCreate() {
    (document.getElementById("mainsect") as HTMLDivElement).style.display = "none";
    (document.getElementById("createKey") as HTMLDivElement).style.display = "unset";
}
(window as any).setupTeamKeyCreate = setupTeamKeyCreate;

async function createTeamKey() {
    const button = (document.getElementById("newTeamKey_btn") as HTMLButtonElement);
    const key = Number((document.getElementById("newTeamKey_key") as HTMLInputElement).value);
    const team = Number((document.getElementById("newTeamKey_team") as HTMLInputElement).value);
    button.innerText = "..."
    _post(`/api/v1/manage/access_key/create/${key}/${team}`, button.id, {}).then(async (response: { "status": number }) => {
        if (response.status === 0xc87) {
            button.innerText = "done!";
            await new Promise((res) => setTimeout(res, 250));
            window.location.reload();
        } else {
            button.innerText = "error";
        }
    }).catch((err: any) => console.log(err));
}
(window as any).createTeamKey = createTeamKey;