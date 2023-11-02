export async function _get(url: string, errorElementId: string | null): Promise<any> {
    const response = await fetch(url, {
        method: "GET",
        cache: "no-cache",
        credentials: "include",
        redirect: "follow",
    });

    if (response.status === 403) {
        if (errorElementId !== null) {
            document.getElementById(errorElementId).innerText = "access denied";
        }
        throw new Error("access denied. terminating.");
    } else if (response.status === 401) {
        window.location.href = "/login";
    } else if (response.status === 204) {
        if (errorElementId !== null) {
            document.getElementById(errorElementId).innerText = "no results";
        }
    } else if (!response.ok) {
        if (errorElementId !== null) {
            document.getElementById(errorElementId).innerText = "unhandled error";
        }
    }

    return response.json();
}
