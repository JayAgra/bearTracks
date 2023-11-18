import { _get } from "../_modules/get/get.min.js";
import { _dErr } from "../_modules/dErr/dErr.min.js";
var isPkBtn = false;
const nextBtn = document.getElementById("next"), infoInput = document.getElementById("inputInfo"), currentUsernameInd = document.getElementById("currentUsername"), passwordLoginButton = document.getElementById("pw"), createAccountButton = document.getElementById("createAct"), errorElement = document.getElementById("error"), inputPassword = document.getElementById("inputPassword");
nextBtn.addEventListener("click", async () => {
    errorElement.innerText = "";
    if (!isPkBtn) {
        if (infoInput.value.length === 0) {
            infoInput.classList.add("shakeInput");
            await new Promise((res) => setTimeout(res, 500));
            infoInput.classList.remove("shakeInput");
            return;
        }
        else {
            infoInput.classList.add("fade");
            currentUsernameInd.firstChild.innerText = "username";
            currentUsernameInd.children[1].innerText = infoInput.value;
            nextBtn.classList.add("nextStepPk");
            infoInput.classList.add("fadeIn");
            passwordLoginButton.style.opacity = "0";
            passwordLoginButton.style.display = "";
            passwordLoginButton.classList.add("nextStepPw");
            createAccountButton.classList.add("moveDown");
            await new Promise((res) => setTimeout(res, 100));
            infoInput.style.display = "none";
            inputPassword.style.display = "unset";
            passwordLoginButton.removeAttribute("disabled");
            isPkBtn = true;
        }
    }
    else {
        let attResp;
        await _get("/api/auth/authPasskey/" + infoInput.value, "error").then(async (response) => {
            // @ts-ignore
            attResp = await SimpleWebAuthnBrowser.startAuthentication(response);
        }).catch((error) => {
            errorElement.innerText = "unknown error getting challenge";
            throw new Error("unhandled error 😭");
        });
        const verificationResp = await fetch("/api/auth/verifyAuthPasskey/" + infoInput.value, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(attResp),
        });
        const verificationJSON = await verificationResp.json();
        if (verificationJSON && verificationJSON.verified) {
            window.location.href = "/";
        }
        else {
            errorElement.innerText = "bad passkey";
            await new Promise((res) => setTimeout(res, 2000));
            window.location.reload();
        }
    }
});
function displayErrors() {
    _dErr(["500 internal server error", "invalid credentials", "account not yet approved", ""]);
}
window.displayErrors = displayErrors;
