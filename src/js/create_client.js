function displayErrors() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("err");
    const errorEl = document.getElementById("error");
    if (error) {
        switch (error) {
            case "0":
                errorEl.innerHTML = "500 internal server error<br><br>";
                errorEl.style.display = "unset";
                break;
            case "1":
                errorEl.innerHTML = "email already in use<br><br>";
                errorEl.style.display = "unset";
                break;
            case "2":
                errorEl.innerHTML = "min password length is 12<br><br>";
                errorEl.style.display = "unset";
                break;
            case undefined: default:
                break;
        }
        history.replaceState(null, "", window.location.origin + window.location.pathname);
    }
}