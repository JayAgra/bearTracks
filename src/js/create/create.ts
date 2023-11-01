function displayErrors() {
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const error: string = urlParams.get("err");
    const errorEl: HTMLElement = document.getElementById("error") as HTMLElement;
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
                errorEl.innerHTML = "min password length is 8<br><br>";
                errorEl.style.display = "unset";
                break;
            case "3":
                errorEl.innerHTML = "invalid team join code<br><br>";
                errorEl.style.display = "unset";
            case undefined: default:
                break;
        }
        history.replaceState(null, "", window.location.origin + window.location.pathname);
    }
}