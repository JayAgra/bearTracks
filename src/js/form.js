"use strict";

function getThemeCookie() {
    var allcookies = document.cookie.split(";");
    for (var i = 0; i < allcookies.length; i += 1) {
        var cookie = allcookies[i].trim();
        if (
            cookie.indexOf(name) == 0 &&
            cookie.substr(name.length).includes("4c454a5b1bedf6a1")
        ) {
            return cookie.substr(name.length).split("=")[1];
        }
    }
}

function themeHandle() {
    let theme = getThemeCookie();
    switch (theme) {
        case "light":
            document.body.classList.replace("dark-mode", "light-mode");
            document.getElementById("themeMeta").content = "#ffffff";
            break;
        case "gruvbox":
            document.body.classList.replace("dark-mode", "gruvbox");
            document.getElementById("themeMeta").content = "#282828";
            break;
        case "dark": case undefined: default:
            document.body.classList.replace("light-mode", "dark-mode");
            document.getElementById("themeMeta").content = "#121212";
            break;
    }
}

function goToHome() {
    history.back();
}

/*
function exportSubmissionJSON() {
    const downloadFormButton = document.getElementById("downloadFormButton");
    const downloadFileLink = document.getElementById("downloadFileLink");
    downloadFormButton.innerHTML = "Please wait...";
    const form = document.getElementById("mainFormHTML");
    const blob = new Blob(
        [btoa(JSON.stringify(Object.fromEntries(new FormData(form))))],
        {
            type: "application/octet-stream",
        }
    );
    const downloadURL = URL.createObjectURL(blob);
    downloadFormButton.style.display = "none";
    downloadFileLink.style.display = "inline";
    downloadFileLink.download =
        "main_submission_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2) +
        ".scout";
    downloadFileLink.href = downloadURL;
    downloadFileLink.innerHTML = "Ready! Click again to download";
}
*/