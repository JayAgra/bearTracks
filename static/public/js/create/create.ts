import { _post } from "../_modules/post/post.min.js";
const codeBoxes: NodeList = document.querySelectorAll("[kind=join]");

function codeBoxKeyUp(num: number, event: KeyboardEvent) {
    const eventCode = event.key;
    if (
        Array.from(Array(10).keys()).includes(Number(eventCode)) ||
        eventCode === "Backspace"
    ) {
        if ((event.target as HTMLInputElement).value.length === 1) {
            if (num !== 4) {
                (codeBoxes[num + 1] as HTMLInputElement).focus();
            } else {
                (event.target as HTMLInputElement).blur();
                (
                    document.querySelector("[name=access]") as HTMLInputElement
                ).value =
                    (codeBoxes[0] as HTMLInputElement).value +
                    (codeBoxes[1] as HTMLInputElement).value +
                    (codeBoxes[2] as HTMLInputElement).value +
                    (codeBoxes[3] as HTMLInputElement).value +
                    (codeBoxes[4] as HTMLInputElement).value;
                (
                    document.querySelector(
                        "[name=full_name]"
                    ) as HTMLInputElement
                ).focus();
            }
        }
        if (eventCode === "Backspace") {
            (codeBoxes[num - 1] as HTMLInputElement).focus();
        }
    } else {
        (event.target as HTMLInputElement).value = "";
    }
}

function codeBoxFocus(num: number, event: FocusEvent) {
    for (var i: number = 1; i < num; i++) {
        let currentEle: HTMLInputElement = codeBoxes[i] as HTMLInputElement;
        if (!currentEle.value) {
            currentEle.focus();
            break;
        }
    }
}

codeBoxes.forEach((codeBox: HTMLInputElement, index: number) => {
    codeBox.onkeyup = (event: KeyboardEvent) => {
        codeBoxKeyUp(index, event);
    };
    codeBox.onfocus = (event: FocusEvent) => {
        codeBoxFocus(index, event);
    };
});

const errorElement = document.getElementById("error") as HTMLElement;

async function errorReload() {
    errorElement.style.display = "flex";
    await new Promise((res) => setTimeout(res, 1500));
    window.location.reload();
}

async function uploadForm() {
    const responses = {
        access: (document.querySelector("[name=access]") as HTMLInputElement)
            .value,
        full_name: (
            document.querySelector("[name=full_name]") as HTMLInputElement
        ).value,
        username: (
            document.querySelector("[name=username]") as HTMLInputElement
        ).value,
        password: (
            document.querySelector("[name=password]") as HTMLInputElement
        ).value,
    };
    _post("/api/v1/auth/create", errorElement.id, responses)
        .then(async (response: { status: String }) => {
            switch (response.status) {
                case "you_sketchy_motherfucker": {
                    errorElement.innerText = "no special characters other than \"_\" or \"-\" in any field. 32 char max for all fields.";
                    errorReload();
                    break;
                }
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
        .catch((error: any) => {
            errorElement.innerText = "unknown error";
        });
}

(document.getElementById("create_button") as HTMLButtonElement).onclick =
    uploadForm;
