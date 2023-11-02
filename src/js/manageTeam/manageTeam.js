async function getData() {
    var response, listRes;
    try {
        response = await fetch(`/api/manage/myTeam/list`, {
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
                listHTML += `<tr class="padded"><td>${listRes[i].nickName}</td><td><div class="inlineInput"><button class="uiButton cancelButton" onclick="disown('${listRes[i].id}', this)">disown user</button></div></td></tr>`;
            }
            else {
                listHTML += `<tr class="padded"><td>${listRes[i].nickName}</td><td><div class="inlineInput"><button class="uiButton returnButton" onclick="approveTeamUser('${listRes[i].id}', this)">approve user</button></div></td></tr>`;
            }
        }
        document.getElementById("tableHeader").insertAdjacentHTML("afterend", listHTML);
    }
    catch (error) {
        console.log("failure");
        window.location.href = "/login";
    }
}
async function approveTeamUser(targetId, button) {
    button.innerText = "...";
    try {
        var response = await fetch(`/api/manage/myTeam/scouts/access/${targetId}/true`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
        const responseText = await response.text();
        if (responseText == String(0xc86)) {
            button.innerText = "approved user";
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
async function disown(targetId, button) {
    button.innerText = "...";
    try {
        var response = await fetch(`/api/manage/myTeam/scouts/access/${targetId}/false`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
        const responseText = await response.text();
        if (responseText == String(0xc86)) {
            button.innerText = "disowned";
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
