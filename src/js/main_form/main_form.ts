//data validation
var allTeams: Array<number> = [];

async function getEventTeams(): Promise<void> {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/events/current/${(document.getElementById('eventCode') as HTMLInputElement).value}/teams`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            allTeams = (xhr.responseText).split(",").map((e) => Number(e));
        } else if (xhr.status === 401) {
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            document.getElementById("viewNoteButton").innerHTML = "bad request";
        } else if (xhr.status === 500) {
            document.getElementById("viewNoteButton").innerHTML = "internal server error";
        } else if (xhr.status === 403) {
            document.getElementById("viewNoteButton").innerHTML = "access denied";
        } else {
            console.log("awaiting response")
        }
    }

    xhr.send()
}

// check session
async function checkLogin(): Promise<void> {
    try {
        var response = await fetch(`/api/whoami`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
    } catch (error) {
        console.log("failure")
        window.location.href = "/login";
    }
}

getEventTeams()

document.getElementById('eventCode').addEventListener('change', async function(): Promise<void> {
    console.log(getEventTeams()); console.log(allTeams)
});

document.getElementById('validateTeamInput').addEventListener('input', function(): void {
    console.log("event!")
    if (allTeams.includes(Number((document.getElementById('validateTeamInput') as HTMLInputElement).value))) {
        document.getElementById('invalidTeamInput').style.display = "none";
        (document.getElementById('submitButton') as HTMLButtonElement).removeAttribute("disabled");
    } else {
        document.getElementById('invalidTeamInput').style.display = "inherit";
        (document.getElementById('submitButton') as HTMLButtonElement).setAttribute("disabled", "disabled");
    }
});

document.getElementById('validateLength').addEventListener('input', (): void => {
    let currentVal: string = (document.getElementById("validateLength") as HTMLInputElement).value;
    if (Number(currentVal) <= 120 && Number(currentVal) >= 0) {
        document.getElementById('tooLong').style.display = "none";
        (document.getElementById("submitButton") as HTMLButtonElement).removeAttribute("disabled");
    } else {
        document.getElementById('tooLong').style.display = "inherit";
        (document.getElementById('submitButton') as HTMLButtonElement).setAttribute("disabled", "disabled");
    }
});
//end data validation

//grid orientation reminder
if (window.innerHeight > window.innerWidth) {
    document.getElementById('landscapeReminder').style.display = "inline";
}

window.addEventListener('resize', function(): void {
    if(window.innerHeight > window.innerWidth){
        document.getElementById('landscapeReminder').style.display = "inline";
    } else {
        document.getElementById('landscapeReminder').style.display = "none";
    }
});
//end grid orientation reminder

//grid script
function getAllCells(): Array<HTMLElement> {
    var cells: Array<HTMLElement> = [];
    for(let j = 1; j < 4; j++) {
        for(let i = 1; i < 10; i++) {
            cells.push(document.getElementById('sgc_' + j + '_' + i) as HTMLElement);
        }
    }
    return cells;
}
var sgCellStatus: Array<number> = [
    0, 0, 0,  0, 0, 0,  0, 0, 0,
    0, 0, 0,  0, 0, 0,  0, 0, 0,
    0, 0, 0,  0, 0, 0,  0, 0, 0
];
const allCells = getAllCells();
function processCellClick(dataNum, numset): void {
    sgCellStatus[Number(dataNum)] = numset;
    (document.getElementById('griddata') as HTMLInputElement).value = sgCellStatus.join('');
    console.log((document.getElementById('griddata') as HTMLInputElement).value);
}
function setGray(that: HTMLElement): void {
    that.innerText = "";
    if (that.getAttribute("data-coop") == "true") {
        that.style.background = "#bbb";
    } else {
        that.style.background = "#ddd";
    }
    that.setAttribute("data-state", "0")
    processCellClick(that.getAttribute("data-num"), 0);
}
function setSingleCube(that: HTMLElement): void {
    that.style.background = "#a216a2";
    that.innerText = "";
    that.setAttribute("data-state", "1")
    processCellClick(that.getAttribute("data-num"), 1);
}
function setSingleCone(that: HTMLElement): void {
    that.style.background = "#ff0";
    that.innerText = "";
    that.setAttribute("data-state", "2")
    processCellClick(that.getAttribute("data-num"), 2);
}
function setDoubleCube(that: HTMLElement): void {
    that.style.background = "#a216a2";
    that.style.color = "#ff0";
    that.innerText = "2";
    that.setAttribute("data-state", "3")
    processCellClick(that.getAttribute("data-num"), 3);
}
function setDoubleCone(that: HTMLElement): void {
    that.style.background = "#ff0";
    that.style.color = "#a216a2";
    that.innerText = "2";
    that.setAttribute("data-state", "5")
    processCellClick(that.getAttribute("data-num"), 4);
}
for (var i = 0; i < allCells.length; i += 1) {
    allCells[i].addEventListener('click', function (): void {
        if (this.getAttribute("data-gp") === "cube") {
            if (this.getAttribute("data-state") === "0") {
                setSingleCube(this);
            } else if (this.getAttribute("data-state") === "1") {
                setDoubleCube(this);
            } else {
                setGray(this);
            }
        } else if (this.getAttribute("data-gp") === "cone") {
            if (this.getAttribute("data-state") === "0") {
                setSingleCone(this);
            } else if (this.getAttribute("data-state") === "2") {
                setDoubleCone(this);
            } else {
                setGray(this);
            }
        } else if (this.getAttribute("data-gp") === "h") {
            if (this.getAttribute("data-state") === "1") {
                setSingleCone(this);
            } else if (this.getAttribute("data-state") === "0") {
                setSingleCube(this);
            } else if (this.getAttribute("data-state") === "3") {
                setDoubleCone(this);
            } else if (this.getAttribute("data-state") === "2") {
                setDoubleCube(this);
            } else {
                setGray(this);
            }
        }
    });
}

async function post(url: string, data: object) {
    const response = await fetch(url, {
        method: "POST",
        cache: "no-cache",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(data),
    });
    return response.json();
}

async function uploadForm() {
    const responses = {
        "event": (document.getElementsByName("event")[0] as HTMLInputElement).value,
        "match": Number((document.getElementsByName("match")[0] as HTMLInputElement).value),
        "level": (document.getElementsByName("level")[0] as HTMLInputElement).value,
        "team": Number((document.getElementsByName("team")[0] as HTMLInputElement).value),
        "game1": (document.getElementsByName("game1")[0] as HTMLInputElement).value,
        "game2": (document.getElementsByName("game2")[0] as HTMLInputElement).value,
        "game3": (document.getElementsByName("game3")[0] as HTMLInputElement).value,
        "game4": (document.getElementsByName("game4")[0] as HTMLInputElement).value,
        "game5": (document.getElementsByName("game5")[0] as HTMLInputElement).value,
        "game6": (document.getElementsByName("game6")[0] as HTMLInputElement).value,
        "game7": (document.getElementsByName("game7")[0] as HTMLInputElement).value,
        "game8": (document.getElementsByName("game8")[0] as HTMLInputElement).value,
        "game9": (document.getElementsByName("game9")[0] as HTMLInputElement).value,
        "game10": Number((document.getElementsByName("game10")[0] as HTMLInputElement).value),
        "game11": (document.getElementsByName("game11")[0] as HTMLInputElement).value,
        "game12": (document.getElementsByName("game12")[0] as HTMLInputElement).value,
        "game13": Number((document.getElementsByName("game13")[0] as HTMLInputElement).value),
        "game14": Number((document.getElementsByName("game14")[0] as HTMLInputElement).value),
        "game15": Number((document.getElementsByName("game15")[0] as HTMLInputElement).value),
        "game16": Number((document.getElementsByName("game16")[0] as HTMLInputElement).value),
        "game17": Number((document.getElementsByName("game17")[0] as HTMLInputElement).value),
        "game18": Number((document.getElementsByName("game18")[0] as HTMLInputElement).value),
        "game19": Number((document.getElementsByName("game19")[0] as HTMLInputElement).value),
        "game20": Number((document.getElementsByName("game20")[0] as HTMLInputElement).value),
        "game21": Number((document.getElementsByName("game21")[0] as HTMLInputElement).value),
        "game22": Number((document.getElementsByName("game22")[0] as HTMLInputElement).value),
        "game23": Number((document.getElementsByName("game23")[0] as HTMLInputElement).value),
        "game24": Number((document.getElementsByName("game24")[0] as HTMLInputElement).value),
        "game25": Number((document.getElementsByName("game25")[0] as HTMLInputElement).value),
        "defend": (document.getElementsByName("defend")[0] as HTMLInputElement).value,
        "driving": (document.getElementsByName("driving")[0] as HTMLInputElement).value,
        "overall": (document.getElementsByName("overall")[0] as HTMLInputElement).value,
    }

    type response = {
        "id": number;
    }
    
    (document.getElementById("mainFormHTML") as HTMLFormElement).style.display = "none";
    (document.getElementById("submitUi") as HTMLDivElement).style.display = "unset";
    (document.getElementById("reSubmitButton") as HTMLButtonElement).style.display = "none";

    post("/submit", responses).then(async (response: object) => {
        const r = response as unknown as response;
        console.log(r.id);
        (document.getElementById("submitText_d") as HTMLHeadingElement).innerText = "Verifying...";
        try {
            const verifyResp = await fetch(`/api/data/exists/${r.id}`, {
                method: "GET",
                cache: "no-cache",
                credentials: "include",
                redirect: "follow",
            });

            if (verifyResp.status === 401 || verifyResp.status === 403) {
                window.location.href = "/login";
            }

            const checkRemote = await verifyResp.json();
            if (checkRemote.team == responses.team && checkRemote.match == responses.match) {
                (document.getElementById("submitText_d") as HTMLHeadingElement).innerText = "Done!";
                (document.getElementById("submitProgress_d") as HTMLProgressElement).value = 100;
                (document.getElementById("submitProgress_d") as HTMLProgressElement).max = 100;
                await new Promise((res) => setTimeout(res, 1500));
                window.location.href = "/";
            } else {
                (document.getElementById("submitText_d") as HTMLHeadingElement).innerText = "Possible Error";
                (document.getElementById("submitProgress_d") as HTMLProgressElement).value = 0;
                (document.getElementById("reSubmitButton") as HTMLButtonElement).style.display = "unset";
            }
        } catch (err: any) {
            console.log("failure");
            window.location.href = "/login";
        }
    }).catch((error: any) => {
        (document.getElementById("submitText_d") as HTMLHeadingElement).innerText = "ERROR!!!";
        (document.getElementById("submitProgress_d") as HTMLProgressElement).value = 0;
        (document.getElementById("reSubmitButton") as HTMLButtonElement).style.display = "unset";
        console.error(error);
    });
}