"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var get_min_js_1 = require("../_modules/get/get.min.js");
var post_min_js_1 = require("../_modules/post/post.min.js");
// get events
var API_META = "/api/v1/data";
var API_MATCHES = ["/api/v1/events/matches/", /* season */ "/", /* event */ "/qual/true"];
var API_WHOAMI = "/api/v1/whoami";
var API_SUBMIT = "/api/v1/data/submit";
var match_schedule;
function getEventCookie() {
    var cookieString = RegExp("92bdcf1af0a0a23d" + "=[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookieString ? cookieString.toString().replace(/^[^=]+./, "") : "");
}
function init() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (getEventCookie() == "") {
                        document.cookie = "92bdcf1af0a0a23d=CAFR; expires=Fri, 31 Dec 9999 23:59:59 GMT; Secure; SameSite=Lax";
                    }
                    document.getElementById("selected_event_code").innerText = getEventCookie();
                    (0, get_min_js_1._get)(API_WHOAMI, null).then(function (result) {
                        console.info(result);
                    }).catch(function (error) {
                        console.error(error);
                        window.location.href = "/login";
                    });
                    return [4 /*yield*/, load_matches(getEventCookie())];
                case 1:
                    _a.sent();
                    document.getElementById("match_num_input").addEventListener("change", function () {
                        match_num_entry(document.getElementById("match_num_input").value);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function load_matches(event) {
    if (event === void 0) { event = "CAFR"; }
    document.getElementsByClassName("continue_button")[0].disabled = true;
    (0, get_min_js_1._get)(API_MATCHES[0] + "2024" + API_MATCHES[1] + event + API_MATCHES[2], null).then(function (result) {
        if (result.Schedule.length != 0) {
            match_schedule = result.Schedule;
            document.getElementById("match_num_input").innerHTML = "";
            result.Schedule.forEach(function (match) {
                document.getElementById("match_num_input").insertAdjacentHTML("beforeend", "<option value=\"".concat(match.matchNumber, "\">").concat(match.matchNumber, "</option>"));
            });
            match_num_entry("1");
            document.getElementById("match_num_input").value = "";
            document.getElementById("team_number").value = "";
        }
        else {
            alert("match schedule is not yet posted");
            document.getElementById("match_num_input").innerHTML = "";
        }
    }).catch(function (error) {
        alert("match schedule is not yet posted");
        document.getElementById("match_num_input").innerHTML = "";
    });
}
function set_option(element, value) {
    element.innerText = value;
    element.value = value;
}
document.getElementById("team_number").onchange = function () {
    if (document.getElementById("team_number").value == "") {
        document.getElementsByClassName("continue_button")[0].disabled = true;
    }
    else {
        document.getElementsByClassName("continue_button")[0].disabled = false;
    }
};
function match_num_entry(entry) {
    var entry_num = Number(entry);
    var select_elements = document.getElementsByClassName("teamNumOption");
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
    timer_id[button] = setInterval(function () {
        timer_times[button] += 0.1;
        timer_displays[button].innerText = String(Math.round(timer_times[button] * 10) / 10);
    }, 100);
}
function stop_timer(button) {
    clearInterval(timer_id[button]);
}
timer_buttons[0].addEventListener("mousedown", function () { start_timer(0); });
timer_buttons[0].addEventListener("mouseup", function () { stop_timer(0); });
timer_buttons[0].addEventListener("touchstart", function () { start_timer(0); });
timer_buttons[0].addEventListener("touchend", function () { stop_timer(0); });
timer_buttons[1].addEventListener("mousedown", function () { start_timer(1); });
timer_buttons[1].addEventListener("mouseup", function () { stop_timer(1); });
timer_buttons[1].addEventListener("touchstart", function () { start_timer(1); });
timer_buttons[1].addEventListener("touchend", function () { stop_timer(1); });
timer_buttons[2].addEventListener("mousedown", function () { start_timer(2); });
timer_buttons[2].addEventListener("mouseup", function () { stop_timer(2); });
timer_buttons[2].addEventListener("touchstart", function () { start_timer(2); });
timer_buttons[2].addEventListener("touchend", function () { stop_timer(2); });
document.addEventListener("mouseup", function () { stop_timer(0); stop_timer(1); stop_timer(2); });
document.addEventListener("touchend", function () { stop_timer(0); stop_timer(1); stop_timer(2); });
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
        timer_displays.forEach(function (display) { display.innerText = "0"; });
    }
    console.log(cycle_data);
}
cycle_buttons[0].addEventListener("click", function () { end_cycle(4); }); // Algae
cycle_buttons[1].addEventListener("click", function () { end_cycle(5); }); // L1
cycle_buttons[2].addEventListener("click", function () { end_cycle(6); }); // L2
cycle_buttons[3].addEventListener("click", function () { end_cycle(7); }); // L3
cycle_buttons[4].addEventListener("click", function () { end_cycle(8); }); // L4
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
    cycle_data.push({ score_type: 9, intake: Number(document.querySelector("[name=park]").checked), travel: Number(document.querySelector("[name=trap_note]").checked), outtake: Number(document.querySelector("[name=trap_note]").checked) });
    cycle_data.push({ score_type: 10, intake: Number(document.querySelector("[name=shallow_cage]").checked), travel: Number(document.querySelector("[name=climb]").checked), outtake: Number(document.querySelector("[name=climb]").checked) });
    cycle_data.push({ score_type: 11, intake: Number(document.querySelector("[name=buddy_climb]").checked), travel: Number(document.querySelector("[name=buddy_climb]").checked), outtake: Number(document.querySelector("[name=buddy_climb]").checked) });
    cycle_data.push({ score_type: 14, intake: Number(document.querySelector("[name=auto_algae]").checked), travel: Number(document.querySelector("[name=auto_neutral]").checked), outtake: Number(document.querySelector("[name=auto_neutral]").checked) });
    cycle_data.push({ score_type: 15, intake: Number(document.querySelector("[name=auto_coral]").checked), travel: Number(document.querySelector("[name=auto_wing]").checked), outtake: Number(document.querySelector("[name=auto_wing]").checked) });
    cycle_data.push({ score_type: 13, intake: Number(document.querySelector("[name=auto_scores]").checked), travel: Number(document.querySelector("[name=auto_scores]").checked), outtake: Number(document.querySelector("[name=auto_scores]").checked) });
    var data = {
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
    (0, post_min_js_1._post)(API_SUBMIT, null, data).then(function (result) {
        submit_progress.value = 100;
        continue_button.style.display = "unset";
        success_seal.style.display = "unset";
        submit_text.innerText = "Submitted!";
    }).catch(function (error) {
        submit_progress.value = 0;
        failure_seal.style.display = "unset";
        submit_text.innerHTML = "Error!<br>".concat(error);
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
    var pages = Array.from(document.getElementsByClassName("form_pages"));
    document.getElementsByClassName("continue_button")[0].disabled = true;
    document.getElementsByClassName("continue_button")[2].disabled = true;
    pages[1].style.display = "none";
    pages[2].style.display = "none";
    pages[0].style.display = "flex";
}
document.getElementById("scout_again").onclick = reset;
document.getElementsByClassName("continue_button")[2].addEventListener("click", submit);
function advance_page(current) {
    var pages = Array.from(document.getElementsByClassName("form_pages"));
    pages[current].style.display = "none";
    pages[current + 1].style.display = "flex";
}
document.getElementsByClassName("continue_button")[0].addEventListener("click", function () { advance_page(0); });
document.getElementsByClassName("continue_button")[1].addEventListener("click", function () { advance_page(1); });
