const getCookie = (name) => {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=')
      return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, '')
}

if (getCookie("lead") === "true") {
    var url = document.getElementById("additionalUrl");
    url.style.display = "unset";
}