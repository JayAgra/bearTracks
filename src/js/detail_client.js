function removeURLParams() {
    window.location.href = "/detail"
}
function pageControl(dir) {
    if (dir == "fwd") {
        let params = new URLSearchParams(document.location.search);
        let url = new URL(location.href);
        const targetPage = Number(params.get('page')) +1
        url.searchParams.delete('page');
        url.searchParams.append('page', targetPage);
        // deepcode ignore OR: ignored because it is on client and clients fault and I dont care
        window.location.href = url;
    } else if (dir == "bck") {
        let params = new URLSearchParams(document.location.search);
        if (params.get('page') >= 1) {
            let url = new URL(location.href);
            var targetPage = Number(params.get('page')) - 1
            url.searchParams.delete('page');
            url.searchParams.append('page', targetPage);
            // deepcode ignore OR: ignored because it is on client and clients fault and I dont care
            window.location.href = url;
        } else {
            location.reload()
        }
    }
}
function goToHome() {
    window.location.href = "/";
}