import { _get } from "../_modules/get/get.min.js";
import { _post } from "../_modules/post/post.min.js";

// get events
const API_META = "/api/v1/data";
const API_MATCHES = ["/api/v1/events/matches/", /* season */ "/", /* event */ "/qual/true"];
const API_WHOAMI = "/api/v1/whoami";
const API_SUBMIT = "/api/v1/data/submit";

var match_schedule;

function getEventCookie() {
    var cookieString = RegExp("92bdcf1af0a0a23d" + "=[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookieString ? cookieString.toString().replace(/^[^=]+./, "") : "");
}

async function init() {
    if (getEventCookie() == "") {
        document.cookie = `92bdcf1af0a0a23d=CAFR; expires=Fri, 31 Dec 9999 23:59:59 GMT; Secure; SameSite=Lax`;
    }

    (document.getElementById("selected_event_code") as HTMLSpanElement).innerText = getEventCookie();

    _get(API_WHOAMI, null).then((result) => {
        console.info(result)
    }).catch((error) => {
        console.error(error)
        window.location.href = "/login"
    })

    await load_matches(getEventCookie());

    (document.getElementById("match_num_input") as HTMLSelectElement).addEventListener("change", () => {
        match_num_entry((document.getElementById("match_num_input") as HTMLSelectElement).value);
    });
}

function load_matches(event: String = "CAFR") {
    (document.getElementsByClassName("continue_button")![0] as HTMLButtonElement).disabled = true;
    _get(API_MATCHES[0] + "2024" + API_MATCHES[1] + event + API_MATCHES[2], null).then((result) => {
        if (result.Schedule.length != 0) {
            match_schedule = result.Schedule;
            (document.getElementById("match_num_input") as HTMLSelectElement).innerHTML = ""
            result.Schedule.forEach(match => {
                (document.getElementById("match_num_input") as HTMLSelectElement).insertAdjacentHTML("beforeend", `<option value="${match.matchNumber}">${match.matchNumber}</option>`);
            });
            match_num_entry("1");
            (document.getElementById("match_num_input") as HTMLSelectElement).value = "";
            (document.getElementById("team_number") as HTMLSelectElement).value = "";
        } else {
            alert("match schedule is not yet posted");
            (document.getElementById("match_num_input") as HTMLSelectElement).innerHTML = ""
        }
    }).catch((error) => {
        alert("match schedule is not yet posted");
        (document.getElementById("match_num_input") as HTMLSelectElement).innerHTML = ""
    })
}

function set_option(element: HTMLOptionElement, value: string) {
    element.innerText = value;
    element.value = value;
}

(document.getElementById("team_number") as HTMLSelectElement).onchange = () => {
    if ((document.getElementById("team_number") as HTMLSelectElement).value == "") {
        (document.getElementsByClassName("continue_button")![0] as HTMLButtonElement).disabled = true;
    } else {
        (document.getElementsByClassName("continue_button")![0] as HTMLButtonElement).disabled = false;
    }
}

function match_num_entry(entry: String) {
    let entry_num = Number(entry);
    let select_elements: HTMLCollectionOf<HTMLOptionElement> = document.getElementsByClassName("teamNumOption") as HTMLCollectionOf<HTMLOptionElement>;
    set_option(select_elements[3], match_schedule[entry_num - 1].teams[0].teamNumber);
    set_option(select_elements[4], match_schedule[entry_num - 1].teams[1].teamNumber);
    set_option(select_elements[5], match_schedule[entry_num - 1].teams[2].teamNumber);
    set_option(select_elements[0], match_schedule[entry_num - 1].teams[3].teamNumber);
    set_option(select_elements[1], match_schedule[entry_num - 1].teams[4].teamNumber);
    set_option(select_elements[2], match_schedule[entry_num - 1].teams[5].teamNumber);   
}

document.body.onload = init

var timer_buttons = Array.from(document.getElementsByClassName("time_button")) as Array<HTMLButtonElement>;
var timer_displays = Array.from(document.getElementsByClassName("counter")) as Array<HTMLHeadingElement>;
var timer_id: Array<number> = [0, 0, 0];
var timer_times: Array<number> = [0, 0, 0];

function start_timer(button: number) {
    timer_id[button]= setInterval(() => {
        timer_times[button] += 0.1;
        timer_displays[button].innerText = String(Math.round(timer_times[button] * 10) / 10);
    }, 100)
}

function stop_timer(button: number) {
    clearInterval(timer_id[button])
}

timer_buttons[0].addEventListener("mousedown", () => { start_timer(0); })
timer_buttons[0].addEventListener("mouseup", () => { stop_timer(0); });
timer_buttons[0].addEventListener("touchstart", () => { start_timer(0); })
timer_buttons[0].addEventListener("touchend", () => { stop_timer(0); })

timer_buttons[1].addEventListener("mousedown", () => { start_timer(1); })
timer_buttons[1].addEventListener("mouseup", () => { stop_timer(1); });
timer_buttons[1].addEventListener("touchstart", () => { start_timer(1); })
timer_buttons[1].addEventListener("touchend", () => { stop_timer(1); })

timer_buttons[2].addEventListener("mousedown", () => { start_timer(2); })
timer_buttons[2].addEventListener("mouseup", () => { stop_timer(2); });
timer_buttons[2].addEventListener("touchstart", () => { start_timer(2); })
timer_buttons[2].addEventListener("touchend", () => { stop_timer(2); })

document.addEventListener("mouseup", () => { stop_timer(0); stop_timer(1); stop_timer(2); })
document.addEventListener("touchend", () => { stop_timer(0); stop_timer(1); stop_timer(2); })

var cycle_buttons = Array.from(document.getElementsByClassName("cycle_button")) as Array<HTMLButtonElement>;
var cycle_data: Array<any> = []

function end_cycle(type: number) {
    if (timer_times[0] != 0 || timer_times[1] != 0 || timer_times[2] != 0) {
        cycle_data.push({
            id: cycle_data.length,
            score_type: type, // 0 for speaker, 1 for amplifier, 2 for trap, 3 for climb, 4 for buddy
            intake: Math.round(timer_times[0] * 10) / 10,
            travel: Math.round(timer_times[1] * 10) / 10,
            outtake: Math.round(timer_times[2] * 10) / 10,
        });
        timer_times = [0, 0, 0]
        timer_displays.forEach((display) => { display.innerText = "0" })
    }
    console.log(cycle_data)
}

cycle_buttons[0].addEventListener("click", () => { end_cycle(0) });
cycle_buttons[1].addEventListener("click", () => { end_cycle(1) });
cycle_buttons[2].addEventListener("click", () => { end_cycle(9) });

(document.querySelector("[name=defense]") as HTMLTextAreaElement).onchange = check_responses;
(document.querySelector("[name=driving]") as HTMLTextAreaElement).onchange = check_responses;
(document.querySelector("[name=overall]") as HTMLTextAreaElement).onchange = check_responses;

function check_responses() {
    if (
        (document.querySelector("[name=defense]") as HTMLTextAreaElement).value.length > 0 &&
        (document.querySelector("[name=driving]") as HTMLTextAreaElement).value.length > 0 &&
        (document.querySelector("[name=overall]") as HTMLTextAreaElement).value.length > 0
    ) {
        (document.getElementsByClassName("continue_button")![2] as HTMLButtonElement).disabled = false
    } else {
        (document.getElementsByClassName("continue_button")![2] as HTMLButtonElement).disabled = true
    }
}

function submit() {
    if (
        (document.querySelector("[name=defense]") as HTMLTextAreaElement).value
            .length == 0 ||
        (document.querySelector("[name=driving]") as HTMLTextAreaElement).value
            .length == 0 ||
        (document.querySelector("[name=overall]") as HTMLTextAreaElement).value
            .length == 0 ||
        match_schedule.length == 0 ||
        (document.getElementById("match_num_input") as HTMLSelectElement).value.length == 0 ||
        (document.getElementById("team_number") as HTMLSelectElement).value.length == 0
    ) {
        return;
    }
    (document.getElementById("form_content") as HTMLFormElement).style.display = "none";
    (document.getElementById("submit_page") as HTMLFormElement).style.display = "block";
    var submit_text = document.getElementById("submit_text") as HTMLHeadingElement,
        submit_progress = document.getElementById("submit_progress") as HTMLProgressElement,
        continue_button = document.getElementById("scout_again") as HTMLButtonElement,
        success_seal = document.getElementById("success_seal") as HTMLImageElement,
        failure_seal = document.getElementById("failure_seal") as HTMLImageElement;
    
    submit_text.innerText = "Submitting...";

    cycle_data.push({ id: cycle_data.length, score_type: 2, intake: Number((document.querySelector("[name=trap_note]") as HTMLInputElement).checked), travel: Number((document.querySelector("[name=trap_note]") as HTMLInputElement).checked), outtake: Number((document.querySelector("[name=trap_note]") as HTMLInputElement).checked) });
    cycle_data.push({ id: cycle_data.length, score_type: 3, intake: Number((document.querySelector("[name=climb]") as HTMLInputElement).checked), travel: Number((document.querySelector("[name=climb]") as HTMLInputElement).checked), outtake: Number((document.querySelector("[name=climb]") as HTMLInputElement).checked) });
    cycle_data.push({ id: cycle_data.length, score_type: 4, intake: Number((document.querySelector("[name=buddy_climb]") as HTMLInputElement).checked), travel: Number((document.querySelector("[name=buddy_climb]") as HTMLInputElement).checked), outtake: Number((document.querySelector("[name=buddy_climb]") as HTMLInputElement).checked) });

    const data = {
        season: 2024,
        event: getEventCookie(),
        match_num: Number((document.getElementById("match_num_input") as HTMLSelectElement).value),
        level: "Qualification",
        team: Number((document.getElementById("team_number") as HTMLSelectElement).value),
        game: JSON.stringify(cycle_data),
        defend: (document.querySelector("[name=defense]") as HTMLTextAreaElement).value,
        driving: (document.querySelector("[name=driving]") as HTMLTextAreaElement).value,
        overall: (document.querySelector("[name=overall]") as HTMLTextAreaElement).value
    }
    _post(API_SUBMIT, null, data).then((result) => {
        submit_progress.value = 100;
        continue_button.style.display = "unset";
        success_seal.style.display = "unset";
        submit_text.innerText = "Submitted!"
    }).catch((error) => {
        submit_progress.value = 0;
        failure_seal.style.display = "unset";
        submit_text.innerHTML = `Error!<br>${error}`;
    });
}

function reset() {
    clearInterval(timer_id[0]);
    clearInterval(timer_id[1]);
    clearInterval(timer_id[2]);
    timer_id = [0, 0, 0];
    timer_times = [0, 0, 0];
    cycle_data = [];
    (document.querySelector("[name=defense]") as HTMLTextAreaElement).value = "";
    (document.querySelector("[name=driving]") as HTMLTextAreaElement).value = "";
    (document.querySelector("[name=overall]") as HTMLTextAreaElement).value = "";
    (document.getElementById("team_number") as HTMLSelectElement).value = "";
    (document.querySelector("[name=trap_note]") as HTMLInputElement).checked = false;
    (document.querySelector("[name=climb]") as HTMLInputElement).checked = false;
    (document.querySelector("[name=buddy_climb]") as HTMLInputElement).checked = false;
    (document.getElementById("submit_page") as HTMLFormElement).style.display = "none";
    (document.getElementById("form_content") as HTMLFormElement).style.display = "block";
    let pages = Array.from(document.getElementsByClassName("form_pages")) as Array<HTMLDivElement>;
    (document.getElementsByClassName("continue_button")![0] as HTMLButtonElement).disabled = true;
    (document.getElementsByClassName("continue_button")![2] as HTMLButtonElement).disabled = true;
    pages[1].style.display = "none";
    pages[2].style.display = "none";
    pages[0].style.display = "flex";
}

(document.getElementById("scout_again") as HTMLButtonElement).onclick = reset;

(document.getElementsByClassName("continue_button")![2] as HTMLButtonElement).addEventListener("click", submit);

function advance_page(current: number) {
    let pages = Array.from(document.getElementsByClassName("form_pages")) as Array<HTMLDivElement>;
    pages[current].style.display = "none";
    pages[current + 1].style.display = "flex";
}

(document.getElementsByClassName("continue_button")![0] as HTMLButtonElement).addEventListener("click", () => { advance_page(0) });
(document.getElementsByClassName("continue_button")![1] as HTMLButtonElement).addEventListener("click", () => { advance_page(1) });
