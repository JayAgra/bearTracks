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
            if (xhr.responseText === "") {
                document.getElementById("searchBtn").innerHTML = "No results!";
            } else {
                console.log("200 ok");
                console.log(xhr.responseText);
                const dbQueryResult = JSON.parse(xhr.responseText);
                console.log(dbQueryResult);
                document.getElementById("searchBtn").innerHTML = "Rendering...";
                document.getElementById("resultsTeamNumber").innerText = dbQueryResult.team;
                document.getElementById("resultsEventCode").innerText = dbQueryResult.event;
                document.getElementById("resultsbody").innerHTML = `<p>Scout: ${dbQueryResult.discordName}#${dbQueryResult.discordTag}</p><p>Drive Type: ${dbQueryResult.drivetype}</p><p>Pit Scouting Assesment: ${dbQueryResult.overall}</p><br><img src="images/${dbQueryResult.image1}" alt="robot image from pit scouting (1)"/><br><img src="images/${dbQueryResult.image2}" alt="robot image from pit scouting (2)"/><br><img src="images/${dbQueryResult.image3}" alt="robot image from pit scouting (3)"/><br><img src="images/${dbQueryResult.image4}" alt="robot image from pit scouting (4)"/><br><img src="images/${dbQueryResult.image5}" alt="robot image from pit scouting (5)"/>`;;
                document.getElementById("searchsect").style.display = "none";
                document.getElementById("resultsect").style.display = "block";
            }
        } else if (xhr.status === 401) {
            console.log("401 failure")
            document.getElementById("searchBtn").innerHTML = "401 Unauthorized";
            await waitMs(1000);
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            console.log("400 failure")
            document.getElementById("searchBtn").innerHTML = "400 Bad Request";
        } else if (xhr.status === 500) {
            console.log("500 failure")
            document.getElementById("searchBtn").innerHTML = "500 Internal Server Error";
        } else if (xhr.status === 404) {
            console.log("404 not found")
            document.getElementById("searchBtn").innerHTML = "404 Not Found";
        } else {
            console.log("awaiting response")
            document.getElementById("searchBtn").innerHTML = "Downloading Data...";
        }
    }

    xhr.send()
}