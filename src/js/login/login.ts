function displayLoginErrors() {
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const error: string = urlParams.get("err") as string;
    const errorEl: HTMLElement = (document.getElementById("error") as HTMLElement)
    if (error) {
        switch (error) {
            case "0":
                errorEl.innerHTML = "500 internal server error<br><br>";
                errorEl.style.display = "unset";
                break;
            case "1":
                errorEl.innerHTML = "bad email/password<br><br>";
                errorEl.style.display = "unset";
                break;
            case "2":
                errorEl.innerHTML = "account not yet approved by an admin<br><br>";
                errorEl.style.display = "unset";
                break;
            case undefined: default:
                break;
        }
        history.replaceState(null, "", window.location.origin + window.location.pathname);
    }
}