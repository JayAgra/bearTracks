import { _get } from "../_modules/get/get.min.js";

async function getMatches() {
    var allOrTeam = (document.getElementById('allmatch') as HTMLInputElement).checked ? "all" : "team";
    var eventCode: string = (document.getElementById("eventCode") as HTMLInputElement).value
    _get(`/api/matches/2023/${eventCode}/qual/${allOrTeam}`, "viewMatchButton").then((matchesJSON) => {
            var matchesHtml = "";
            for (let i = 0; i < matchesJSON.Schedule.length; i++) {
                matchesHtml = matchesHtml + `<fieldset><label>${matchesJSON.Schedule[i].description}<br>${(matchesJSON.Schedule[i].startTime).replace("T", " ")}</label><br><span style="color: #FF4000;"><a href="browse?number=${matchesJSON.Schedule[i].teams[0].teamNumber}&type=team&event=${eventCode}">${matchesJSON.Schedule[i].teams[0].teamNumber}</a>&emsp;<a href="browse?number=${matchesJSON.Schedule[i].teams[1].teamNumber}&type=team&event=${eventCode}">${matchesJSON.Schedule[i].teams[1].teamNumber}</a>&emsp;<a href="browse?number=${matchesJSON.Schedule[i].teams[2].teamNumber}&type=team&event=${eventCode}">${matchesJSON.Schedule[i].teams[2].teamNumber}</a></span><br><span style="color: #00BFFF;"><a href="browse?number=${matchesJSON.Schedule[i].teams[3].teamNumber}&type=team&event=${eventCode}">${matchesJSON.Schedule[i].teams[3].teamNumber}</a>&emsp;<a href="browse?number=${matchesJSON.Schedule[i].teams[4].teamNumber}&type=team&event=${eventCode}">${matchesJSON.Schedule[i].teams[4].teamNumber}</a>&emsp;<a href="browse?number=${matchesJSON.Schedule[i].teams[5].teamNumber}&type=team&event=${eventCode}">${matchesJSON.Schedule[i].teams[5].teamNumber}</a></span></fieldset>`;
            }
            document.getElementById("matchHeader").insertAdjacentHTML("afterend", matchesHtml)
            document.getElementById("search").style.display = "none";
            document.getElementById("results").style.display = "flex";
            document.getElementById("viewMatchButton").innerHTML = "View";
    }).catch((err: any) => console.log(err));
}
(window as any).getMatches = getMatches;