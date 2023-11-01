function createChartDataset(label, backgroundColor, data) {
    return {
        "label": label,
        "backgroundColor": backgroundColor,
        "data": data
    };
}
function createChartData(labels, datasets) {
    return {
        "labels": labels,
        "datasets": datasets
    };
}
function createChartConfig(type, data, name) {
    return {
        "type": type,
        "data": data,
        "options": {
            "indexAxis": "y",
            "responsive": true,
            "scales": {
                "yAxes": [{
                        "min": 0
                    }]
            },
            "plugins": {
                "title": {
                    "display": true,
                    "text": name
                }
            }
        }
    };
}
async function constructGraphs() {
    var teamGraph, completeMatches = [], processedMatches = [], chartLabels = [];
    try {
        const response = await fetch(`/api/teams/event/current/${document.getElementById("eventCode").value}/${document.getElementById("teamNum").value}/weight`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
        if (response.status === 204 || !response.ok) {
            document.getElementById("error").innerHTML = "&emsp;no results";
            document.getElementById("error").style.display = "unset";
        }
        teamGraph = await response.json();
        teamGraph.forEach((matchData) => {
            if (completeMatches.includes(matchData.match)) { }
            else {
                completeMatches.push(matchData.match);
                chartLabels.push(String(matchData.match));
                processedMatches.push({
                    "match": matchData.match,
                    "autoCharge": Number(matchData.game5),
                    "teleopCharge": Number(matchData.game10),
                    "cycle": Number(matchData.game11),
                    "lowCubes": Number(matchData.game21),
                    "lowCones": Number(matchData.game13),
                    "midCubes": Number(matchData.game14),
                    "midCones": Number(matchData.game15),
                    "highCubes": Number(matchData.game16),
                    "highCones": Number(matchData.game17),
                    "lowPcs": Number(matchData.game18),
                    "midPcs": Number(matchData.game19),
                    "highPcs": Number(matchData.game20),
                    "cubes": Number(matchData.game23),
                    "cones": Number(matchData.game24),
                    "grid": Number(matchData.game25),
                    "weight": Number(matchData.weight.split(",")[0])
                });
            }
        });
        var allMatches = {
            "autoCharge": [],
            "teleopCharge": [],
            "cycle": [],
            "lowCubes": [],
            "lowCones": [],
            "midCubes": [],
            "midCones": [],
            "highCubes": [],
            "highCones": [],
            "lowPcs": [],
            "midPcs": [],
            "highPcs": [],
            "cubes": [],
            "cones": [],
            "grid": [],
            "weight": []
        };
        processedMatches.sort((a, b) => a[0] - b[0]);
        processedMatches.forEach((matchData) => {
            allMatches.autoCharge.push(matchData.autoCharge);
            allMatches.teleopCharge.push(matchData.teleopCharge);
            allMatches.cycle.push(matchData.cycle);
            allMatches.lowCubes.push(matchData.lowCubes);
            allMatches.lowCones.push(matchData.lowCones);
            allMatches.midCubes.push(matchData.midCubes);
            allMatches.midCones.push(matchData.midCones);
            allMatches.highCubes.push(matchData.highCubes);
            allMatches.highCones.push(matchData.highCones);
            allMatches.lowPcs.push(matchData.lowPcs);
            allMatches.midPcs.push(matchData.midPcs);
            allMatches.highPcs.push(matchData.highPcs);
            allMatches.cubes.push(matchData.cubes);
            allMatches.cones.push(matchData.cones);
            allMatches.grid.push(matchData.grid);
            allMatches.weight.push(matchData.weight);
        });
        const weightChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("PERFORMANCE SCORE", "#8ec07c", allMatches.weight)]), "Match Performance Score");
        const gridPtsChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("GRID POINTS", "#8ec07c", allMatches.grid)]), "Grid Points");
        const allConeCubeChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("CONES", "#ff0", allMatches.cones), createChartDataset("CUBES", "#a216a2", allMatches.cubes)]), "Cones & Cubes");
        const chargeChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("AUTO", "#b8bb26", allMatches.autoCharge), createChartDataset("TELEOP", "#83a598", allMatches.teleopCharge)]), "Auto & Teleop Charging");
        const cycleTimeChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("CYCLE TIME", "#8ec07c", allMatches.cycle)]), "Cycle Time");
        const allLevelsChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("LOW", "#b8bb26", allMatches.lowPcs), createChartDataset("MID", "#fabd2f", allMatches.midPcs), createChartDataset("HIGH", "#83a598", allMatches.highPcs)]), "Scoring Levels");
        const lowConeCubeChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("CONES", "#ff0", allMatches.lowCones), createChartDataset("CUBES", "#a216a2", allMatches.lowCubes)]), "Low Cones & Cubes");
        const midConeCubeChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("CONES", "#ff0", allMatches.midCones), createChartDataset("CUBES", "#a216a2", allMatches.midCubes)]), "Mid Cones & Cubes");
        const highConeCubeChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("CONES", "#ff0", allMatches.highCones), createChartDataset("CUBES", "#a216a2", allMatches.highCubes)]), "High Cones & Cubes");
        const weightChart = new Chart(document.getElementById("weightChart"), weightChartCfg);
        const gridPtsChart = new Chart(document.getElementById("gridPtsChart"), gridPtsChartCfg);
        const allConeCubeChart = new Chart(document.getElementById("allConeCubeChart"), allConeCubeChartCfg);
        const chargeChart = new Chart(document.getElementById("chargeChart"), chargeChartCfg);
        const cycleTimeChart = new Chart(document.getElementById("cycleTimeChart"), cycleTimeChartCfg);
        const allLevelsChart = new Chart(document.getElementById("allLevelsChart"), allLevelsChartCfg);
        const lowConeCubeChart = new Chart(document.getElementById("lowConeCubeChart"), lowConeCubeChartCfg);
        const midConeCubeChart = new Chart(document.getElementById("midConeCubeChart"), midConeCubeChartCfg);
        const highConeCubeChart = new Chart(document.getElementById("highConeCubeChart"), highConeCubeChartCfg);
        document.getElementById("teamAtEvent").innerText = document.getElementById("teamNum").value;
        document.getElementById("search").style.display = "none";
        document.getElementById("results").style.display = "flex";
    }
    catch (err) {
        document.getElementById("error").innerHTML = "&emsp;no results";
        document.getElementById("error").style.display = "unset";
    }
}
