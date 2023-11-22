import { _get } from "../_modules/get/get.min.js";
const errElement = document.getElementById("errorTxt");
function emojiValue(value) {
    if (value == "true") {
        return "✅";
    }
    else {
        return "❌";
    }
}
function toIcons(str) {
    let step1 = str.replaceAll("0", "⬜");
    let step2 = step1.replaceAll("1", "🟪");
    let step3 = step2.replaceAll("2", "🟨");
    let step4 = step3.replaceAll("3", "🟪");
    return step4.replaceAll("4", "🟨");
}
function fullGridString(str, sep) {
    let strings = str.match(/.{1,9}/g);
    var iconStrings = [];
    iconStrings.push(toIcons(strings[0]));
    iconStrings.push(toIcons(strings[1]));
    iconStrings.push(toIcons(strings[2]));
    return iconStrings.join(sep);
}
async function loadData() {
    const urlParams = new URLSearchParams(window.location.search);
    const submissionID = urlParams.get("id");
    errElement.innerText = "deleting...";
    _get(`/api/v1/data/detail/${submissionID}`, errElement.id).then((listRes) => {
        const data = listRes[0].FullMain;
        const gameData = data.game.split(",");
        var text = `<b>Author:</b> ${data.name} (from team ${data.from_team})<br><br>` +
            `<b>AUTO: <br>Taxi: </b>${emojiValue(gameData[0])}<br>` +
            `<b>Score B/M/T: </b>${emojiValue(gameData[1])}${emojiValue(gameData[2])}${emojiValue(gameData[3])}<br>` +
            `<b>Charging: </b>${gameData[4]} pts<br><br>` +
            `<b>TELEOP: <br>Score B/M/T: </b>${emojiValue(gameData[5])}${emojiValue(gameData[6])}${emojiValue(gameData[7])}<br><b>Charging: </b>${gameData[9]} pts<br><br>` +
            `<b>Other: <br>Alliance COOPERTITION: </b>${emojiValue(gameData[8])}<br><b>Cycle Time: </b>${gameData[10]} seconds<br><b>Defense: </b>${data.defend}<br><b>Driving: </b>${data.driving}<br><b>Overall: </b>${data.overall}<br>` +
            `<b>Grid:<br>${fullGridString(gameData[11].toString(), "<br>")}<br><br>` +
            `<b>low/mid/high cubes - cones: </b>${gameData[20]}/${gameData[13]}/${gameData[15]} - ${gameData[12]}/${gameData[14]}/${gameData[16]}<br>` +
            `<b>low/mid/high pcs: </b>${gameData[17]}/${gameData[18]}/${gameData[19]}<br>` +
            `<b>cubes/cones: </b>${gameData[22]}/${gameData[23]}<br>` +
            `<b>total grid: </b>${gameData[24]}pts<br>` +
            `<b>Match Performance Score: </b>${Number(data.weight.split(",")[0]).toFixed(2)}`;
        document.getElementById("resultTeamNum").innerText = data.team;
        document.getElementById("resultMatchNum").innerText = data.match_num;
        document.getElementById("resultEventCode").innerText = data.event;
        document.getElementById("resultText").innerHTML = text;
    }).catch((err) => console.log(err));
}
window.loadData = loadData;
