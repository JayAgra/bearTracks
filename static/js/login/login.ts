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