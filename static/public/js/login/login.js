import { _post } from "../_modules/post/post.min.js";
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
        window.location.href = "/passkeyAuth";
    }
});
function setCooky(name) {
    document.cookie = name + "=" + "true" + "; expires=" + new Date(Date.now() + 86400000).toUTCString() + "; path=/";
}
function deleteCooky(name) { document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'; }
window.onload = () => { deleteCooky("lead"); deleteCooky("childTeamLead"); };
async function uploadForm() {
    const errorElement = document.getElementById("error");
    errorElement.disabled = true;
    const responses = { "username": document.querySelector("[name=username]").value, "password": document.querySelector("[name=password]").value };
    _post("/api/v1/auth/login", errorElement.id, responses).then(async (response) => {
        switch (response.status) {
            case "success": {
                window.location.href = "/";
                break;
            }
            case "success_adm": {
                setCooky("lead");
                window.location.href = "/";
                break;
            }
            case "success_ctl": {
                setCooky("childTeamLead");
                window.location.href = "/";
                break;
            }
            case "bad": {
                errorElement.innerText = "bad credentials";
                errorElement.style.display = "flex";
                await new Promise((res) => setTimeout(res, 1000));
                window.location.reload();
                break;
            }
        }
    }).catch((error) => { document.getElementById("error").innerText = "unknown error"; });
}
passwordLoginButton.onclick = uploadForm;
