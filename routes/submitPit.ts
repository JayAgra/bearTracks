import express from "express";
import * as sqlite3 from "sqlite3";

function escapeHTML(htmlStr: string): string {
    return String(htmlStr)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export async function submitPit(req: express.Request, res: express.Response, db: sqlite3.Database, transactions: sqlite3.Database, authDb: sqlite3.Database, dirname: string, season: number) {
    // get body of POST data
    let formData = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    // db statement
    let stmt: string = `INSERT INTO pit (event, season, team, drivetype, game1, game2, game3, game4, game5, game6, game7, game8, game9, game10, game11, game12, game13, game14, game15, game16, game17, game18, game19, game20, driveTeam, attended, confidence, bqual, overall, userId, name, image1, image2, image3, image4, image5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    // escaped data from user added as values
    let values = [
        escapeHTML(formData.event),
        season,
        escapeHTML(formData.team),
        escapeHTML(formData.drivetype),
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
        escapeHTML(formData.driveTeam),
        escapeHTML(formData.attended),
        escapeHTML(formData.confidence),
        escapeHTML(formData.bqual),
        escapeHTML(formData.overall),
        escapeHTML(String(req.user.id)),
        escapeHTML(req.user.name),
        files.image1[0].filename,
        files.image2[0].filename,
        files.image3[0].filename,
        files.image4[0].filename,
        files.image5[0].filename,
    ];
    // run db statement
    db.run(stmt, values, (err: any) => {
        if (err) {
            console.error(err);
            return res.status(500).send("" + 0x1f42);
        }
    });
    // credit points to scout
    // TODO: variable points on pit form
    let pointStmt: string = `UPDATE users SET score = score + 35 WHERE id=?`;
    let pointValues: Array<number> = [req.user.id];
    authDb.run(pointStmt, pointValues, (err: any) => {
        if (err) {
            return res.status(500).send("" + 0x1f42);
        }
    });
    transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [req.user.id, 0x1001, 35], (err: any) => {
        if (err) {
            return res.status(500).send("" + 0x1f42);
        }
    });
    // send success message to user
    return res.sendFile("src/submitted.html", {
        root: dirname,
    });
}
