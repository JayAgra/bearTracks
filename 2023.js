/*jslint node: true*/
/*jslint es6*/
"use strict";
const sqlite3 = require("sqlite3");
const saModule = require("./sentiment-analysis.js");

var db = new sqlite3.Database("data.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("could not open database");
    }
});

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

function boolToNum(val) {
    if (val) {
        return 1;
    } else {
        return 0;
    }
}

function emojiValue(value) {
    if (value == null || value == "false") {
        return "❌";
    } else {
        return "✅";
    }
}

// main data:

// BASIC DATA
// event is event code
// name is scout name
// team is scouted team
// match is match number
// level is the level of the match

// AUTON
// game1 is BOOL taxi (3pts)
// game2 is BOOL bottom row score (3pts)
// game3 is BOOL middle row score (4pts)
// game4 is BOOL top row score (6pts)
// game5 is INT 0/8/12 no dock or engage/dock no engage/dock and engage


//TELEOP
// game 6 is BOOL bottom row score
// game 7 is BOOL middle row score
// game 8 is BOOL top row score
// game 9 is BOOL coop bonus (alliance)
// game 10 is INT 0/2/6/10

// AFTER MATCH
// game11 is INT est cycle time
// teleop is STRING thoughts about teleop phase
// defend is STRING about robot defence
// driving is STRING about the robot's driver
// overall is STRING as overall thoughts about the team

// UNUSED VALUES
// game12 - game25 is INT (0)
// formType is STRING the form that was submitted and is not entered into db

// game25 will be set to grid total

// pit data:

// BASIC DATA
// event is event code
// name is scout name
// team is scouted team

// PIT SCOUTING DATA
// drivetype is STRING what drive type
// driveTeam is INT how many **days** of drive team work on this robot
// attended is INT how many other events has team attended
// overall is STRING overall thoughts

// UNUSED VALUES
// game1 - game20 is INT (0)
// formType is STRING the form that was submitted and is not entered into db

function createHTMLExport(dbQueryResult) {
    return `Author: ${dbQueryResult.discordName}#${dbQueryResult.discordTag}<br><br>AUTO: <br>Taxi: ${emojiValue(dbQueryResult.game1)}<br>Score B/M/T: ${emojiValue(dbQueryResult.game2)}${emojiValue(dbQueryResult.game3)}${emojiValue(dbQueryResult.game4)}<br>Charging: ${dbQueryResult.game5} pts<br><br>TELEOP: <br>Score B/M/T: ${emojiValue(dbQueryResult.game6)}${emojiValue(dbQueryResult.game7)}${emojiValue(dbQueryResult.game8)}<br>Charging: ${dbQueryResult.game10} pts<br><br>Other: <br>Alliance COOPERTITION: ${emojiValue(dbQueryResult.game9)}<br>Cycle Time: ${dbQueryResult.game11} seconds<br>Defense: ${dbQueryResult.defend}<br>Driving: ${dbQueryResult.driving}<br>Overall: ${dbQueryResult.overall}<br>Grid:<br>${fullGridString((dbQueryResult.game12).toString(), "<br>")}<br><br>Match Performance Score: ${dbQueryResult.weight}%`;
}

