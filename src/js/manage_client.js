var currenturl = window.location.href;
var URL = new URL(currenturl);
function removeURLParams() {
    let url = new URL(location.href)
    let urlparams = new URLSearchParams(url.search);
    urlparams.delete('team');
    urlparams.delete('page');
    urlparams.delete('event');
    location.reload();
}
function goToHome() {
    window.location.href = "/";
}
function deleteFormSubmission() {
    const targetSubmission = URL.searchParams.get('submissionID'); 
    window.location.href = "/deleteSubmission?submissionID=" + targetSubmission;
}
function deleteSubmission(database, submission, linkID) {
    document.getElementById(linkID).innerHTML = "Preparing Request...";
    const xhr = new XMLHttpRequest();
    xhr.open("POST", '/deleteSubmission', true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        console.log("done")
        document.getElementById(linkID).innerHTML = "Deleted!";
    } else if (xhr.status === 401) {
        console.log("failure")
        document.getElementById(linkID).innerHTML = "401 Access Denied";
    } else if (xhr.status === 400) {
        console.log("failure")
        document.getElementById(linkID).innerHTML = "400 Bad Request";
    } else {
        console.log("awaiting response")
        document.getElementById(linkID).innerHTML = "Deleting...";
    }
    }
    xhr.send('db=' + database + '&submissionID=' + submission);
}