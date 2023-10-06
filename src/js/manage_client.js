function newSearch() {
    location.reload();
}

function goToHome() {
    window.location.href = "/";
}

function mainOrPitLink() {
    if (document.getElementById("db").value === "pit") {
        return "pitimages";
    } else {
        return "detail";
    }
} 

function getData() {
    document.getElementById("viewData").innerHTML = "Preparing Request...";

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/manage/${document.getElementById("db").value}/list`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("got list");
            document.getElementById("viewData").innerHTML = "generating list...";
            const dbQueryResult = JSON.parse(xhr.responseText);
            var listHTML = "";
            for (var i = dbQueryResult.length - 1; i >= 0; i--) {
                listHTML = listHTML + `<fieldset style="background-color: "><span><span>ID:&emsp;${dbQueryResult[i].id}</span>&emsp;&emsp;<span><a href="/${mainOrPitLink()}?id=${dbQueryResult[i].id}" style="all: unset; color: #2997FF; text-decoration: none;">View</a>&emsp;<span onclick="deleteSubmission('${document.getElementById("db").value}', ${dbQueryResult[i].id}, '${document.getElementById("db").value}${dbQueryResult[i].id}')" style="color: red" id="${document.getElementById("db").value}${dbQueryResult[i].id}">Delete</span></span></span></fieldset>`;
            }
            document.getElementById("results").insertAdjacentHTML("afterbegin", listHTML);
            document.getElementById("search").style.display = "none";
            document.getElementById("results").style.display = "flex";
        } else if (xhr.status === 403) {
            console.log("failure")
            document.getElementById("viewData").innerHTML = "403 access denied";
        } else if (xhr.status === 500) {
            console.log("failure")
            document.getElementById("viewData").innerHTML = "500 internal server error";
        } else {
            console.log("awaiting response")
            document.getElementById("viewData").innerHTML = "downloading list...";
        }
    }
    xhr.send();
}

function deleteSubmission(database, submission, linkID) {
    document.getElementById(linkID).innerHTML = "Preparing Request...";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/manage/${database}/${submission}/delete`, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log(xhr.responseText);
            document.getElementById(linkID).innerHTML = "deleted!";
        } else if (xhr.status === 403) {
            console.log("failure")
            document.getElementById(linkID).innerHTML = "403 access denied";
        } else if (xhr.status === 500) {
            console.log("failure")
            document.getElementById(linkID).innerHTML = "500 bad request";
        } else {
            console.log("awaiting response")
            document.getElementById(linkID).innerHTML = "deleting...";
        }
    }
    xhr.send();
}