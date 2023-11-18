const elemBegin = document.getElementById("createPk");
const elemSuccess = document.getElementById("success");
const elemError = document.getElementById("error");
elemBegin.addEventListener("click", async () => {
    elemSuccess.innerHTML = "";
    elemError.innerHTML = "";
    
    const resp = await fetch("/api/auth/createPasskey");
    let attResp;
    // await _get("/api/auth/createPasskey", "error").then(async (response) => {
    //     attResp = await SimpleWebAuthnBrowser.startRegistration(response);
    // }).catch((error) => {
    //     if (error.name === "InvalidStateError") {
    //         elemError.innerText = "already registered authenticator";
    //     } else {
    //         elemError.innerText = error;
    //     }
    //     throw new Error("no passkey");
    // });
    try {
        attResp = await SimpleWebAuthnBrowser.startRegistration(await resp.json());
    } catch (error) {
        if (error.name === "InvalidStateError") {
            elemError.innerText = "you probably already registered this authenticator";
        } else {
            elemError.innerText = error;
        }
        throw error;
    }

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
        alert("passkey successfully registered");
    }
    else {
        elemSuccess.innerHTML = `error<br><br><pre>${JSON.stringify(verificationJSON)}</pre>`;
    }
});
