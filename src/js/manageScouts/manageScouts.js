async function getData() {
    var response, listRes;
    try {
        response = await fetch(`/api/scouts`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
        listRes = await response.json();
        var listHTML = "";
        for (var i = 0; i < listRes.length; i++) {
            if (listRes[i].accessOk == "true") {
                if (listRes[i].admin == "true") {
                    listHTML += `<tr class="padded"><td>${listRes[i].nickName} (${listRes[i].team})</td><td><div class="inlineInput"><input type="tel" id="${listRes[i].id}_input" value="${listRes[i].score}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateUser('${listRes[i].id}', ${listRes[i].score}, this)">save</button></div></td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="revokeKey('${listRes[i].id}', this)">logout</button><button class="uiButton cancelButton" onclick="removeAdmin('${listRes[i].id}', this)">remove admin</button></div></td></tr>`;
                }
                else if (listRes[i].teamAdmin !== 0) {
                    listHTML += `<tr class="padded"><td>${listRes[i].nickName} (${listRes[i].team})</td><td><div class="inlineInput"><input type="tel" id="${listRes[i].id}_input" value="${listRes[i].score}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateUser('${listRes[i].id}', ${listRes[i].score}, this)">save</button></div></td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="revokeKey('${listRes[i].id}', this)">logout</button><button class="uiButton cancelButton" onclick="removeTeamAdmin('${listRes[i].id}', this)">remove team admin</button><button class="uiButton cancelButton" onclick="makeAdmin('${listRes[i].id}', this)">make admin</button></div></td></tr>`;
                }
                else {
                    listHTML += `<tr class="padded"><td>${listRes[i].nickName} (${listRes[i].team})</td><td><div class="inlineInput"><input type="tel" id="${listRes[i].id}_input" value="${listRes[i].score}" style="min-width: 150px"><button class="uiButton actionButton" onclick="updateUser('${listRes[i].id}', ${listRes[i].score}, this)">save</button></div></td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="revokeKey('${listRes[i].id}', this)">logout</button><button class="uiButton cancelButton" onclick="makeTeamAdmin('${listRes[i].id}', '${listRes[i].team}', this)">make team admin</button><button class="uiButton cancelButton" onclick="makeAdmin('${listRes[i].id}', this)">make admin</button></div></td></tr>`;
                }
            }
            else {
                listHTML += `<tr class="padded"><td>${listRes[i].nickName} (${listRes[i].team})</td><td></td><td><div class="inlineInput"><button class="uiButton returnButton" onclick="approveUser('${listRes[i].id}', this)">approve user</button><button class="uiButton cancelButton" onclick="deleteUser('${listRes[i].id}', this)">delete user</button></div></td></tr>`;
            }
        }
        document.getElementById("tableHeader").insertAdjacentHTML("afterend", listHTML);
    }
    catch (error) {
        console.log("failure");
        window.location.href = "/login";
    }
}
async function updateUser(targetuserId, origScore, button) {
    button.innerText = "...";
    const modifyAmt = Number(document.getElementById(`${targetuserId}_input`).value) - Number(origScore);
    try {
        var response = await fetch(`/api/manage/user/points/${targetuserId}/${modifyAmt}/6553`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
        const responseText = await response.text();
        if (responseText == String(0xc84)) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }
    catch (error) {
        console.log("failure");
        window.location.href = "/login";
    }
}
async function approveUser(targetId, button) {
    button.innerText = "...";
    try {
        var response = await fetch(`/api/manage/user/access/${targetId}/true`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
        const responseText = await response.text();
        if (responseText == String(0xc86)) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }
    catch (error) {
        console.log("failure");
        window.location.href = "/login";
    }
}
async function deleteUser(targetId, button) {
    button.innerText = "...";
    try {
        var response = await fetch(`/api/manage/user/delete/${targetId}`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
        const responseText = await response.text();
        if (responseText == String(0xc86)) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }
    catch (error) {
        console.log("failure");
        window.location.href = "/login";
    }
}
async function revokeKey(targetId, button) {
    button.innerText = "...";
    try {
        var response = await fetch(`/api/manage/user/revokeKey/${targetId}`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
        const responseText = await response.text();
        if (responseText == String(0xc87)) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }
    catch (error) {
        console.log("failure");
        window.location.href = "/login";
    }
}
async function makeAdmin(userId, button) {
    button.innerText = "...";
    try {
        var response = await fetch(`/api/manage/user/updateAdmin/${userId}/true`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
        const responseText = await response.text();
        if (responseText == String(0xc87)) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }
    catch (error) {
        console.log("failure");
        window.location.href = "/login";
    }
}
async function removeAdmin(userId, button) {
    button.innerText = "...";
    try {
        var response = await fetch(`/api/manage/user/updateAdmin/${userId}/false`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
        const responseText = await response.text();
        if (responseText == String(0xc87)) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }
    catch (error) {
        console.log("failure");
        window.location.href = "/login";
    }
}
async function makeTeamAdmin(userId, targetTeam, button) {
    button.innerText = "...";
    try {
        var response = await fetch(`/api/manage/user/updateTeamAdmin/${userId}/${targetTeam}`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
        const responseText = await response.text();
        if (responseText == String(0xc87)) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }
    catch (error) {
        console.log("failure");
        window.location.href = "/login";
    }
}
async function removeTeamAdmin(userId, button) {
    button.innerText = "...";
    try {
        var response = await fetch(`/api/manage/user/updateTeamAdmin/${userId}/0`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
        const responseText = await response.text();
        if (responseText == String(0xc87)) {
            button.innerText = "done";
        }
        else {
            button.innerText = "error";
        }
    }
    catch (error) {
        console.log("failure");
        window.location.href = "/login";
    }
}
