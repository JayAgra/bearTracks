import express from "express";
import * as sqlite3 from "sqlite3";

export async function getScoutResponses(req: express.Request, res: express.Response, db: sqlite3.Database, season: number) {
    const stmt: string = "SELECT id, team, match, level, game2, game3, game4, game5, game6, game7, game8, game10, game25, game11, weight, userId, name, fromTeam FROM main WHERE season=? AND userId=? ORDER BY id DESC";
    const values: Array<any> = [season, req.params.userId];
    db.all(stmt, values, (error: any, result: Array<Object> | undefined) => {
        if (error || typeof result == "undefined") {
            return res.status(500).send("" + 0x1f41);
        } else {
            if (result.length === 0) {
                return res.status(204).send("" + 0xcc1);
            } else {
                return res.status(200).json(result);
            }
        }
    });
}
