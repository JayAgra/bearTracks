import { _patch } from "../_modules/patch/patch.min.js";
import { _get } from "../_modules/get/get.min.js";

// get events
const API_META = "/api/v1/data";

function changeTheme() {
    let theme: string = getThemeCookie();
    switch (theme) {
        case "light":
            document.cookie = "4c454a5b1bedf6a1=dark; expires=Fri, 31 Dec 9999 23:59:59 GMT; Secure; SameSite=Lax";
            break;
        case "dark":
        case undefined:
            document.cookie = "4c454a5b1bedf6a1=gruvbox; expires=Fri, 31 Dec 9999 23:59:59 GMT; Secure; SameSite=Lax";
            break;
        case "gruvbox": 
            document.cookie = "4c454a5b1bedf6a1=light; expires=Fri, 31 Dec 9999 23:59:59 GMT; Secure; SameSite=Lax";
            break;
        default:
            document.cookie = "4c454a5b1bedf6a1=dark; expires=Fri, 31 Dec 9999 23:59:59 GMT; Secure; SameSite=Lax";
            break;
    }
    themeHandle();
}

document.getElementById("changeTheme").onclick = changeTheme;
document.body.onload = load_data;

function getEventCookie() {
    var cookieString = RegExp("92bdcf1af0a0a23d" + "=[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookieString ? cookieString.toString().replace(/^[^=]+./, "") : "");
}

async function load_data() {
    (document.getElementById("event_code") as HTMLSelectElement).value = getEventCookie();
    _get(API_META, null).then((result) => {
        result.events.forEach(event_code => {
            (document.getElementById("event_code") as HTMLSelectElement).insertAdjacentHTML("beforeend", `<option value="${event_code}">${event_code}</option>`);
        });
        (document.getElementById("event_code") as HTMLSelectElement).value = "CAFR"
    }).catch((error) => {
        alert(`failed to load valid event codes. ${error}`);
    });
}

(document.getElementById("event_code") as HTMLSelectElement).onchange = () => {
    document.cookie = `92bdcf1af0a0a23d=${(document.getElementById("event_code") as HTMLSelectElement).value}; expires=Fri, 31 Dec 9999 23:59:59 GMT; Secure; SameSite=Lax`;
}