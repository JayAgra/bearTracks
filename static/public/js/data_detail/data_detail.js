import { _get } from "../_modules/get/get.min.js";
const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const idNumber = params.get('id');
let pages = Array.from(document.getElementsByClassName("form_pages"));
async function getTeamsList() {
    pages[0].style.display = "flex";
    pages[1].style.display = "none";
    _get(`/api/v1/data/detail/${idNumber}`).then((resJson) => {
        const gameData = JSON.parse(resJson[0].FullMain.game);
        var htmlContent = `<hr><div class="VStack" style="width: 95vw"><label><b>Author</b></label><br><label>${resJson[0].FullMain.name} (${resJson[0].FullMain.from_team})</label><br><br>`;
        htmlContent += `<h3>Total</h3><hr><br><div class="HStack"><div class="VStack"><h2>${resJson[0].FullMain.analysis.split(",")[7]}</h2><br><p>algae</p></div><div class="VStack"><h2>${parseInt(resJson[0].FullMain.analysis.split(",")[8]) + parseInt(resJson[0].FullMain.analysis.split(",")[9]) + parseInt(resJson[0].FullMain.analysis.split(",")[10]) + parseInt(resJson[0].FullMain.analysis.split(",")[11])}</h2><br><p>coral</p></div></div><br><br>`;
        htmlContent += "<h3>Cycles</h3><hr><br>";
        gameData.forEach(entry => {
            switch (entry.score_type) {
                case 4:
                    htmlContent += `<div class="HStack"><h3>Algae</h3><br><p>IN ${Math.round(10 * entry.intake) / 10} / MOVE ${Math.round(10 * entry.travel) / 10} / OUT ${Math.round(10 * entry.outtake) / 10}</p><br><h3>${Math.round(100 * (entry.intake + entry.travel + entry.outtake)) / 100}</h3></div>`;
                    break;
                case 5:
                    htmlContent += `<div class="HStack"><h3>Level 1</h3><br><p>IN ${Math.round(10 * entry.intake) / 10} / MOVE ${Math.round(10 * entry.travel) / 10} / OUT ${Math.round(10 * entry.outtake) / 10}</p><br><h3>${Math.round(100 * (entry.intake + entry.travel + entry.outtake)) / 100}</h3></div>`;
                    break;
                case 6:
                    htmlContent += `<div class="HStack"><h3>Level 2</h3><br><p>IN ${Math.round(10 * entry.intake) / 10} / MOVE ${Math.round(10 * entry.travel) / 10} / OUT ${Math.round(10 * entry.outtake) / 10}</p><br><h3>${Math.round(100 * (entry.intake + entry.travel + entry.outtake)) / 100}</h3></div>`;
                    break;
                case 7:
                    htmlContent += `<div class="HStack"><h3>Level 3</h3><br><p>IN ${Math.round(10 * entry.intake) / 10} / MOVE ${Math.round(10 * entry.travel) / 10} / OUT ${Math.round(10 * entry.outtake) / 10}</p><br><h3>${Math.round(100 * (entry.intake + entry.travel + entry.outtake)) / 100}</h3></div>`;
                    break;
                case 8:
                    htmlContent += `<div class="HStack"><h3>Level 4</h3><br><p>IN ${Math.round(10 * entry.intake) / 10} / MOVE ${Math.round(10 * entry.travel) / 10} / OUT ${Math.round(10 * entry.outtake) / 10}</p><br><h3>${Math.round(100 * (entry.intake + entry.travel + entry.outtake)) / 100}</h3></div>`;
                    break;
                case 9:
                    htmlContent += `<div class="HStack"><h3>Endgame Park</h3><br><h3>${entry.intake == 1.0 ? "✅" : "❌"}</h3></div>`;
                    break;
                case 10:
                    htmlContent += `<div class="HStack"><h3>Shallow Cage</h3><br><h3>${entry.intake == 1.0 ? "✅" : "❌"}</h3></div>`;
                    break;
                case 11:
                    htmlContent += `<div class="HStack"><h3>Deep Cage</h3><br><h3>${entry.intake == 1.0 ? "✅" : "❌"}</h3></div>`;
                    break;
                case 13:
                    htmlContent += `<div class="HStack"><h3>Auto Scores</h3><br><h3>${Math.round(entry.intake)}</h3></div>`;
                    break;
                case 14:
                    htmlContent += `<div class="HStack"><h3>Auto Algae Attempts</h3><br><h3>${Math.round(entry.intake)}</h3></div>`;
                    break;
                case 15:
                    htmlContent += `<div class="HStack"><h3>Auto Coral Attempts</h3><br><h3>${Math.round(entry.intake)}</h3></div>`;
                    break;
                default:
                    htmlContent += `<div class="HStack"><h3>Invalid Entry.</h3></div>`;
                    break;
            }
        });
        htmlContent += "<br><br><h3>Other</h3><hr><br>";
        htmlContent += `<h4><b>defense</b></h4><br><p>${resJson[0].FullMain.defend}</p><br><br><h4><b>driving</b></h4><br><p>${resJson[0].FullMain.driving}</p><br><br><h4><b>overall</b></h4><br><p>${resJson[0].FullMain.overall}</p><br><br>`;
        htmlContent += `</div>`;
        document.getElementById("insertHere").insertAdjacentHTML("afterbegin", htmlContent);
        document.getElementById("eventCodeDisplay").innerText = `Team ${resJson[0].FullMain.team} | Match ${resJson[0].FullMain.match_num} @ ${resJson[0].FullMain.event} 2025`;
        pages[0].style.display = "none";
        pages[1].style.display = "flex";
    }).catch((error) => {
        console.log(error);
        // window.location.href = "/data"
    });
}
document.body.onload = getTeamsList;
