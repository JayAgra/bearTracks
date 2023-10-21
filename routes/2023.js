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
            `<b>Match Performance Score: </b>${Number(dbQueryResult.weight.split(",")[0]).toFixed(2)}`;
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
            const updateSubmissionValues = [mpsScores.join(","), analysisResults.toString(), lowCube, lowCone, midCube, midCone, highCube, highCone, low, mid, high, cubes, cones, gridWt, submissionID];
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

module.exports = {
    createHTMLExport,
    weightScores
};