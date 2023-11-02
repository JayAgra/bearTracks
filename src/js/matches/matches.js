async function getMatches() {
    var allOrTeam = "";
    if (document.getElementById('allmatch').checked) {
        allOrTeam = "all";
    }
    else {
        allOrTeam = "team";
    }
    var eventCode = document.getElementById("eventCode").value;
    document.getElementById("viewMatchButton").innerHTML = "Requesting Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/matches/2023/${eventCode}/qual/${allOrTeam}`, true);
    xhr.withCredentials = true;
    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("200 ok");
            console.log(xhr.responseText);
            var matchesJSON = JSON.parse(xhr.responseText);
            document.getElementById("viewMatchButton").innerHTML = "Rendering View...";
            var matchesHtml = "";
            for (let i = 0; i < matchesJSON.Schedule.length; i++) {
                matchesHtml = matchesHtml + `<fieldset><label>${matchesJSON.Schedule[i].description}<br>${(matchesJSON.Schedule[i].startTime).replace("T", " ")}</label><br><span style="color: #FF4000;"><a href="browse?number=${matchesJSON.Schedule[i].teams[0].teamNumber}&type=team&event=${eventCode}">${matchesJSON.Schedule[i].teams[0].teamNumber}</a>&emsp;<a href="browse?number=${matchesJSON.Schedule[i].teams[1].teamNumber}&type=team&event=${eventCode}">${matchesJSON.Schedule[i].teams[1].teamNumber}</a>&emsp;<a href="browse?number=${matchesJSON.Schedule[i].teams[2].teamNumber}&type=team&event=${eventCode}">${matchesJSON.Schedule[i].teams[2].teamNumber}</a></span><br><span style="color: #00BFFF;"><a href="browse?number=${matchesJSON.Schedule[i].teams[3].teamNumber}&type=team&event=${eventCode}">${matchesJSON.Schedule[i].teams[3].teamNumber}</a>&emsp;<a href="browse?number=${matchesJSON.Schedule[i].teams[4].teamNumber}&type=team&event=${eventCode}">${matchesJSON.Schedule[i].teams[4].teamNumber}</a>&emsp;<a href="browse?number=${matchesJSON.Schedule[i].teams[5].teamNumber}&type=team&event=${eventCode}">${matchesJSON.Schedule[i].teams[5].teamNumber}</a></span></fieldset>`;
            }
            document.getElementById("matchHeader").insertAdjacentHTML("afterend", matchesHtml);
            document.getElementById("search").style.display = "none";
            document.getElementById("results").style.display = "flex";
            document.getElementById("viewMatchButton").innerHTML = "View";
        }
        else if (xhr.status === 401 || xhr.status === 403) {
            window.location.href = "/login";
        }
        else if (xhr.status === 400) {
            document.getElementById("viewMatchButton").innerHTML = "bad request";
        }
        else if (xhr.status === 500) {
            document.getElementById("viewMatchButton").innerHTML = "internal server error";
        }
        else {
            document.getElementById("viewMatchButton").innerHTML = "downloading data...";
        }
    };
    xhr.send();
}
