function displayErrors() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("err");
    const errorEl = document.getElementById("error");
    if (error) {
        switch (error) {
            case "0":
                errorEl.innerText = "500 internal server error";
                errorEl.style.display = "unset";
                break;
            case "1":
                errorEl.innerText = "email already in use";
                errorEl.style.display = "unset";
                break;
            case "2":
                errorEl.innerText = "min password length is 8";
                errorEl.style.display = "unset";
                break;
            case undefined: default:
                break;
        }
        history.replaceState(null, "", window.location.origin + window.location.pathname);
    }
}