export async function _post(url: string, errorElementId: string | null, dataObject: Object | null): Promise<any> {
    const response = await fetch(url, {
        method: "POST",
        cache: "no-cache",
        credentials: "include",
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
