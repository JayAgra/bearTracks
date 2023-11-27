import { _get } from "../_modules/get/get.min.js"
import { _post } from "../_modules/post/post.min.js"

//data validation
type frcApiTeam = { "station": string, "surrogate": boolean, "teamNumber": number }
type frcApiMatch = { "description": string, "field": string, "matchNumber": number, "startTime": string, "teams": Array<frcApiTeam>, "tournamentLevel": string }
type frcApiMatches = { "Schedule": Array<frcApiMatch> }

var eventMatches: frcApiMatches;
var matchesOk: boolean = false;

function setBadEvent() {
    (document.getElementById("badEvent") as HTMLSpanElement).innerHTML = "&emsp;no results";
    (document.getElementById("badEvent") as HTMLSpanElement).style.display = "unset";
    matchesOk = false;
}

function toLogin(response: Response): void {
    if (response.status === 401 || response.status === 403) window.location.href = "/login";
}

async function loadMatches(): Promise<string | void> {
    try {
        const response = await fetch(`/api/v1/events/matches/2023/${(document.getElementById("eventCode") as HTMLInputElement).value}/qual/all`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });

        toLogin(response);

        if (response.status === 204 || !response.ok) {
            return setBadEvent();
        }

        eventMatches = await response.json();
        matchesOk = true;
        (document.getElementById("badEvent") as HTMLSpanElement).style.display = "none";
        matchNumberChange({"target": document.getElementById("matchNumberInput")});
    } catch (err: any) {
        setBadEvent();
    }
}

// check session
async function checkLogin(): Promise<void> {
    _get(`/api/v1/whoami`, null).then((response: any) => {console.log(response)}).catch((err) => console.log(err));
}
(window as any).checkLogin = checkLogin;

loadMatches();
validateLengthFn();

document.getElementById("eventCode").addEventListener("change", async (): Promise<void> => {
    await loadMatches();
});

function setOption(element: HTMLOptionElement, value: number) {
    element.value = String(value);
    element.innerText = String(value);
}

function matchNumberChange(event: any) {
    if (matchesOk) {
        const errorElement = document.getElementById("badMatchNum") as HTMLSpanElement;
        if (Number((event.target as HTMLInputElement).value) > 0 && Number((event.target as HTMLInputElement).value) <= eventMatches.Schedule.length) {
            errorElement.style.display = "none";
            (document.getElementById("submitButton") as HTMLButtonElement).removeAttribute("disabled");
            const matchTeams: Array<frcApiTeam> = eventMatches.Schedule[Number((event.target as HTMLInputElement).value) - 1].teams;
            const teamSelectOpts: Array<HTMLOptionElement> = Array.from(document.getElementsByClassName("teamNumOption")) as Array<HTMLOptionElement>;
            setOption(teamSelectOpts[3], matchTeams[0].teamNumber);
            setOption(teamSelectOpts[4], matchTeams[1].teamNumber);
            setOption(teamSelectOpts[5], matchTeams[2].teamNumber);
            setOption(teamSelectOpts[0], matchTeams[3].teamNumber);
            setOption(teamSelectOpts[1], matchTeams[4].teamNumber);
            setOption(teamSelectOpts[2], matchTeams[5].teamNumber);
        } else {
            errorElement.innerHTML = "&emsp;match number must be between 1 and " + eventMatches.Schedule.length;
            errorElement.style.display = "unset";
            (document.getElementById("submitButton") as HTMLButtonElement).setAttribute("disabled", "disabled");
        }
    } else {
        window.setTimeout((event: any) => { matchNumberChange(event) }, 1000);
        (document.getElementById("submitButton") as HTMLButtonElement).setAttribute("disabled", "disabled");
    }
}

document.getElementById("matchNumberInput").addEventListener("input", (event: any): void => { matchNumberChange(event); });

function validateLengthFn() {
    let currentVal: string = (document.getElementById("validateLength") as HTMLInputElement).value;
    if (Number(currentVal) <= 120 && Number(currentVal) >= 0) {
        document.getElementById("tooLong").style.display = "none";
        (document.getElementById("submitButton") as HTMLButtonElement).removeAttribute("disabled");
    } else {
        document.getElementById("tooLong").style.display = "inherit";
    }
}

