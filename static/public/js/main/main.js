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
    document.getElementById("selected_event_code").innerText = getEventCookie();
    _get(API_WHOAMI, null).then((result) => {
        console.info(result);
    }).catch((error) => {
        console.error(error);
        window.location.href = "/login";
    });
    await load_matches(getEventCookie());
    document.getElementById("match_num_input").addEventListener("change", () => {
        match_num_entry(document.getElementById("match_num_input").value);
    });
}
function load_matches(event = "CAFR") {
    document.getElementsByClassName("continue_button")[0].disabled = true;
    _get(API_MATCHES[0] + "2025" + API_MATCHES[1] + event + API_MATCHES[2], null).then((result) => {
        if (result.Schedule.length != 0) {
            match_schedule = result.Schedule;
            document.getElementById("match_num_input").innerHTML = "";
            result.Schedule.forEach(match => {
                document.getElementById("match_num_input").insertAdjacentHTML("beforeend", `<option value="${match.matchNumber}">${match.matchNumber}</option>`);
            });
            match_num_entry("1");
            document.getElementById("match_num_input").value = "";
            document.getElementById("team_number").value = "";
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
document.getElementById("team_number").onchange = () => {
    if (document.getElementById("team_number").value == "") {
        document.getElementsByClassName("continue_button")[0].disabled = true;
    }
    else {
        document.getElementsByClassName("continue_button")[0].disabled = false;
    }
};
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
cycle_buttons[0].addEventListener("click", () => { end_cycle(4); }); // Algae
cycle_buttons[1].addEventListener("click", () => { end_cycle(5); }); // L1
cycle_buttons[2].addEventListener("click", () => { end_cycle(6); }); // L2
cycle_buttons[3].addEventListener("click", () => { end_cycle(7); }); // L3
cycle_buttons[4].addEventListener("click", () => { end_cycle(8); }); // L4
document.querySelector("[name=defense]").onchange = check_responses;
document.querySelector("[name=driving]").onchange = check_responses;
document.querySelector("[name=overall]").onchange = check_responses;
function check_responses() {
    if (document.querySelector("[name=defense]").value.length > 0 &&
        document.querySelector("[name=driving]").value.length > 0 &&
        document.querySelector("[name=overall]").value.length > 0) {
        document.getElementsByClassName("continue_button")[2].disabled = false;
    }
    else {
        document.getElementsByClassName("continue_button")[2].disabled = true;
    }
}
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
    cycle_data.push({ score_type: 9, intake: Number(document.querySelector("[name=park]").checked), travel: Number(document.querySelector("[name=park]").checked), outtake: Number(document.querySelector("[name=park]").checked) });
    cycle_data.push({ score_type: 10, intake: Number(document.querySelector("[name=shallow_cage]").checked), travel: Number(document.querySelector("[name=shallow_cage]").checked), outtake: Number(document.querySelector("[name=shallow_cage]").checked) });
    cycle_data.push({ score_type: 11, intake: Number(document.querySelector("[name=deep_cage]").checked), travel: Number(document.querySelector("[name=deep_cage]").checked), outtake: Number(document.querySelector("[name=deep_cage]").checked) });
    cycle_data.push({ score_type: 14, intake: Number(document.querySelector("[name=auto_algae]").value), travel: Number(document.querySelector("[name=auto_algae]").value), outtake: Number(document.querySelector("[name=auto_algae]").value) });
    cycle_data.push({ score_type: 15, intake: Number(document.querySelector("[name=auto_coral]").value), travel: Number(document.querySelector("[name=auto_coral]").value), outtake: Number(document.querySelector("[name=auto_coral]").value) });
    cycle_data.push({ score_type: 13, intake: Number(document.querySelector("[name=auto_scores]").value), travel: Number(document.querySelector("[name=auto_scores]").value), outtake: Number(document.querySelector("[name=auto_scores]").value) });
    cycle_data.push({ score_type: 12, intake: Number(document.querySelector("[name=auto_leave]").checked), travel: Number(document.querySelector("[name=auto_leave]").checked), outtake: Number(document.querySelector("[name=auto_leave]").checked) });
    const data = {
        season: 2025,
        event: getEventCookie(),
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
function reset() {
    clearInterval(timer_id[0]);
    clearInterval(timer_id[1]);
    clearInterval(timer_id[2]);
    timer_id = [0, 0, 0];
    timer_times = [0, 0, 0];
    cycle_data = [];
    document.querySelector("[name=auto_algae]").value = "0";
    document.querySelector("[name=auto_coral]").value = "0";
    document.querySelector("[name=auto_scores]").value = "0";
    document.querySelector("[name=defense]").value = "";
    document.querySelector("[name=driving]").value = "";
    document.querySelector("[name=overall]").value = "";
    document.getElementById("team_number").value = "";
    document.querySelector("[name=park]").checked = false;
    document.querySelector("[name=shallow_cage]").checked = false;
    document.querySelector("[name=deep_cage]").checked = false;
    document.getElementById("submit_page").style.display = "none";
    document.getElementById("form_content").style.display = "block";
    timer_id = [0, 0, 0];
    timer_times = [0, 0, 0];
    timer_displays[0].innerText = "0.0";
    timer_displays[1].innerText = "0.0";
    timer_displays[2].innerText = "0.0";
    let pages = Array.from(document.getElementsByClassName("form_pages"));
    document.getElementsByClassName("continue_button")[0].disabled = true;
    document.getElementsByClassName("continue_button")[2].disabled = true;
    pages[1].style.display = "none";
    pages[2].style.display = "none";
    pages[0].style.display = "flex";
}
document.getElementById("scout_again").onclick = reset;
document.getElementsByClassName("continue_button")[2].addEventListener("click", submit);
function advance_page(current) {
    let pages = Array.from(document.getElementsByClassName("form_pages"));
    pages[current].style.display = "none";
    pages[current + 1].style.display = "flex";
}
document.getElementsByClassName("continue_button")[0].addEventListener("click", () => { advance_page(0); });
document.getElementsByClassName("continue_button")[1].addEventListener("click", () => { advance_page(1); });
