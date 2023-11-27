type match = {
    "match_num": number,
    "autoCharge": number,
    "teleopCharge": number,
    "cycle": number,
    "lowCubes": number,
    "lowCones": number,
    "midCubes": number,
    "midCones": number,
    "highCubes": number,
    "highCones": number,
    "lowPcs": number,
    "midPcs": number,
    "highPcs": number,
    "cubes": number,
    "cones": number,
    "grid": number,
    "weight": number
}
type eventWt = { "match_num": number, "game": string, "weight": string }
type chartJsDataset = { "label": string, "data": Array<number>, "fill": boolean, "borderColor": string, "tension": number }
type chartJsData = { "labels": Array<string>, "datasets": Array<chartJsDataset> }
type chartJsOptions = { "indexAxis": string, "responsive": boolean, "scales": {"y": {"min": number, "max": number}}, "plugins": {"title": {"display": boolean, "text": string}}}
type chartJsChart = { "type": string, "data": chartJsData, "options": chartJsOptions }
declare class Chart { constructor(a: any, b: any); }

function createChartDataset(label: string, backgroundColor: string, data: Array<number>): chartJsDataset {
    return { "label": label, "data": data, "fill": true, "borderColor": backgroundColor, "tension": 0.1 }
}

function createChartData(labels: Array<string>, datasets: Array<chartJsDataset>): chartJsData {
    return { "labels": labels, "datasets": datasets }
}

function createChartConfig(type: string, data: chartJsData, name: string, max: number): chartJsChart {
    return { "type": type, "data": data, "options": { "indexAxis": "x", "responsive": true, "scales": { "y": { "min": 0, "max": max } }, "plugins": {"title": { "display": true, "text": name } } } };
}

function setNoResults(): void {
    (document.getElementById("error") as HTMLSpanElement).innerHTML = "&emsp;no results";
    (document.getElementById("error") as HTMLSpanElement).style.display = "unset";
}

async function constructGraphs(): Promise<void> {
    var teamGraph: Array<eventWt>,
        completeMatches = [],
        processedMatches: Array<match> = [],
        chartLabels = [];

    try {
        const response = await fetch(`/api/v1/data/brief/team/${new Date().getFullYear()}/${(document.getElementById("eventCode") as HTMLInputElement).value}/${(document.getElementById("teamNum") as HTMLInputElement).value}`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 204 || !response.ok) setNoResults();
        teamGraph = await response.json();
        teamGraph.forEach((matchData) => {
            if (completeMatches.includes(matchData.match_num)) {} else {
                completeMatches.push(matchData.match_num);
                const game_data = matchData.game.split(",");
                processedMatches.push({
                    "match_num": matchData.match_num,
                    "autoCharge": Number(game_data[4]),
                    "teleopCharge": Number(game_data[9]),
                    "cycle": Number(game_data[10]),
                    "lowCubes": Number(game_data[20]),
                    "lowCones": Number(game_data[12]),
                    "midCubes": Number(game_data[13]),
                    "midCones": Number(game_data[14]),
                    "highCubes": Number(game_data[15]),
                    "highCones": Number(game_data[16]),
                    "lowPcs": Number(game_data[17]),
                    "midPcs": Number(game_data[18]),
                    "highPcs": Number(game_data[19]),
                    "cubes": Number(game_data[21]),
                    "cones": Number(game_data[23]),
                    "grid": Number(game_data[24]),
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
        }

        processedMatches.sort((a, b) => a.match_num - b.match_num);
        processedMatches.forEach((matchData) => {
            chartLabels.push(String(matchData.match_num));
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

        const weightChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("PERFORMANCE SCORE", "#8ec07c", allMatches.weight)]), "Match Performance Score", 160);
        const gridPtsChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("GRID POINTS", "#8ec07c", allMatches.grid)]), "Grid Points", 160);
        const allConeCubeChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("CONES", "#ff0", allMatches.cones), createChartDataset("CUBES", "#a216a2", allMatches.cubes)]), "Cones & Cubes", 18);
        const chargeChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("AUTO", "#b8bb26", allMatches.autoCharge), createChartDataset("TELEOP", "#83a598", allMatches.teleopCharge)]), "Auto & Teleop Charging", 14);
        const cycleTimeChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("CYCLE TIME", "#8ec07c", allMatches.cycle)]), "Cycle Time", 120);
        const allLevelsChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("LOW", "#b8bb26", allMatches.lowPcs), createChartDataset("MID", "#fabd2f", allMatches.midPcs), createChartDataset("HIGH", "#83a598", allMatches.highPcs)]), "Scoring Levels", 10);
        const lowConeCubeChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("CONES", "#ff0", allMatches.lowCones), createChartDataset("CUBES", "#a216a2", allMatches.lowCubes)]), "Low Cones & Cubes", 10);
        const midConeCubeChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("CONES", "#ff0", allMatches.midCones), createChartDataset("CUBES", "#a216a2", allMatches.midCubes)]), "Mid Cones & Cubes", 10);
        const highConeCubeChartCfg = createChartConfig("line", createChartData(chartLabels, [createChartDataset("CONES", "#ff0", allMatches.highCones), createChartDataset("CUBES", "#a216a2", allMatches.highCubes)]), "High Cones & Cubes", 10);

        const weightChart = new Chart(document.getElementById("weightChart"), weightChartCfg);
        const gridPtsChart = new Chart(document.getElementById("gridPtsChart"), gridPtsChartCfg);
        const allConeCubeChart = new Chart(document.getElementById("allConeCubeChart"), allConeCubeChartCfg);
        const chargeChart = new Chart(document.getElementById("chargeChart"), chargeChartCfg);
        const cycleTimeChart = new Chart(document.getElementById("cycleTimeChart"), cycleTimeChartCfg);
        const allLevelsChart = new Chart(document.getElementById("allLevelsChart"), allLevelsChartCfg);
        const lowConeCubeChart = new Chart(document.getElementById("lowConeCubeChart"), lowConeCubeChartCfg);
        const midConeCubeChart = new Chart(document.getElementById("midConeCubeChart"), midConeCubeChartCfg);
        const highConeCubeChart = new Chart(document.getElementById("highConeCubeChart"), highConeCubeChartCfg);

        (document.getElementById("teamAtEvent") as HTMLHeadingElement).innerText = (document.getElementById("teamNum") as HTMLInputElement).value;
        (document.getElementById("search") as HTMLDivElement).style.display = "none";
        (document.getElementById("results") as HTMLDivElement).style.display = "flex";
    } catch (err: any) {
        setNoResults();
    }
}