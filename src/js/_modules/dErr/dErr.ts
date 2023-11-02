export function _dErr(errors: Array<string>) {
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const error: string = urlParams.get("err");
    const errorEl: HTMLElement = document.getElementById("error") as HTMLElement;
    if (error) {
        switch (error) {
            case "0":
                errorEl.innerHTML = errors[0] + "<br><br>";
                break;
            case "1":
                errorEl.innerHTML = errors[1] + "<br><br>";
                break;
            case "2":
                errorEl.innerHTML = errors[2] + "<br><br>";
                break;
            case "3":
                errorEl.innerHTML = errors[3] + "<br><br>";
            case undefined: default:
                break;
        }
        errorEl.style.display = "unset";
        history.replaceState(null, "", window.location.origin + window.location.pathname);
    }
}