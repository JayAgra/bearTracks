export async function _get(url, errorElementId) {
    const response = await fetch(url, {
        method: "GET",
        cache: "no-cache",
        credentials: "include",
        redirect: "follow",
    });
    if (response.status === 403) {
        document.getElementById(errorElementId).innerText = "access denied";
        throw new Error("access denied. terminating.");
    } else if (response.status === 401) {
        window.location.href = "/login";
    } else if (response.status === 204) {
        document.getElementById(errorElementId).innerText = "no results";
    } else if (!response.ok) {
        document.getElementById(errorElementId).innerText = "unhandled error";
    }
    return response.json();
}
