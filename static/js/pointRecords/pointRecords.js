import { _get } from "../_modules/get/get.min.js";
async function getPointsData() {
    _get("/api/scouts/transactions/me", "viewMatchButton").then((listRes) => {
        if (listRes.status === 0xcc1) {
            document.getElementById("preInsert").insertAdjacentHTML("afterend", '<tr class="padded"><td>no data</td><td>no data</td></tr>');
        }
        else {
            const types = {
                "2457": "form submission",
                "4096": "main form submission",
                "4097": "pit form submission",
                "5273": "gambling",
                "5376": "spin thing",
                "5377": "slots",
                "5378": "blackjack bet",
                "5379": "blackjack win",
                "5380": "blackjack tie",
                "5381": "blackjack loss",
                "6553": "admin modification",
                "8192": "bad main form data",
                "8193": "bad pit form data",
                "8194": "score reset"
            };
            var listHTML = "";
            for (var i = 0; i < listRes.length; i++) {
                listHTML += `<tr class="padded"><td>${types[String(listRes[i].type)]}</td><td>${listRes[i].amount}</td><td>${listRes[i].time}</td></tr>`;
            }
            document.getElementById("preInsert").insertAdjacentHTML("afterend", listHTML);
        }
    }).catch((err) => console.log(err));
}
window.getPointsData = getPointsData;
