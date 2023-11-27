export async function _post(url, errorElementId, dataObject) {
    const response = await fetch(url, {
        method: "POST",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(dataObject),
    });
    if (response.status === 403) {
        if (errorElementId !== null) {
            document.getElementById(errorElementId).innerText = "access denied";
        }
        throw new Error("access denied. terminating.");
    }
    else if (response.status === 401) {
        window.location.href = "/login";
    }
    else if (response.status === 204) {
        if (errorElementId !== null) {
            document.getElementById(errorElementId).innerText = "no results";
        }
    }
    return response.json();
}
