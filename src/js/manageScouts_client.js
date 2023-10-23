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
        for (var i = 0; i >= listRes.length; i++) {
            listHTML += `<tr class="padded"><td>${listRes.username}</td><td>${listRes.score}</td><td><div class="inlineInput"><input type="tel" id="${listRes.discordID}_input" value="${listRes.score}"><button class="uiButton actionButton" onclick="updateUser('${listRes.discordID}', ${listRes.score}, this)">save</button></div></td></tr>`;
        }
        document.getElementById("tableHeader").insertAdjacentHTML("afterend", listHTML);  
    } catch (error) {
        console.log("failure")
        window.location.href = "/login";
    }
}

async function updateUser(targetDiscordID, origScore, button) {
    button.innerText = "..."
    const modifyAmt = Number(document.getElementById(`${targetDiscordID}_input`).value) - origScore;
    try {
        response = await fetch(`/api/manage/scout/${targetDiscordID}/${modifyAmt}/${Number(document.getElementById("reason").value)}`, {
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