function weightScores(submissionID) {
    var analysisResults = [];
    var score = 0;
    db.get(`SELECT * FROM main WHERE id=${submissionID} LIMIT 1`, (err, result) => {
        if (result && !err) {
            //teleop, defend, driving, overall
            analysisResults.push(saModule.analyze(result.defend));
            analysisResults.push(saModule.analyze(result.driving));
            analysisResults.push(saModule.analyze(result.overall));
            console.log(analysisResults);

            // MAXIMUM SCORE: 15
            // sent analysis
            score = score + analysisResults[0] * 3.75;
            score = score + analysisResults[1] * 3.75;
            score = score + analysisResults[2] * 7.5;

            // MAXIMUM 11
            // charging pts
            score = score + result.game5 / 2;
            score = score + result.game10 / 2;

            // MAXIMUM 26
            // auto pts
            score = score + boolToNum(result.game1) * 6; //taxi
            score = score + boolToNum(result.game2) * 6; //score btm
            score = score + boolToNum(result.game3) * 8; //score mid
            score = score + boolToNum(result.game4) * 12; //score top

            // MAXIMUM 10
            // teleop pts
            score = score + boolToNum(result.game6) * 2; //score btm
            score = score + boolToNum(result.game7) * 3; //score mid
            score = score + boolToNum(result.game8) * 3; //score top
            score = score + boolToNum(result.game9) * 2; //coop bonus

            // MAXIMUM 38
            // grid items
            var cubes = 0;
            var cones = 0;
            var gridWt = 0;
            const fullGrid = !result.game12.split("").includes("0");
            result.game12.split("").forEach(function(item, index) {
                if (index <= 8 && item != "0") {
                    if (item == "3" || item == "4" && fullGrid) {
                        gridWt += 3;
                    }
                    gridWt += 5;
                } else if (index <= 17 && item != "0") {
                    if (item == "3" || (item == "4" && fullGrid)) {
                        gridWt += 3;
                    }
                    gridWt = gridWt + 3;
                } else if (index <= 26 && item != "0") {
                    if (item == "3" || (item == "4" && fullGrid)) {
                        gridWt += 3;
                    }
                    gridWt += 2;
                }
                if (item == "1") {
                    cubes++
                } else if (item == "3") {
                    cubes += 2
                }
                if (item == "2") {
                    cones++
                } else if (item == "3") {
                    cones += 2
                }
            });
            // assume reasonable max is 65
            score = score + (gridWt / 1.6875);
            db.run(`UPDATE main SET weight=${score.toFixed(2)} WHERE id=${submissionID}`, (err, result) => {
                if (err) {
                    console.log("Error updating DB!");
                }
            });
            db.run(`UPDATE main SET analysis="${analysisResults.toString()}" WHERE id=${submissionID}`, (err) => {
                if (err) {
                    console.log("Error updating DB!");
                }
            });
            db.run(`UPDATE main SET game23=${cubes} WHERE id=${submissionID}`, (err, result) => {
                if (err) {
                    console.log("Error updating DB!");
                }
            });
            db.run(`UPDATE main SET game24=${cones} WHERE id=${submissionID}`, (err, result) => {
                if (err) {
                    console.log("Error updating DB!");
                }
            });
            db.run(`UPDATE main SET game25=${gridWt} WHERE id=${submissionID}`, (err, result) => {
                if (err) {
                    console.log("Error updating DB!");
                }
            });
        } else {
            return "error!";
        }
    });
}

