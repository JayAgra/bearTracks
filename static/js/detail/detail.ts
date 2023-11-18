import { _get } from "../_modules/get/get.min.js"

const errElement: HTMLElement = document.getElementById("errorTxt") as HTMLElement;

function emojiValue(value: string): string {
    if (value == "true") {
        return "✅";
    } else {
        return "❌";
    }
}

function toIcons(str: string): string {
    let step1 = str.replaceAll("0", "⬜");
    let step2 = step1.replaceAll("1", "🟪");
    let step3 = step2.replaceAll("2", "🟨");
    let step4 = step3.replaceAll("3", "❷");
    return step4.replaceAll("4", "❷");
}

function fullGridString(str: string, sep: string): string {
    let strings = str.match(/.{1,9}/g);
    var iconStrings = [];
    iconStrings.push(toIcons(strings[0]));
    iconStrings.push(toIcons(strings[1]));
    iconStrings.push(toIcons(strings[2]));
    return iconStrings.join(sep);
}

async function loadData() {
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const submissionID: string = urlParams.get("id") as string;
    errElement.innerText = "deleting...";
    _get(`/api/data/detail/id/${submissionID}`, errElement.id).then((listRes) => {
        var text = `<b>Author:</b> ${listRes.name} (from team ${listRes.fromTeam})<br><br>` +
                `<b>AUTO: <br>Taxi: </b>${emojiValue(listRes.game1)}<br>` +
                `<b>Score B/M/T: </b>${emojiValue(listRes.game2)}${emojiValue(listRes.game3)}${emojiValue(listRes.game4)}<br>` +
                `<b>Charging: </b>${listRes.game5} pts<br><br>` +
                `<b>TELEOP: <br>Score B/M/T: </b>${emojiValue(listRes.game6)}${emojiValue(listRes.game7)}${emojiValue(listRes.game8)}<br><b>Charging: </b>${listRes.game10} pts<br><br>` +
                `<b>Other: <br>Alliance COOPERTITION: </b>${emojiValue(listRes.game9)}<br><b>Cycle Time: </b>${listRes.game11} seconds<br><b>Defense: </b>${listRes.defend}<br><b>Driving: </b>${listRes.driving}<br><b>Overall: </b>${listRes.overall}<br>` +
                `<b>Grid:<br>${fullGridString((listRes.game12).toString(), "<br>")}<br><br>` +
                `<b>low/mid/high cubes - cones: </b>${listRes.game21}/${listRes.game14}/${listRes.game16} - ${listRes.game13}/${listRes.game15}/${listRes.game17}<br>` +
                `<b>low/mid/high pcs: </b>${listRes.game18}/${listRes.game19}/${listRes.game20}<br>` +
                `<b>cubes/cones: </b>${listRes.game23}/${listRes.game24}<br>` +
                `<b>total grid: </b>${listRes.game25}pts<br>` +
                `<b>Match Performance Score: </b>${Number(listRes.weight.split(",")[0]).toFixed(2)}`;
        (document.getElementById("resultTeamNum") as HTMLElement).innerText = listRes.team;
        (document.getElementById("resultMatchNum") as HTMLElement).innerText = listRes.match;
        (document.getElementById("resultEventCode") as HTMLElement).innerText = listRes.event;
        (document.getElementById("resultText") as HTMLElement).innerHTML = text;
    }).catch((err) => console.log(err));
}

(window as any).loadData = loadData;