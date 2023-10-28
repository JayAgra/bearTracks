const getCookie = (name: string): string => {
    var cookieString = RegExp(name + "=[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookieString ? cookieString.toString().replace(/^[^=]+./, "") : "");
}

if (getCookie("lead") === "true") {
    var url: HTMLElement = (document.getElementById("additionalUrl") as HTMLElement);
    url.style.display = "unset";
}