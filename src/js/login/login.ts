import { _dErr } from "../_modules/dErr/dErr.min.js";

function displayLoginErrors() {
    _dErr(["500 internal server error", "bad username/password", "account not yet approved by an admin", ""]);
}

(window as any).displayLoginErrors = displayLoginErrors;