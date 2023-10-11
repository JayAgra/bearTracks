/*jslint node: true*/
/*jslint es6*/
"use strict";
const saModule = require("./sentiment-analysis.js");

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
    if (value == "true") {
        return "✅";
    } else {
        return "❌";
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
// game22 is INT (0)
// formType is STRING the form that was submitted and is not entered into db

// game 13 will be low cones
// game 14 will be mid cubes
// game 15 will be mid cones
// game 16 will be high cubes
// game 17 will be high cones
// game 18 will be low pcs
// game 19 will be mid pcs
// game 20 will be high pcs
// game 21 will be low cubes
// game 23 will be cubes pcs
// game 24 will be cones pcs
// game 25 will be grid pts

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
    return `<b>Author:</b> ${dbQueryResult.discordName}#${dbQueryResult.discordTag}<br><br>` +
            `<b>AUTO: <br>Taxi: </b>${emojiValue(dbQueryResult.game1)}<br>` +
            `<b>Score B/M/T: </b>${emojiValue(dbQueryResult.game2)}${emojiValue(dbQueryResult.game3)}${emojiValue(dbQueryResult.game4)}<br>` +
            `<b>Charging: </b>${dbQueryResult.game5} pts<br><br>` +
            `<b>TELEOP: <br>Score B/M/T: </b>${emojiValue(dbQueryResult.game6)}${emojiValue(dbQueryResult.game7)}${emojiValue(dbQueryResult.game8)}<br><b>Charging: </b>${dbQueryResult.game10} pts<br><br>` +
            `<b>Other: <br>Alliance COOPERTITION: </b>${emojiValue(dbQueryResult.game9)}<br><b>Cycle Time: </b>${dbQueryResult.game11} seconds<br><b>Defense: </b>${dbQueryResult.defend}<br><b>Driving: </b>${dbQueryResult.driving}<br><b>Overall: </b>${dbQueryResult.overall}<br>` +
            `<b>Grid:<br>${fullGridString((dbQueryResult.game12).toString(), "<br>")}<br><br>` +
            `<b>low/mid/high cubes - cones: </b>${dbQueryResult.game21}/${dbQueryResult.game14}/${dbQueryResult.game16} - ${dbQueryResult.game13}/${dbQueryResult.game15}/${dbQueryResult.game17}<br>` +
            `<b>low/mid/high pcs: </b>${dbQueryResult.game18}/${dbQueryResult.game19}/${dbQueryResult.game20}<br>` +
            `<b>cubes/cones: </b>${dbQueryResult.game23}/${dbQueryResult.game24}<br>` +
            `<b>total grid: </b>${dbQueryResult.game25}pts` +
            `<b>Match Performance Score: </b>${dbQueryResult.weight.split(",")[0]}%`;
}

