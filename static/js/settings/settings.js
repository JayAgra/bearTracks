function changeTheme() {
    let theme = getThemeCookie();
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
export {};