function createHTMLTable(data) {
    var html = ``;
    var avg = {
        "auto_charge": 0,
        "teleop_charge": 0,
        "grid": 0,
        "cycle": 0,
        "perf_score": 0
    };
    var max = {
        "auto_charge": Number.MIN_SAFE_INTEGER,
        "teleop_charge": Number.MIN_SAFE_INTEGER,
        "grid": Number.MIN_SAFE_INTEGER,
        "cycle": Number.MIN_SAFE_INTEGER,
        "perf_score": Number.MIN_SAFE_INTEGER
    };
    var min = {
        "auto_charge": Number.MAX_SAFE_INTEGER,
        "teleop_charge": Number.MAX_SAFE_INTEGER,
        "grid": Number.MAX_SAFE_INTEGER,
        "cycle": Number.MAX_SAFE_INTEGER,
        "perf_score": Number.MAX_SAFE_INTEGER
    }; 

    for (var i = 0; i < data.length; i++) {
        html = html + ` <tr><td><a href="/detail?id=${data[i].id}" target="_blank" style="all: unset; color: #2997FF; text-decoration: none;">${data[i].level} ${data[i].match}</a><br><span>${data[i].discordName}#${data[i].discordTag}</span></td><td>${emojiValue(data[i].game2)}${emojiValue(data[i].game3)}${emojiValue(data[i].game4)}</td><td>${data[i].game5}</td><td>${emojiValue(data[i].game6)}${emojiValue(data[i].game7)}${emojiValue(data[i].game8)}</td><td>${data[i].game10}</td><td>${data[i].game25}</td><td>${data[i].game11}</td><td>${data[i].weight}</td></tr>`;
        
        avg.auto_charge += Number(data[i].game5);
        avg.teleop_charge += Number(data[i].game10);
        avg.grid += Number(data[i].game25);
        avg.cycle += Number(data[i].game11);
        avg.perf_score += Number(data[i].weight);

        if (max.auto_charge < data[i].game5) max.auto_charge = Number(data[i].game5);
        if (max.teleop_charge < data[i].game10) max.teleop_charge = Number(data[i].game10);
        if (max.grid < data[i].game25) max.grid = Number(data[i].game25);
        if (max.cycle < data[i].game11) max.cycle = Number(data[i].game11);
        if (max.perf_score < data[i].weight) max.perf_score = Number(data[i].weight);

        if (min.auto_charge > data[i].game5) min.auto_charge = Number(data[i].game5);
        if (min.teleop_charge > data[i].game10) min.teleop_charge = Number(data[i].game10);
        if (min.grid > data[i].game25) min.grid = Number(data[i].game25);
        if (min.cycle > data[i].game11) min.cycle = Number(data[i].game11);
        if (min.perf_score > data[i].weight) min.perf_score = Number(data[i].weight);
    }

    avg.auto_charge /= data.length;
    avg.teleop_charge /= data.length;
    avg.grid /= data.length;
    avg.cycle /= data.length;
    avg.perf_score /= data.length;

    html += `<tr><td>avg</td><td></td><td>${Math.round(avg.auto_charge)} (${min.auto_charge} - ${max.auto_charge})</td><td></td><td>${Math.round(avg.teleop_charge)} (${min.teleop_charge} - ${max.teleop_charge})</td><td>${Math.round(avg.grid)} (${min.grid} - ${max.grid})</td><td>${Math.round(avg.cycle)} (${min.cycle} - ${max.cycle})</td><td>${Math.round(avg.perf_score)} (${min.perf_score} - ${max.perf_score})</td></tr>`;
    return html;
}

function createHTMLTableWithTeamNum(data) {
    var html = ``;
    var avg = {
        "auto_charge": 0,
        "teleop_charge": 0,
        "grid": 0,
        "cycle": 0,
        "perf_score": 0
    };

    for (var i = 0; i < data.length; i++) {
        html = html + ` <tr><td><strong>Team ${data[i].team}</strong><br><a href="/detail?id=${data[i].id}" target="_blank" style="all: unset; color: #2997FF; text-decoration: none;">${data[i].level} ${data[i].match}</a><br><span>${data[i].discordName}#${data[i].discordTag}</span></td><td>${emojiValue(data[i].game2)}${emojiValue(data[i].game3)}${emojiValue(data[i].game4)}</td><td>${data[i].game5}</td><td>${emojiValue(data[i].game6)}${emojiValue(data[i].game7)}${emojiValue(data[i].game8)}</td><td>${data[i].game10}</td><td>${data[i].game25}</td><td>${data[i].game11}</td><td>${data[i].weight}</td></tr>`;
        avg.auto_charge += Number(data[i].game5);
        avg.teleop_charge += Number(data[i].game10);
        avg.grid += Number(data[i].game25);
        avg.cycle += Number(data[i].game11);
        avg.perf_score += Number(data[i].weight);
    }

    avg.auto_charge /= data.length;
    avg.teleop_charge /= data.length;
    avg.grid /= data.length;
    avg.cycle /= data.length;
    avg.perf_score /= data.length;

    html += `<tr><td>avg</td><td></td><td>${Math.round(avg.auto_charge)}</td><td></td><td>${Math.round(avg.teleop_charge)}</td><td>${Math.round(avg.grid)}</td><td>${Math.round(avg.cycle)}</td><td>${Math.round(avg.perf_score)}</td></tr>`;
    return html;
}

module.exports = {
    createHTMLExport,
    weightScores,
    createHTMLTable,
    createHTMLTableWithTeamNum
};