function weightScores(submissionID, db) {
    db.get(`SELECT * FROM main WHERE id=${submissionID} LIMIT 1`, (err, result) => {
        if (result && !err) {
            var analysisResults = [];
            var score = 0;
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
            var cubes = 0,
                cones = 0,
                gridWt = 0,
                low = 0,
                mid = 0,
                high = 0,
                lowCube = 0,
                lowCone = 0,
                midCube = 0,
                midCone = 0,
                highCube = 0,
                highCone = 0,
                fullGrid = !result.game12.split("").includes("0");

            // process content of grid
            result.game12.split("").forEach((item, index) => {
                if (index <= 8 && item != "0") {
                    // high row
                    high++;
                    switch (item) {
                        case "1": {
                            cubes++;
                            highCube++;
                            gridWt += 5;
                            break;
                        }
                        case "2": {
                            cones++;
                            highCone++;
                            gridWt += 5;
                            break;
                        }
                        case "3": {
                            cubes += 2;
                            highCube += 2;
                            if (fullGrid) gridWt += 8;
                            break;
                        }
                        case "4": {
                            cones += 2;
                            highCone += 2;
                            if (fullGrid) gridWt += 8;
                            break;
                        }
                    }
                } else if (index <= 17 && item != "0") {
                    // mid row
                    mid++;
                    switch (item) {
                        case "1": {
                            cubes++;
                            midCube++;
                            gridWt += 3;
                            break;
                        }
                        case "2": {
                            cones++;
                            midCone++;
                            gridWt += 3;
                            break;
                        }
                        case "3": {
                            cubes += 2;
                            midCube += 2;
                            if (fullGrid) gridWt += 6;
                            break;
                        }
                        case "4": {
                            cones += 2;
                            midCone += 2;
                            if (fullGrid) gridWt += 6;
                            break;
                        }
                    }
                } else if (index <= 26 && item != "0") {
                    // low row
                    low++;
                    switch (item) {
                        case "1": {
                            cubes++;
                            lowCube++;
                            gridWt += 2;
                            break;
                        }
                        case "2": {
                            cones++;
                            lowCone++;
                            gridWt += 2;
                            break;
                        }
                        case "3": {
                            cubes += 2;
                            lowCube += 2;
                            if (fullGrid) gridWt += 5;
                            break;
                        }
                        case "4": {
                            cones += 2;
                            lowCone += 2;
                            if (fullGrid) gridWt += 5;
                            break;
                        }
                    }
                }
            });

            // assume reasonable max is 65
            score += gridWt / 1.6875;
            // 0 - standard
            // 1 - grid points
            // 2 - cubes
            // 3 - cones
            // 4 - bottom row
            // 5 - middle row
            // 6 - top row
            // 7 - bottom row cube
            // 8 - bottom row cone
            // 9 - middle row cube
            // 10 - middle row cone
            // 11 - top row cube
            // 12 - top row cone
            const mpsScores = [score, score + 2 * gridWt, score * (cubes / 15), score * (cones / 22), score * (low / 9), score * (mid / 9), score * (high / 9), score * (lowCube / 9), score * (lowCone / 9), score * (midCube / 9), score * (midCone / 9), score * (highCube / 9), score * (highCone / 9)];
            const updateSubmissionStmt = "UPDATE main SET weight=?, analysis=?, game21=?, game13=?, game14=?, game15=?, game16=?, game17=?, game18=?, game19=?, game20=?, game23=?, game24=?, game25=? WHERE id=?";
            const updateSubmissionValues = [score.toFixed(2), analysisResults.toString(), lowCube, lowCone, midCube, midCone, highCube, highCone, low, mid, high, cubes, cones, mpsScores.join(","), submissionID];
            db.run(updateSubmissionStmt, updateSubmissionValues, (err) => {
                if (err) {
                    console.log("Error updating DB!");
                }
            });
        } else {
            console.log("query failure");
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
        "perf_score": 0,
        "lowCube": 0,
        "lowCone": 0,
        "midCube": 0,
        "midCone": 0,
        "highCube": 0,
        "highCone": 0,
        "low": 0,
        "mid": 0,
        "high": 0
    };
    var max = {
        "auto_charge": 0,
        "teleop_charge": 0,
        "grid": 0,
        "cycle": 0,
        "perf_score": 0
    };
    var min = {
        "auto_charge": Number.MAX_SAFE_INTEGER,
        "teleop_charge": Number.MAX_SAFE_INTEGER,
        "grid": Number.MAX_SAFE_INTEGER,
        "cycle": Number.MAX_SAFE_INTEGER,
        "perf_score": Number.MAX_SAFE_INTEGER
    };
    function setIfHigher(property, value) {
        if (max[property] < value) max[property] = value;
    }
    
    function setIfLower(property, value) {
        if (min[property] > value) min[property] = value;
    }
    for (var i = 0; i < data.length; i++) {
        html += ` <tr><td><a href="/detail?id=${data[i].id}" target="_blank" style="all: unset; color: #2997FF; text-decoration: none;">${data[i].level} ${data[i].match}</a><br><span>${data[i].discordName}#${data[i].discordTag}</span></td>` + // match link
                `<td>${emojiValue(data[i].game2)}${emojiValue(data[i].game3)}${emojiValue(data[i].game4)}</td>` + // auto score
                `<td>${data[i].game5}</td>` + // auto charge
                `<td>${emojiValue(data[i].game6)}${emojiValue(data[i].game7)}${emojiValue(data[i].game8)}</td>` + // teleop score
                `<td>${data[i].game10}</td>` + // teleop charge
                `<td>${data[i].game25}</td>` + // grid points
                `<td>${data[i].game21}</td><td>${data[i].game14}</td><td>${data[i].game16}</td>` + // cubes
                `<td>${data[i].game21}</td><td>${data[i].game14}</td><td>${data[i].game16}</td>` + // cones
                `<td>${data[i].game18}</td><td>${data[i].game19}</td><td>${data[i].game20}</td>` + // total
                `<td>${data[i].game11}</td>` + // cycle time
                `<td>${data[i].weight.split(",")[0]}</td></tr>`; // standard mps
        
        avg.auto_charge += Number(data[i].game5);
        avg.teleop_charge += Number(data[i].game10);
        avg.grid += Number(data[i].game25);
        avg.cycle += Number(data[i].game11);
        avg.perf_score += Number(data[i].weight.split(",")[0]);
        avg.lowCube += Number(data[i].game21);
        avg.lowCone += Number(data[i].game13);
        avg.midCube += Number(data[i].game14);
        avg.midCone += Number(data[i].game15);
        avg.highCube += Number(data[i].game16);
        avg.highCone += Number(data[i].game17);
        avg.low += Number(data[i].game18);
        avg.mid += Number(data[i].game19);
        avg.high += Number(data[i].game20);

        setIfHigher("auto_charge", data[i].game5);
        setIfHigher("teleop_charge", data[i].game10);
        setIfHigher("grid", data[i].game25);
        setIfHigher("cycle", data[i].game11);
        setIfHigher("perf_score", Number(data[i].weight.split(",")[0]));

        setIfLower("auto_charge", data[i].game5);
        setIfLower("teleop_charge", data[i].game10);
        setIfLower("grid", data[i].game25);
        setIfLower("cycle", data[i].game11);
        setIfLower("perf_score", Number(data[i].weight.split(",")[0]));
    }

    for (let key in avg) {
        avg[key] /= data.length;
    }

    for (let key in min) {
        if (min[key] === Number.MAX_SAFE_INTEGER) min[key] = "und";        
    }

    html += `<tr style="font-weight: bold"><td>avg</td>` + // match link
            `<td></td>` + // auto score
            `<td>${Math.round(avg.auto_charge)} (${min.auto_charge} - ${max.auto_charge})</td>` + // auto charge
            `<td></td>` + // teleop score
            `<td>${Math.round(avg.teleop_charge)} (${min.teleop_charge} - ${max.teleop_charge})</td>` + // teleop charge
            `<td>${Math.round(avg.grid)} (${min.grid} - ${max.grid})</td>` + // grid points
            `<td>${Math.round(avg.lowCube)}</td><td>${Math.round(avg.midCube)}</td><td>${Math.round(avg.highCube)}</td>` + // cubes
            `<td>${Math.round(avg.lowCone)}</td><td>${Math.round(avg.midCone)}</td><td>${Math.round(avg.highCone)}</td>` + // cones
            `<td>${Math.round(avg.low)}</td><td>${Math.round(avg.mid)}</td><td>${Math.round(avg.high)}</td>` + // total
            `<td>${Math.round(avg.cycle)} (${min.cycle} - ${max.cycle})</td>` + // cycle time
            `<td>${Math.round(avg.perf_score)} (${min.perf_score} - ${max.perf_score})</td></tr>`; // standard mps
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
        html = html + ` <tr><td><strong>Team ${data[i].team}</strong><br><a href="/detail?id=${data[i].id}" target="_blank" style="all: unset; color: #2997FF; text-decoration: none;">${data[i].level} ${data[i].match}</a><br><span>${data[i].discordName}#${data[i].discordTag}</span></td><td>${emojiValue(data[i].game2)}${emojiValue(data[i].game3)}${emojiValue(data[i].game4)}</td><td>${data[i].game5}</td><td>${emojiValue(data[i].game6)}${emojiValue(data[i].game7)}${emojiValue(data[i].game8)}</td><td>${data[i].game10}</td><td>${data[i].game25}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>${data[i].game11}</td><td>${data[i].weight.split(",")[0]}</td></tr>`;
        avg.auto_charge += Number(data[i].game5);
        avg.teleop_charge += Number(data[i].game10);
        avg.grid += Number(data[i].game25);
        avg.cycle += Number(data[i].game11);
        avg.perf_score += Number(data[i].weight.split(",")[0]);
    }

    avg.auto_charge /= data.length;
    avg.teleop_charge /= data.length;
    avg.grid /= data.length;
    avg.cycle /= data.length;
    avg.perf_score /= data.length;

    html += `<tr><td>avg</td><td></td><td>${Math.round(avg.auto_charge)}</td><td></td><td>${Math.round(avg.teleop_charge)}</td><td>${Math.round(avg.grid)}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>${Math.round(avg.cycle)}</td><td>${Math.round(avg.perf_score)}</td></tr>`;
    return html;
}

module.exports = {
    createHTMLExport,
    weightScores,
    createHTMLTable,
    createHTMLTableWithTeamNum
};