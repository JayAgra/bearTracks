import { _dErr } from "../_modules/dErr/dErr.min.js";
function displayCreateErrors() {
    _dErr(["500 internal server error", "email already in use", "min password length is 8", "invalid team join code"]);
}
window.displayCreateErrors = displayCreateErrors;
