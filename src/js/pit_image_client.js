const waitMs = ms => new Promise(res => setTimeout(res, ms));
function removeURLParams() {
    window.location.href = "/pitimages"
}
function goToHome() {
    window.location.href = "/";
}
function searchImg() {
    document.getElementById("searchBtn").innerHTML = "Requesting Data...";
    let teamnum = document.getElementById("teamInput").value
    let eventcode = document.getElementById("eventInput").value

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/pit/2023/${eventcode}/${teamnum}`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            const dbQueryResult = JSON.parse(xhr.responseText);
            document.getElementById("searchBtn").innerHTML = "Rendering...";
            document.getElementById("resultsTeamNumber").innerText = dbQueryResult.team;
            document.getElementById("resultsEventCode").innerText = dbQueryResult.event;
            document.getElementById("resultsbody").innerHTML = `<p>Scout: ${dbQueryResult.discordName}#${dbQueryResult.discordTag}</p><p>Drive Type: ${dbQueryResult.drivetype}</p><p>Pit Scouting Assesment: ${dbQueryResult.overall}</p><br><img src="images/${dbQueryResult.image1}" alt="robot image from pit scouting (1)"/><br><img src="images/${dbQueryResult.image2}" alt="robot image from pit scouting (2)"/><br><img src="images/${dbQueryResult.image3}" alt="robot image from pit scouting (3)"/><br><img src="images/${dbQueryResult.image4}" alt="robot image from pit scouting (4)"/><br><img src="images/${dbQueryResult.image5}" alt="robot image from pit scouting (5)"/>`;;
            document.getElementById("searchsect").style.display = "none";
            document.getElementById("resultsect").style.display = "block";
        } else if (xhr.status === 204) {
            console.log(xhr.responseText);
            document.getElementById("searchBtn").innerHTML = "No results!";
        } else if (xhr.status === 401 || xhr.status === 403) {
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            document.getElementById("searchBtn").innerHTML = "bad request";
        } else if (xhr.status === 500) {
            document.getElementById("searchBtn").innerHTML = "internal server error";
        } else {
            document.getElementById("searchBtn").innerHTML = "Downloading Data...";
        }
    }

    xhr.send()
}