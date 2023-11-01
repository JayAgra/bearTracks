function newSearch() {
    location.reload();
}

async function getData() {
    document.getElementById("viewData").innerHTML = "requesting...";
    var response, listRes: Array<{ "id": number }>;
    try {
        response = await fetch(`/api/manage/list`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });

        if (response.status === 403) {
            document.getElementById("viewData").innerHTML = "access denied";
        }

        if (response.status === 401) {
            window.location.href = "/login";
        }

        listRes = await response.json();
        var listHTML = "";
        for (var i = listRes.length - 1; i >= 0; i--) {
            listHTML = listHTML + `<fieldset><span><span>ID:&emsp;${listRes[i].id}</span>&emsp;&emsp;<span><a href="/detail?id=${listRes[i].id}" style="all: unset; color: #2997FF; text-decoration: none;">View</a>&emsp;<span onclick="deleteSubmission(${listRes[i].id}, 'main${listRes[i].id}')" style="color: red" id="main${listRes[i].id}">Delete</span></span></span></fieldset>`;
        }
        document.getElementById("resultsInsert").insertAdjacentHTML("afterbegin", listHTML);
        document.getElementById("search").style.display = "none";
        document.getElementById("results").style.display = "flex";       
    } catch (error) {
        console.log("failure")
        document.getElementById("viewData").innerHTML = "internal server error";
        console.error(error);
    }
}

async function deleteSubmission(submission: string, linkID: string) {
    document.getElementById(linkID).innerHTML = "Preparing Request...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/manage/${submission}/delete`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log(xhr.responseText);
            document.getElementById(linkID).innerHTML = "deleted!";
        } else if (xhr.status === 403) {
            document.getElementById(linkID).innerHTML = "access denied";
        } else if (xhr.status === 401) {
            window.location.href = "/login";
        } else if (xhr.status === 500) {
            document.getElementById(linkID).innerHTML = "500 bad request";
        } else {
            document.getElementById(linkID).innerHTML = "deleting...";
        }
    }
    xhr.send();
}