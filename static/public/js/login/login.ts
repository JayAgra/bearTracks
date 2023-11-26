import { _post } from "../_modules/post/post.min.js"

var isPkBtn = false;
const nextBtn = document.getElementById("next") as HTMLButtonElement,
    infoInput = document.getElementById("inputInfo") as HTMLInputElement,
    currentUsernameInd = document.getElementById("currentUsername") as HTMLDivElement,
    passwordLoginButton = document.getElementById("pw") as HTMLButtonElement,
    createAccountButton = document.getElementById("createAct") as HTMLSpanElement,
    errorElement = document.getElementById("error") as HTMLHeadingElement,
    inputPassword = document.getElementById("inputPassword") as HTMLInputElement;

nextBtn.addEventListener("click", async () => {
    errorElement.innerText = "";
    if (!isPkBtn) {
        if (infoInput.value.length === 0) {
            infoInput.classList.add("shakeInput");
            await new Promise((res) => setTimeout(res, 500));
            infoInput.classList.remove("shakeInput");
            return;
        } else {
            infoInput.classList.add("fade");
            (currentUsernameInd.firstChild as HTMLParagraphElement).innerText = "username";
            (currentUsernameInd.children[1] as HTMLParagraphElement).innerText = infoInput.value;
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
});

function setCooky(name: string) {
    document.cookie = name + "=" + "true" + "; expires=" + new Date(Date.now() + 86400000).toUTCString() + "; path=/"
}

async function uploadForm() {
    const errorElement = document.getElementById("error") as HTMLButtonElement;
    errorElement.disabled = true;
    const responses = { "username": (document.querySelector("[name=username]") as HTMLInputElement).value, "password": (document.querySelector("[name=password]") as HTMLInputElement).value }
    _post("/api/v1/auth/login", errorElement.id, responses).then(async (response: {status: String}) => {
        switch (response.status) {
            case "success": { window.location.href = "/"; break; }
            case "success_adm": { setCooky("lead"); window.location.href = "/"; break; }
            case "success_ctl": { setCooky("childTeamLead"); window.location.href = "/"; break; }
            case "bad": { errorElement.innerText = "bad credentials"; errorElement.style.display = "flex"; await new Promise((res) => setTimeout(res, 1000)); window.location.reload(); break; }
        }
    }).catch((error: any) => { document.getElementById("error").innerText = "unknown error"; });
}

passwordLoginButton.onclick = uploadForm;