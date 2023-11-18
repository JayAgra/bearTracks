const getCookie = (name) => {
    var cookieString = RegExp(name + "=[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookieString ? cookieString.toString().replace(/^[^=]+./, "") : "");
};
if (getCookie("lead") === "true") {
    var url = document.getElementById("additionalUrl");
    url.style.display = "unset";
}
else if (Number(getCookie("childTeamLead")) !== 0) {
    var url = document.getElementById("additionalUrl2");
    url.style.display = "unset";
}
