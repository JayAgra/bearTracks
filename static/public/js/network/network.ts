window.addEventListener("load", () => {
    checkNetwork(navigator.onLine);
    window.addEventListener("online", () => { checkNetwork(true); });
    window.addEventListener("offline", () => { checkNetwork(false); });
});

function checkNetwork(online: boolean) {
    if (!online) document.getElementById("offlineAlert").style.display = "inline";
}