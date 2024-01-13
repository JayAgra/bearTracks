import { _post } from "../_modules/post/post.min.js";
const codeBoxes = document.querySelectorAll("[kind=join]");
function codeBoxKeyUp(num, event) {
    const eventCode = event.key;
    if (Array.from(Array(10).keys()).includes(Number(eventCode)) ||
        eventCode === "Backspace") {
        if (event.target.value.length === 1) {
            if (num !== 4) {
                codeBoxes[num + 1].focus();
            }
            else {
                event.target.blur();
                document.querySelector("[name=access]").value =
                    codeBoxes[0].value +
                        codeBoxes[1].value +
                        codeBoxes[2].value +
                        codeBoxes[3].value +
                        codeBoxes[4].value;
                document.querySelector("[name=full_name]").focus();
            }
        }
        if (eventCode === "Backspace") {
            codeBoxes[num - 1].focus();
        }
    }
    else {
        event.target.value = "";
    }
}
function codeBoxFocus(num, event) {
    for (var i = 1; i < num; i++) {
        let currentEle = codeBoxes[i];
        if (!currentEle.value) {
            currentEle.focus();
            break;
        }
    }
}
codeBoxes.forEach((codeBox, index) => {
    codeBox.onkeyup = (event) => {
        codeBoxKeyUp(index, event);
    };
    codeBox.onfocus = (event) => {
        codeBoxFocus(index, event);
    };
});
const errorElement = document.getElementById("error");
async function errorReload() {
    errorElement.style.display = "flex";
    await new Promise((res) => setTimeout(res, 1500));
    window.location.reload();
}
async function uploadForm() {
    const responses = {
        access: document.querySelector("[name=access]")
            .value,
        full_name: document.querySelector("[name=full_name]").value,
        username: document.querySelector("[name=username]").value,
        password: document.querySelector("[name=password]").value,
    };
    _post("/api/v1/auth/create", errorElement.id, responses)
        .then(async (response) => {
        switch (response.status) {
            case "username_taken": {
                errorElement.innerText = "username taken";
                errorReload();
                break;
            }
            case "bad_access_key": {
                errorElement.innerText = "bad access key";
                errorReload();
                break;
            }
            case "password_length": {
                errorElement.innerText =
                    "password length bad ( 8 <= len <= 32 )";
                errorReload();
                break;
            }
            case "success": {
                window.location.href = "/login";
                break;
            }
            default: {
                errorElement.innerText = "internal server error";
                errorReload();
                break;
            }
        }
    })
        .catch((error) => {
        errorElement.innerText = "unknown error";
    });
}
document.getElementById("create_button").onclick =
    uploadForm;
