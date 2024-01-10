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


var up_arrows: Array<HTMLDivElement> = Array.from(document.getElementsByClassName("sg-c up")) as Array<HTMLDivElement>;
var count_cells: Array<HTMLDivElement> = Array.from(document.getElementsByClassName("sg-c counter")) as Array<HTMLDivElement>;
var down_arrows: Array<HTMLDivElement> = Array.from(document.getElementsByClassName("sg-c down")) as Array<HTMLDivElement>;
var values = [0, 0, 0];

up_arrows.forEach((arrow: HTMLDivElement) => {
    arrow.addEventListener("click", (e: MouseEvent) => {
        up_arrow_click(e)
    });
});

down_arrows.forEach((arrow: HTMLDivElement) => {
    arrow.addEventListener("click", (e: MouseEvent) => {
        down_arrow_click(e);
    });
});

function up_arrow_click(e: MouseEvent) {
    let ind: number = Number((e.target as HTMLDivElement).id.substring(3));
    values[ind]++;
    ((count_cells[ind].firstChild) as HTMLSpanElement).innerText = String(values[ind]);
}

function down_arrow_click(e: MouseEvent) {
    let ind: number = Number((e.target as HTMLDivElement).id.substring(3));
    if (values[ind] > 0) values[ind]--;
    ((count_cells[ind].firstChild) as HTMLSpanElement).innerText = String(values[ind]);
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
        "season": 2024,
        "event": (document.getElementsByName("event")[0] as HTMLInputElement).value,
        "match_num": Number((document.getElementsByName("match")[0] as HTMLInputElement).value),
        "level": (document.getElementsByName("level")[0] as HTMLInputElement).value,
        "team": Number((document.getElementsByName("team")[0] as HTMLInputElement).value),
        "game": [
            (document.getElementsByName("game1")[0] as HTMLInputElement).value, // LEAVE
            (document.getElementsByName("game2")[0] as HTMLInputElement).value, // AMP AUTO
            (document.getElementsByName("game3")[0] as HTMLInputElement).value, // SPEAKER AUTO
            values[0], // AMP
            values[1], // SPEAKER
            values[2], // AMPLIFIED SPEAKER
            (document.getElementsByName("game7")[0] as HTMLInputElement).value, // CYCLE TIME
            (document.getElementsByName("game8")[0] as HTMLInputElement).value, // PARKED
            (document.getElementsByName("game9")[0] as HTMLInputElement).value, // ONSTAGE
            (document.getElementsByName("game10")[0] as HTMLInputElement).value, // SPOTLIT
            (document.getElementsByName("game11")[0] as HTMLInputElement).value, // HARMONY
            (document.getElementsByName("game12")[0] as HTMLInputElement).value, // NOTE IN TRAP
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