document.getElementById("validateLength").addEventListener("input", (): void => { validateLengthFn(); });

function requiredFormFields(event: any) {
    if (String((event.target as HTMLInputElement).value).length > 0) {
        (document.getElementById("submitButton") as HTMLButtonElement).removeAttribute("disabled");
    }
}

Array.from(document.querySelectorAll("[required]")).forEach((element) => {
    element.addEventListener("input", (event: any): void => { requiredFormFields(event); })
})
//end data validation

function landscapeReminder() {
    if (window.innerHeight > window.innerWidth) {
        document.getElementById("landscapeReminder").style.display = "inline";
    } else {
        document.getElementById("landscapeReminder").style.display = "none";
    }
}
window.addEventListener("resize", landscapeReminder);

function checkFormState(): boolean {
    Array.from(document.querySelectorAll("[required]")).forEach((element) => {
        if ((element as HTMLInputElement).value.length <= 0) {
            (document.getElementById("submitButton") as HTMLButtonElement).setAttribute("disabled", "disabled");
            return false;
        }
    });
    const currentVal = (document.getElementById("validateLength") as HTMLInputElement);
    if (Number(currentVal) > 120 && Number(currentVal) < 0) {
        (document.getElementById("submitButton") as HTMLButtonElement).setAttribute("disabled", "disabled");
        return false;
    }
    if ((document.getElementById("teamNumber") as HTMLInputElement).value === "") {
        (document.getElementById("submitButton") as HTMLButtonElement).setAttribute("disabled", "disabled");
        return false;
    }
    return true;
}
(window as any).checkFormState = checkFormState;
setInterval(checkFormState, 2000);

