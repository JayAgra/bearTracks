import { startRegistration } from "https://unpkg.com/@simplewebauthn/browser/dist/bundle/index.umd.min.js";
import { _get } from "../_modules/get/get.js";
const elemBegin = document.getElementById("createPk");
const elemSuccess = document.getElementById("success");
const elemError = document.getElementById("error");
elemBegin.addEventListener("click", async () => {
    elemSuccess.innerHTML = "";
    elemError.innerHTML = "";
    let attResp;
    _get("/api/auth/createPasskey", "error").then(async (response) => {
        attResp = await startRegistration(response);
    }).catch((error) => {
        if (error.name === "InvalidStateError") {
            elemError.innerText = "already registered authenticator";
        }
        else {
            elemError.innerText = error;
        }
    });
    const verificationResp = await fetch("/api/auth/verifyPasskey", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(attResp),
    });
    const verificationJSON = await verificationResp.json();
    if (verificationJSON && verificationJSON.verified) {
        elemSuccess.innerHTML = "success";
    }
    else {
        elemSuccess.innerHTML = `error<br><br><pre>${JSON.stringify(verificationJSON)}</pre>`;
    }
});
