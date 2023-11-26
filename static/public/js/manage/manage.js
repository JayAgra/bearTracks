import { _get } from "../_modules/get/get.min.js";
import { _delete } from "../_modules/delete/delete.min.js";
function newSearch() {
    location.reload();
}
async function getSubmissionData() {
    document.getElementById("viewData").innerHTML = "requesting...";
    _get("/api/v1/manage/submission_ids/false", "viewData").then((response) => {
        var listHTML = "";
        for (var i = response.length - 1; i >= 0; i--) {
            listHTML = listHTML + `<fieldset><span><span>ID:&emsp;${response[i].Id.id}</span>&emsp;&emsp;<span><a href="/detail?id=${response[i].Id.id}" style="all: unset; color: #2997FF; text-decoration: none;">View</a>&emsp;<span onclick="deleteSubmission(${response[i].Id.id}, 'main${response[i].Id.id}')" style="color: red" id="main${response[i].Id.id}">Delete</span></span></span></fieldset>`;
        }
        document.getElementById("resultsInsert").insertAdjacentHTML("afterbegin", listHTML);
        document.getElementById("search").style.display = "none";
        document.getElementById("results").style.display = "flex";
    }).catch((err) => console.log(err));
}
async function deleteSubmission(submission, linkID) {
    document.getElementById(linkID).innerHTML = "deleting...";
    _delete(`/api/v1/manage/delete/${submission}`, linkID).then((response) => {
        if (response.status === 0xc83) {
            document.getElementById(linkID).innerHTML = "deleted!";
        }
        else if (response.status === 0x1f42) {
            document.getElementById(linkID).innerHTML = "server error";
        }
        else if (response.status === 0x1930) {
            document.getElementById(linkID).innerHTML = "forbidden";
        }
    }).catch((err) => console.log(err));
}
window.newSearch = newSearch;
window.getSubmissionData = getSubmissionData;
window.deleteSubmission = deleteSubmission;
