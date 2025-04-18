"use strict";

function getThemeCookie() {
    var cookieString = RegExp("4c454a5b1bedf6a1" + "=[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookieString ? cookieString.toString().replace(/^[^=]+./, "") : "");
}

function themeHandle() {
    let theme = getThemeCookie();
    switch (theme) {
        case "light":
            document.body.classList.replace("gruvbox", "light-mode");
            (document.getElementById("themeMeta") as HTMLMetaElement).content = "#ffffff";
            break;
        case "dark":
            document.body.classList.replace("gruvbox", "dark-mode");
            (document.getElementById("themeMeta") as HTMLMetaElement).content = "#121212";
            break;
        case "gruvbox": case undefined: default:
            // document.body.classList.replace("dark-mode", "gruvbox");
            (document.getElementById("themeMeta") as HTMLMetaElement).content = "#282828";
            break;
    }
}

const waitMs = (ms: number) => new Promise((res) => setTimeout(res, ms));