import { _patch } from "../_modules/patch/patch.min.js";
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
function disablePassword() {
    if (confirm("If you continue, you will no longer be able to use a password to login. If you lose your authenticator (i.e. passkey), you will lose access to your account.")) {
        _patch("/api/auth/passwordAuth/delete", document.getElementById("disablePw")).then((response) => {
            if (response.status === "done") {
                document.getElementById("disablePw").innerText = "Password Deleted.";
            }
            else {
                document.getElementById("disablePw").innerText = "Error.";
            }
        }).catch((error) => {
            console.error(error);
        });
    }
    else {
        return alert("aborted.");
    }
}
document.getElementById("disablePw").onclick = disablePassword;
