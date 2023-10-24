function goToHome() {
    window.location.href = "/";
}

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
                listHTML += `<tr class="padded"><td>${listRes[i].nickName}</td><td>${listRes[i].score}</td><td><div class="inlineInput"><input type="tel" id="${listRes[i].id}_input" value="${listRes[i].score}"><button class="uiButton actionButton" onclick="updateUser('${listRes[i].id}', ${listRes[i].score}, this)">save</button><button class="uiButton cancelButton" onclick="revokeKey('${listRes[i].id}', this)">logout</button></div></td></tr>`;
            } else {
                listHTML += `<tr class="padded"><td>${listRes[i].nickName}</td><td>${listRes[i].score}</td><td><div class="inlineInput"><button class="uiButton returnButton" onclick="approveUser('${listRes[i].id}', this)">approve user</button></div></td></tr>`;
            }
        }
        document.getElementById("tableHeader").insertAdjacentHTML("afterend", listHTML);  
    } catch (error) {
        console.log("failure")
        window.location.href = "/login";
    }
}

async function updateUser(targetuserId, origScore, button) {
    button.innerText = "..."
    const modifyAmt = Number(document.getElementById(`${targetuserId}_input`).value) - origScore;
    try {
        response = await fetch(`/api/manage/scout/points/${targetuserId}/${modifyAmt}/${Number(document.getElementById("reason").value)}`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }

        const responseText = await response.text();
        
        if (responseText == 0xc84) {
            button.innerText = "done";
        } else {
            button.innerText = "error";
        }
    } catch (error) {
        console.log("failure")
        window.location.href = "/login";
    }
}

async function approveUser(targetId, button) {
    button.innerText = "..."
    try {
        response = await fetch(`/api/manage/scout/access/${targetId}/false`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }

        const responseText = await response.text();
        
        if (responseText == 0xc86) {
            button.innerText = "done";
        } else {
            button.innerText = "error";
        }
    } catch (error) {
        console.log("failure")
        window.location.href = "/login";
    }
}

async function revokeKey(targetId, button) {
    button.innerText = "..."
    try {
        response = await fetch(`/api/manage/scout/revokeKey/${targetId}`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }

        const responseText = await response.text();
        
        if (responseText == 0xc87) {
            button.innerText = "done";
        } else {
            button.innerText = "error";
        }
    } catch (error) {
        console.log("failure")
        window.location.href = "/login";
    }
}