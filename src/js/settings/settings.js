function getThemeCookieS() {
    var cookieString = RegExp("4c454a5b1bedf6a1" + "=[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookieString ? cookieString.toString().replace(/^[^=]+./, "") : "");
}
function themeHandleLcl() {
    let theme = getThemeCookieS();
    switch (theme) {
        case "light":
            document.body.classList.replace("dark-mode", "light-mode");
            document.getElementById("themeMeta").content = "#ffffff";
            break;
        case "gruvbox":
            document.body.classList.replace("dark-mode", "gruvbox");
            document.getElementById("themeMeta").content = "#282828";
            break;
        case "dark":
        case undefined:
        default:
            document.body.classList.replace("light-mode", "dark-mode");
            document.getElementById("themeMeta").content = "#121212";
            break;
    }
}
function changeTheme() {
    let theme = getThemeCookieS();
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
    themeHandleLcl();
}
