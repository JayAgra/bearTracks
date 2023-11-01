import express from "express";
import * as sqlite3 from "sqlite3";
import { escapeHTML } from "../src/escape";

type mainFormIncoming = {
	"event": string,
	"season": number,
	"team": number,
	"match": number,
	"level": string,
	"game1": string,
	"game2": string,
	"game3": string,
	"game4": string,
	"game5": string,
	"game6": string,
	"game7": string,
	"game8": string,
	"game9": string,
	"game10": string,
	"game11": string,
	"game12": string,
	"game13": string,
	"game14": string,
	"game15": string,
	"game16": string,
	"game17": string,
	"game18": string,
	"game19": string,
	"game20": string,
	"game21": string,
	"game22": string,
	"game23": string,
	"game24": string,
	"game25": string,
	"defend": string,
	"driving": string,
	"overall": string,
	"userId": string,
	"name": string,
	"weight": string,
	"analysis": string,
}

export async function submitForm(req: express.Request, res: express.Response, db: sqlite3.Database, transactions: sqlite3.Database, authDb: sqlite3.Database, dirname: string, season: number) {
    let body: string = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        // server has all data!
        // parse form
        let formData: mainFormIncoming = JSON.parse(body) as unknown as mainFormIncoming;
        // change score based on response length
        var formscoresdj = 0;
        if (formData.overall.length >= 150 && !(formData.overall.length >= 10e19)) {
            // logarithmic points
            formscoresdj = Math.ceil(10 + 5 * (Math.log(formData.overall.length - 150) / Math.log(6)));
        } else {
            formscoresdj = 20;
        }

        // statement to credit points
        let pointStmt: string = `UPDATE users SET score = score + ? WHERE id=?`;
        let pointValues: Array<number> = [formscoresdj, req.user.id];
        authDb.run(pointStmt, pointValues, (err) => {
            if (err) {
                return res.status(500).send("" + 0x1f42);
            }
        });
        transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [req.user.id, 0x1000, formscoresdj], (err: any) => {
            if (err) {
                return res.status(500).send("" + 0x1f42);
            }
        });

        // db statement
        let stmt = `INSERT INTO main (event, season, team, match, level, game1, game2, game3, game4, game5, game6, game7, game8, game9, game10, game11, game12, game13, game14, game15, game16, game17, game18, game19, game20, game21, game22, game23, game24, game25, defend, driving, overall, userId, name, fromTeam, weight, analysis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        let values = [
            escapeHTML(formData.event),
            season,
            Number(escapeHTML(String(formData.team))),
            Number(escapeHTML(String(formData.match))),
            escapeHTML(formData.level),
            escapeHTML(formData.game1),
            escapeHTML(formData.game2),
            escapeHTML(formData.game3),
            escapeHTML(formData.game4),
            escapeHTML(formData.game5),
            escapeHTML(formData.game6),
            escapeHTML(formData.game7),
            escapeHTML(formData.game8),
            escapeHTML(formData.game9),
            escapeHTML(formData.game10),
            escapeHTML(formData.game11),
            escapeHTML(formData.game12),
            escapeHTML(formData.game13),
            escapeHTML(formData.game14),
            escapeHTML(formData.game15),
            escapeHTML(formData.game16),
            escapeHTML(formData.game17),
            escapeHTML(formData.game18),
            escapeHTML(formData.game19),
            escapeHTML(formData.game20),
            escapeHTML(formData.game21),
            escapeHTML(formData.game22),
            escapeHTML(formData.game23),
            escapeHTML(formData.game24),
            escapeHTML(formData.game25),
            escapeHTML(formData.defend),
            escapeHTML(formData.driving),
            escapeHTML(formData.overall),
            req.user.id,
            req.user.name,
            req.user.team,
            0,
            "0",
        ];
        // run the statement, add to the database
        db.run(stmt, values, function(err: any) {
            if (err) {
                console.error(err);
                return res.status(500).send("" + 0x1f42);
            }
            require(`./${season}.js`).weightScores(this.lastID, db);
            return res.status(200).json({ "id": this.lastID });
        });
    });
}
