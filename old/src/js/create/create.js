import { _dErr } from "../_modules/dErr/dErr.min.js";
function displayCreateErrors() {
    _dErr(["500 internal server error", "username already in use", "min password length is 8", "invalid team join code"]);
}
const codeBoxes = document.querySelectorAll("[kind=join]");
function codeBoxKeyUp(num, event) {
    const eventCode = event.key;
    if (Array.from(Array(10).keys()).includes(Number(eventCode)) || eventCode === "Backspace") {
        if (event.target.value.length === 1) {
            if (num !== 4) {
                codeBoxes[num + 1].focus();
            }
            else {
                event.target.blur();
                document.querySelector("[name=access").value = codeBoxes[0].value + codeBoxes[1].value + codeBoxes[2].value + codeBoxes[3].value + codeBoxes[4].value;
                document.querySelector("[name=fullName]").focus();
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
    codeBox.onkeyup = (event) => { codeBoxKeyUp(index, event); };
    codeBox.onfocus = (event) => { codeBoxFocus(index, event); };
});
window.displayCreateErrors = displayCreateErrors;
