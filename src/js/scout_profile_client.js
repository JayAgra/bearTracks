function goToHome() {
    history.back();
}
async function getTeamRanks() {
    document.getElementById("viewScoutsButton").innerHTML = "Requesting Data...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/scouts/me/profile`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            const APIData = JSON.parse(xhr.responseText);
            console.log(APIData);
        } else if (xhr.status === 401 || xhr.status === 403) {
            window.location.href = "/login";
        } else if (xhr.status === 400) {
            document.getElementById("viewScoutsButton").innerHTML = "bad request";
        } else if (xhr.status === 500) {
            document.getElementById("viewScoutsButton").innerHTML = "internal server error";
        } else {
            document.getElementById("viewScoutsButton").innerHTML = "downloading data...";
        }
    }

    xhr.send()
}