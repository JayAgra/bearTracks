import { _dErr } from "../_modules/dErr/dErr.min.js";

function displayCreateErrors() {
    _dErr(["500 internal server error", "username already in use", "min password length is 8", "invalid team join code"]);
}

const codeBoxes: NodeList = document.querySelectorAll("[kind=join]");

function codeBoxKeyUp(num: number, event: KeyboardEvent) {
    const eventCode = event.key;
    if (Array.from(Array(10).keys()).includes(Number(eventCode)) || eventCode === "Backspace") {
        if ((event.target as HTMLInputElement).value.length === 1) {
            if (num !== 4) {
                (codeBoxes[num + 1] as HTMLInputElement).focus();
            } else {
                (event.target as HTMLInputElement).blur();
                (document.querySelector("[name=access") as HTMLInputElement).value = (codeBoxes[0] as HTMLInputElement).value + (codeBoxes[1] as HTMLInputElement).value + (codeBoxes[2] as HTMLInputElement).value + (codeBoxes[3] as HTMLInputElement).value + (codeBoxes[4] as HTMLInputElement).value;
                (document.querySelector("[name=full_name]") as HTMLInputElement).focus();
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
    codeBox.onkeyup = (event: KeyboardEvent) => { codeBoxKeyUp(index, event) };
    codeBox.onfocus = (event: FocusEvent) => { codeBoxFocus(index, event); };
});

(window as any).displayCreateErrors = displayCreateErrors;