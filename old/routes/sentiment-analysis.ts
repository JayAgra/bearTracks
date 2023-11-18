/*jslint node: true*/
"use strict";
const vader = require("vader-sentiment");
//max 1 min 0
export function analyze(input: string): number {
    const scores = vader.SentimentIntensityAnalyzer.polarity_scores(
        input.toString()
    );
    return Number(((scores.pos - scores.neg + 1) / 2).toFixed(3));
}
