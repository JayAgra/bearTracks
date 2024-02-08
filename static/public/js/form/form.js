"use strict";
function getThemeCookie() {
    var cookieString = RegExp("4c454a5b1bedf6a1" + "=[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookieString ? cookieString.toString().replace(/^[^=]+./, "") : "");
}
function themeHandle() {
    let theme = getThemeCookie();
    switch (theme) {
        case "light":
            document.body.classList.replace("dark-mode", "light-mode");
            document.getElementById("themeMeta").content = "#ffffff";
            break;
        case "dark":
            document.body.classList.replace("light-mode", "dark-mode");
            document.getElementById("themeMeta").content = "#121212";
            break;
        case "gruvbox":
        case undefined:
        default:
            document.body.classList.replace("dark-mode", "gruvbox");
            document.getElementById("themeMeta").content = "#282828";
            break;
    }
}
const waitMs = (ms) => new Promise((res) => setTimeout(res, ms));
