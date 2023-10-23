function goToHome() {
    window.location.href = "/";
}

async function getData() {
    var response, listRes;
    try {
        response = await fetch(`/api/scouts/transactions/me`, {
            method: "GET",
            credentials: "include",
            redirect: "follow",
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }

        if (response.status === 204) {
            document.getElementById("preInsert").insertAdjacentHTML("afterend", '<tr class="padded"><td>no data</td><td>no data</td></tr>');  
            return;
        }

        const types = {
            "2457": "form submission",
            "4096": "main form submission",
            "4097": "pit form submission",
            "5273": "gambling",
            "5376": "spin thing",
            "5377": "slots",
            "5378": "blackjack",
            "6553": "admin modification",
            "8192": "bad main form data",
            "8193": "bad pit form data",
            "8194": "score reset"
        }
        listRes = await response.json();
        var listHTML = "";
        for (var i = 0; i < listRes.length; i++) {
            listHTML += `<tr class="padded"><td>${types[String(listRes[i].type)]}</td><td>${listRes[i].amount}</td></tr>`;
        }
        document.getElementById("preInsert").insertAdjacentHTML("afterend", listHTML);  
    } catch (error) {
        console.log("failure")
        window.location.href = "/login";
    }
}