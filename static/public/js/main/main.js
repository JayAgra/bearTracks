import { _get } from "../_modules/get/get.min.js";
// get events
const API_META = "/api/v1/data";
const API_MATCHES = ["/api/v1/events/matches/", /* season */ "/", /* event */ "/qual/true"];
const API_WHOAMI = "/api/v1/whoami";
var match_schedule;
function init() {
    load_events();
    try {
        load_matches(document.getElementById("event_code").value);
        match_num_entry(document.getElementById("match_num_input").value);
    }
    catch { }
    document.getElementById("event_code").addEventListener("change", () => {
        load_matches(document.getElementById("event_code").value);
    });
    document.getElementById("match_num_input").addEventListener("change", () => {
        match_num_entry(document.getElementById("match_num_input").value);
    });
    let adv_buttons = document.getElementsByClassName("continue_button");
    for (var i = 0; i < 3; i++) {
        adv_buttons[i].addEventListener("click", () => {
            advance_screen(i + 1);
        });
    }
}
function load_events() {
    _get(API_META, null).then((result) => {
        result.events.forEach(event_code => {
            document.getElementById("event_code").insertAdjacentHTML("beforeend", `<option value="${event_code}">${event_code}</option>`);
        });
    }).catch((error) => {
        alert(`failed to load valid event codes. ${error}`);
    });
}
function load_matches(event) {
    _get(API_MATCHES[0] + "2023" + API_MATCHES[1] + event + API_MATCHES[2], null).then((result) => {
        if (result.Schedule.length != 0) {
            match_schedule = result.Schedule;
        }
        else {
            alert("match schedule is not yet posted");
            match_schedule = [];
        }
    }).catch((error) => {
        alert(`failed to load matches. ${error}`);
        match_schedule = [];
    });
}
function set_option(element, value) {
    element.innerText = value;
    element.value = value;
}
function match_num_entry(entry) {
    let entry_num = Number(entry);
    if (entry_num > match_schedule.length || entry_num < 1) {
        document.getElementById("bad_match_num").innerText = `invalid. must be between 1 and ${match_schedule.length}`;
        document.getElementById("bad_match_num").style.display = "unset";
    }
    else {
        document.getElementById("bad_match_num").style.display = "none";
        let select_elements = document.getElementsByClassName("teamNumOption");
        set_option(select_elements[3], match_schedule[entry_num - 1].teams[0].teamNumber);
        set_option(select_elements[4], match_schedule[entry_num - 1].teams[1].teamNumber);
        set_option(select_elements[5], match_schedule[entry_num - 1].teams[2].teamNumber);
        set_option(select_elements[0], match_schedule[entry_num - 1].teams[3].teamNumber);
        set_option(select_elements[1], match_schedule[entry_num - 1].teams[4].teamNumber);
        set_option(select_elements[2], match_schedule[entry_num - 1].teams[5].teamNumber);
    }
}
function advance_screen(screen) {
    let panes = document.getElementsByClassName("main_pane");
    for (var i = 0; i < 4; i++) {
        panes[i].style.display = screen === i ? "unset" : "none";
    }
}
document.body.onload = init;
