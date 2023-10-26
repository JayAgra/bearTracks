window.addEventListener("load", () => {
    checkNetwork(navigator.onLine);

    window.addEventListener("online", () => {
        checkNetwork(true);
    });

    window.addEventListener("offline", () => {
        checkNetwork(false);
    });
});
function checkNetwork(online) {
    const alert = document.getElementById("offlineAlert");
    if (online) {
    } else {
        alert.style.display = "inline"
    }
}