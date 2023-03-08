const vader = require('vader-sentiment');
//max 1 min 0
function analyze(input) {
    const scores = vader.SentimentIntensityAnalyzer.polarity_scores(input);
    return Number(((scores.pos - scores.neg + 1)/2).toFixed(3))
}

module.exports = { analyze };