function goToHome() {
    window.location.href = "/";
}
async function getTeamRanks() {
    document.getElementById("viewScoutsButton").innerHTML = "Requesting Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/scouts`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            document.getElementById("viewScoutsButton").innerHTML = "Rendering View...";
            const resJson = JSON.parse(xhr.responseText);
            var htmltable = "";
            for (var i = 0; i < resJson.length; i++) {
                if (resJson[i].accessOk == "true") {
                    htmltable += `<tr><td><a href="/browse?userId=${resJson[i].id}" style="all: unset; color: #2997FF; text-decoration: none;">${resJson[i].nickName}</a></td><td>${Math.round(resJson[i].score)}</td></tr>`;
                }
            }
            document.getElementById("preInsert").insertAdjacentHTML("afterend", htmltable)
            document.getElementById("eventCodeDisplay").innerHTML = `Top scouts`;
            document.getElementById("viewScoutsButton").innerHTML = "Reload Data";
        } else if (xhr.status === 204 && xhr.responseText == 0xcc1) {
            document.getElementById("viewScoutsButton").innerHTML = "no results";
        } else if (xhr.status === 401 || xhr.status === 403) {
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            document.getElementById("viewScoutsButton").innerHTML = "bad request";
        } else if (xhr.status === 500) {
            document.getElementById("viewScoutsButton").innerHTML = "internal server error";
        } else {
            document.getElementById("viewScoutsButton").innerHTML = "downloading data...";
        }
    }

    xhr.send()
}