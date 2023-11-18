/*jslint node: true*/
/*jslint es6*/
"use strict";

import * as sqlite3 from "sqlite3";

import { analyze } from "./sentiment-analysis.js";

function boolToNum(val: string): number {
    if (Boolean(val) && val !== "undefined") {
        return 1;
    } else {
        return 0;
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


// TELEOP
// game6 is BOOL bottom row score
// game7 is BOOL middle row score
// game8 is BOOL top row score
// game9 is BOOL coop bonus (alliance)
// game10 is INT 0/2/6/10

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

type mainFormResult = {
    event: string;
    season: number;
    team: number;
    match: number;
    level: string;
    game1: string;
    game2: string;
    game3: string;
    game4: string;
    game5: string;
    game6: string;
    game7: string;
    game8: string;
    game9: string;
    game10: string;
    game11: string;
    game12: string;
    game13: string;
    game14: string;
    game15: string;
    game16: string;
    game17: string;
    game18: string;
    game19: string;
    game20: string;
    game21: string;
    game22: string;
    game23: string;
    game24: string;
    game25: string;
    defend: string;
    driving: string;
    overall: string;
    userId: string;
    name: string;
    weight: string;
    analysis: string;
};
export function weightScores(submissionID: number, db: sqlite3.Database) {
    db.get(`SELECT * FROM main WHERE id=${submissionID} LIMIT 1`, (err, result: mainFormResult) => {
        if (result && !err) {
            var analysisResults: Array<number> = [];
            var score: number = 0;
            //teleop, defend, driving, overall
            analysisResults.push(analyze(result.defend));
            analysisResults.push(analyze(result.driving));
            analysisResults.push(analyze(result.overall));
            console.log(analysisResults);

            // MAXIMUM SCORE: 15
            // sent analysis
            score = score + analysisResults[0] * 3.75;
            score = score + analysisResults[1] * 3.75;
            score = score + analysisResults[2] * 7.5;

            // MAXIMUM 11
            // charging pts
            score = score + Number(result.game5) / 2;
            score = score + Number(result.game10) / 2;

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
            var cubes: number = 0,
                cones: number = 0,
                gridWt: number = 0,
                low: number = 0,
                mid: number = 0,
                high: number = 0,
                lowCube: number = 0,
                lowCone: number = 0,
                midCube: number = 0,
                midCone: number = 0,
                highCube: number = 0,
                highCone: number = 0,
                fullGrid: boolean = !result.game12.split("").includes("0");

            // process content of grid
            result.game12.split("").forEach((item: string, index: number) => {
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
            const mpsScores: Array<number> = [score, score + 2 * gridWt, score * (cubes / 15), score * (cones / 22), score * (low / 9), score * (mid / 9), score * (high / 9), score * (lowCube / 9), score * (lowCone / 9), score * (midCube / 9), score * (midCone / 9), score * (highCube / 9), score * (highCone / 9)];
            const updateSubmissionStmt: string = "UPDATE main SET weight=?, analysis=?, game21=?, game13=?, game14=?, game15=?, game16=?, game17=?, game18=?, game19=?, game20=?, game23=?, game24=?, game25=? WHERE id=?";
            const updateSubmissionValues: Array<any> = [mpsScores.join(","), analysisResults.toString(), lowCube, lowCone, midCube, midCone, highCube, highCone, low, mid, high, cubes, cones, gridWt, submissionID];
            db.run(updateSubmissionStmt, updateSubmissionValues, (err: any) => {
                if (err) {
                    console.log("Error updating DB!");
                }
            });
        } else {
            console.error("query failure");
        }
    });
}