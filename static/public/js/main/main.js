import { _get } from "../_modules/get/get.min.js";
import { _post } from "../_modules/post/post.min.js";
// get events
const API_META = "/api/v1/data";
const API_MATCHES = ["/api/v1/events/matches/", /* season */ "/", /* event */ "/qual/true"];
const API_WHOAMI = "/api/v1/whoami";
const API_SUBMIT = "/api/v1/data/submit";
var match_schedule;
async function init() {
    _get(API_WHOAMI, null).then((result) => {
        console.info(result);
    }).catch((error) => {
        console.error(error);
        window.location.href = "/login";
    });
    await load_data();
    document.getElementById("event_code").addEventListener("change", () => {
        load_matches(document.getElementById("event_code").value);
    });
    document.getElementById("match_num_input").addEventListener("change", () => {
        match_num_entry(document.getElementById("match_num_input").value);
    });
}
async function load_data() {
    _get(API_META, null).then((result) => {
        result.events.forEach(event_code => {
            document.getElementById("event_code").insertAdjacentHTML("beforeend", `<option value="${event_code}">${event_code}</option>`);
        });
        document.getElementById("event_code").value = "CAFR";
        load_matches("CAFR");
    }).catch((error) => {
        alert(`failed to load valid event codes. ${error}`);
    });
}
function load_matches(event = "CAFR") {
    _get(API_MATCHES[0] + "2023" + API_MATCHES[1] + event + API_MATCHES[2], null).then((result) => {
        if (result.Schedule.length != 0) {
            match_schedule = result.Schedule;
            document.getElementById("match_num_input").innerHTML = "";
            result.Schedule.forEach(match => {
                document.getElementById("match_num_input").insertAdjacentHTML("beforeend", `<option value="${match.matchNumber}">${match.matchNumber}</option>`);
            });
            match_num_entry("1");
        }
        else {
            alert("match schedule is not yet posted");
            document.getElementById("match_num_input").innerHTML = "";
        }
    }).catch((error) => {
        alert("match schedule is not yet posted");
        document.getElementById("match_num_input").innerHTML = "";
    });
}
function set_option(element, value) {
    element.innerText = value;
    element.value = value;
}
function match_num_entry(entry) {
    let entry_num = Number(entry);
    let select_elements = document.getElementsByClassName("teamNumOption");
    set_option(select_elements[3], match_schedule[entry_num - 1].teams[0].teamNumber);
    set_option(select_elements[4], match_schedule[entry_num - 1].teams[1].teamNumber);
    set_option(select_elements[5], match_schedule[entry_num - 1].teams[2].teamNumber);
    set_option(select_elements[0], match_schedule[entry_num - 1].teams[3].teamNumber);
    set_option(select_elements[1], match_schedule[entry_num - 1].teams[4].teamNumber);
    set_option(select_elements[2], match_schedule[entry_num - 1].teams[5].teamNumber);
}
document.body.onload = init;
var timer_buttons = Array.from(document.getElementsByClassName("time_button"));
var timer_displays = Array.from(document.getElementsByClassName("counter"));
var timer_id = [0, 0, 0];
var timer_times = [0, 0, 0];
function start_timer(button) {
    timer_id[button] = setInterval(() => {
        timer_times[button] += 0.1;
        timer_displays[button].innerText = String(Math.round(timer_times[button] * 10) / 10);
    }, 100);
}
function stop_timer(button) {
    clearInterval(timer_id[button]);
}
timer_buttons[0].addEventListener("mousedown", () => { start_timer(0); });
timer_buttons[0].addEventListener("mouseup", () => { stop_timer(0); });
timer_buttons[0].addEventListener("touchstart", () => { start_timer(0); });
timer_buttons[0].addEventListener("touchend", () => { stop_timer(0); });
timer_buttons[1].addEventListener("mousedown", () => { start_timer(1); });
timer_buttons[1].addEventListener("mouseup", () => { stop_timer(1); });
timer_buttons[1].addEventListener("touchstart", () => { start_timer(1); });
timer_buttons[1].addEventListener("touchend", () => { stop_timer(1); });
timer_buttons[2].addEventListener("mousedown", () => { start_timer(2); });
timer_buttons[2].addEventListener("mouseup", () => { stop_timer(2); });
timer_buttons[2].addEventListener("touchstart", () => { start_timer(2); });
timer_buttons[2].addEventListener("touchend", () => { stop_timer(2); });
document.addEventListener("mouseup", () => { stop_timer(0); stop_timer(1); stop_timer(2); });
document.addEventListener("touchend", () => { stop_timer(0); stop_timer(1); stop_timer(2); });
var cycle_buttons = Array.from(document.getElementsByClassName("cycle_button"));
var cycle_data = [];
function end_cycle(type) {
    if (timer_times[0] != 0 || timer_times[1] != 0 || timer_times[2] != 0) {
        cycle_data.push({
            id: cycle_data.length,
            score_type: type,
            intake: Math.round(timer_times[0] * 10) / 10,
            travel: Math.round(timer_times[1] * 10) / 10,
            outtake: Math.round(timer_times[2] * 10) / 10,
        });
        timer_times = [0, 0, 0];
        timer_displays.forEach((display) => { display.innerText = "0"; });
    }
    console.log(cycle_data);
}
cycle_buttons[0].addEventListener("click", () => { end_cycle(0); });
cycle_buttons[1].addEventListener("click", () => { end_cycle(1); });
function submit() {
    if (document.querySelector("[name=defense]").value
        .length == 0 ||
        document.querySelector("[name=driving]").value
            .length == 0 ||
        document.querySelector("[name=overall]").value
            .length == 0 ||
        match_schedule.length == 0 ||
        document.getElementById("match_num_input").value.length == 0 ||
        document.getElementById("team_number").value.length == 0) {
        return;
    }
    document.getElementById("form_content").style.display = "none";
    document.getElementById("submit_page").style.display = "block";
    var submit_text = document.getElementById("submit_text"), submit_progress = document.getElementById("submit_progress"), continue_button = document.getElementById("scout_again"), success_seal = document.getElementById("success_seal"), failure_seal = document.getElementById("failure_seal");
    submit_text.innerText = "Submitting...";
    cycle_data.push({ id: cycle_data.length, score_type: 2, intake: Number(document.querySelector("[name=trap_note]").checked), travel: Number(document.querySelector("[name=trap_note]").checked), outtake: Number(document.querySelector("[name=trap_note]").checked) });
    cycle_data.push({ id: cycle_data.length, score_type: 3, intake: Number(document.querySelector("[name=climb]").checked), travel: Number(document.querySelector("[name=climb]").checked), outtake: Number(document.querySelector("[name=climb]").checked) });
    cycle_data.push({ id: cycle_data.length, score_type: 4, intake: Number(document.querySelector("[name=buddy_climb]").checked), travel: Number(document.querySelector("[name=buddy_climb]").checked), outtake: Number(document.querySelector("[name=buddy_climb]").checked) });
    const data = {
        season: 2024,
        event: document.getElementById("event_code").value,
        match_num: Number(document.getElementById("match_num_input").value),
        level: "Qualification",
        team: Number(document.getElementById("team_number").value),
        game: JSON.stringify(cycle_data),
        defend: document.querySelector("[name=defense]").value,
        driving: document.querySelector("[name=driving]").value,
        overall: document.querySelector("[name=overall]").value
    };
    _post(API_SUBMIT, null, data).then((result) => {
        submit_progress.value = 100;
        continue_button.style.display = "unset";
        success_seal.style.display = "unset";
        submit_text.innerText = "Submitted!";
    }).catch((error) => {
        submit_progress.value = 0;
        failure_seal.style.display = "unset";
        submit_text.innerHTML = `Error!<br>${error}`;
    });
}
document.getElementsByClassName("continue_button")[0].addEventListener("click", submit);