//grid script
function getAllCells(): Array<HTMLElement> {
    var cells: Array<HTMLElement> = [];
    for (let j = 3; j > 0; j--) {
        for (let i = 9; i > 0; i--) {
            document.getElementsByClassName("sg")[0].insertAdjacentHTML("afterbegin", `<div class="sg-c" data-coop="${Math.floor((i - 1) / 3) === 1}" data-num="${26 - cells.length}" id="sgc_${j}_${i}" data-state="0" data-gp="${j === 3 ? "h" : ((i + 1) % 3) === 0 ? "cube" : "cone"}"></div>`);
            cells.push(document.getElementById("sgc_" + j + "_" + i) as HTMLElement);
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
    (document.getElementById("griddata") as HTMLInputElement).value = sgCellStatus.join("");
    console.log((document.getElementById("griddata") as HTMLInputElement).value);
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
function setThat(that: HTMLElement, backgroundHex: string, textContent: string, stateAttr: string, value: number, color: string) {
    that.style.background = backgroundHex;
    that.style.color = color;
    that.innerText = textContent;
    that.setAttribute("data-state", stateAttr);
    processCellClick(that.getAttribute("data-num"), value)
}
function setSingleCube(that: HTMLElement): void {
    setThat(that, "#a216a2", "", "1", 1, "#ff0");
}
function setSingleCone(that: HTMLElement): void {
    setThat(that, "#ff0", "", "2", 2, "#a216a2");
}
function setDoubleCube(that: HTMLElement): void {
    setThat(that, "#a216a2", "2", "3", 3, "#ff0");
}
function setDoubleCone(that: HTMLElement): void {
    setThat(that, "#ff0", "2", "5", 4, "#a216a2");
}

for (var i = 0; i < allCells.length; i += 1) {
    allCells[i].addEventListener("click", function(): void {
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

function mainFormError(error: any) {
    (document.getElementById("submitText_d") as HTMLHeadingElement).innerText = "ERROR!!!";
    (document.getElementById("submitProgress_d") as HTMLProgressElement).value = 0;
    (document.getElementById("reSubmitButton") as HTMLButtonElement).style.display = "unset";
    console.error(error);
}

async function uploadForm() {
    if (!checkFormState()) {
        alert("there are issues with your form");
        return;
    }
    const responses = {
        "season": 2023,
        "event": (document.getElementsByName("event")[0] as HTMLInputElement).value,
        "match_num": Number((document.getElementsByName("match")[0] as HTMLInputElement).value),
        "level": (document.getElementsByName("level")[0] as HTMLInputElement).value,
        "team": Number((document.getElementsByName("team")[0] as HTMLInputElement).value),
        "game": [
            (document.getElementsByName("game1")[0] as HTMLInputElement).value,
            (document.getElementsByName("game2")[0] as HTMLInputElement).value,
            (document.getElementsByName("game3")[0] as HTMLInputElement).value,
            (document.getElementsByName("game4")[0] as HTMLInputElement).value,
            (document.getElementsByName("game5")[0] as HTMLInputElement).value,
            (document.getElementsByName("game6")[0] as HTMLInputElement).value,
            (document.getElementsByName("game7")[0] as HTMLInputElement).value,
            (document.getElementsByName("game8")[0] as HTMLInputElement).value,
            (document.getElementsByName("game9")[0] as HTMLInputElement).value,
            (document.getElementsByName("game10")[0] as HTMLInputElement).value,
            (document.getElementsByName("game11")[0] as HTMLInputElement).value,
            (document.getElementsByName("game12")[0] as HTMLInputElement).value,
            (document.getElementsByName("game13")[0] as HTMLInputElement).value,
            (document.getElementsByName("game14")[0] as HTMLInputElement).value,
            (document.getElementsByName("game15")[0] as HTMLInputElement).value,
            (document.getElementsByName("game16")[0] as HTMLInputElement).value,
            (document.getElementsByName("game17")[0] as HTMLInputElement).value,
            (document.getElementsByName("game18")[0] as HTMLInputElement).value,
            (document.getElementsByName("game19")[0] as HTMLInputElement).value,
            (document.getElementsByName("game20")[0] as HTMLInputElement).value,
            (document.getElementsByName("game21")[0] as HTMLInputElement).value,
            (document.getElementsByName("game22")[0] as HTMLInputElement).value,
            (document.getElementsByName("game23")[0] as HTMLInputElement).value,
            (document.getElementsByName("game24")[0] as HTMLInputElement).value,
            (document.getElementsByName("game25")[0] as HTMLInputElement).value,            
        ].join(","),
        "defend": (document.getElementsByName("defend")[0] as HTMLInputElement).value,
        "driving": (document.getElementsByName("driving")[0] as HTMLInputElement).value,
        "overall": (document.getElementsByName("overall")[0] as HTMLInputElement).value,
    }

    type response = { "id": number; }

    (document.getElementById("mainFormHTML") as HTMLFormElement).style.display = "none";
    (document.getElementById("submitUi") as HTMLDivElement).style.display = "unset";
    (document.getElementById("reSubmitButton") as HTMLButtonElement).style.display = "none";
    const   submitText_d = document.getElementById("submitText_d") as HTMLHeadingElement,
            submitProgress_d = document.getElementById("submitProgress_d") as HTMLProgressElement;
    await new Promise((res) => setTimeout(res, 250));
    _post("/api/v1/data/submit", submitText_d.id, responses).then(async (res: response) => {
        console.log(res.id);
        submitText_d.innerText = "Verifying...";
        await new Promise((res) => setTimeout(res, 250));
        _get(`/api/v1/data/exists/${res.id}`, document.getElementById("submitText_d").id).then(async (checkRemote: any) => {
            if (checkRemote[0].Exists.team == responses.team && checkRemote[0].Exists.match_num == responses.match_num) {
                submitText_d.innerText = "Done!";
                submitProgress_d.value = 100;
                submitProgress_d.max = 100;
                await new Promise((res) => setTimeout(res, 1500));
                window.location.href = "/";
            } else {
                mainFormError("data mismatch");
            }
        }).catch((error: any) => {
            mainFormError(error);
        })
    }).catch((error: any) => {
        mainFormError(error);
    });
}

(window as any).uploadForm = uploadForm;