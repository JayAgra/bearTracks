const error = document.getElementById("errorTxt");

function emojiValue(value) {
    if (value == "true") {
        return "✅";
    } else {
        return "❌";
    }
}

function toIcons(str) {
    var step1 = str.replaceAll("0", "⬜");
    var step2 = step1.replaceAll("1", "🟪");
    var step3 = step2.replaceAll("2", "🟨");
    var step4 = step3.replaceAll("3", "❷");
    return step4.replaceAll("4", "❷");
}

function fullGridString(str, sep) {
    var strings = str.match(/.{1,9}/g);
    var iconstrings = [];
    iconstrings.push(toIcons(strings[0]));
    iconstrings.push(toIcons(strings[1]));
    iconstrings.push(toIcons(strings[2]));
    return iconstrings.join(sep);
}

async function loadData() {
    const urlParams = new URLSearchParams(window.location.search);
    const submissionID = urlParams.get("id");

    try {
        response = await fetch(`/api/data/detail/id/${submissionID}`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
            return;
        }

        if (response.status === 204) {
            error.innerText = "no results";
            error.style.display = "unset";
        }

        const listRes = await response.json();
        var text = `<b>Author:</b> ${listRes.name}<br><br>` +
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
        document.getElementById("resultTeamNum").innerText = listRes.team;
        document.getElementById("resultMatchNum").innerText = listRes.match;
        document.getElementById("resultEventCode").innerText = listRes.event;
        document.getElementById("resultText").innerHTML = text;
    } catch (err) {
        error.innerText = "no results";
        error.style.display = "unset";
        console.error(err);
    }
}

function goToHome() {
    window.location.href = "/";
}
