window.alreadySpun = false;
const spins = [10, 20, 50, -15, -25, -35,  -100, -50, 100, 250, -1000, 1250]
const waitMs = ms => new Promise(res => setTimeout(res, ms));
async function spinWheel() {
    if (window.alreadySpun) {} else {
        window.alreadySpun = true;
        document.getElementById('playBtn').style.display = "none";
        document.getElementById('backBtn').style.display = "none";
        
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `/api/casino/spinner/spinWheel`, true);
        xhr.withCredentials = true;

        xhr.onreadystatechange = async () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            const spinAPI = await JSON.parse(JSON.parse(xhr.responseText));
            const spin = spinAPI.spin;
            document.getElementById('wheel').className = "spinc" + spin;
            await waitMs(8015)
            if (spins[spin] > 0) {
                document.getElementById('result').innerHTML = 'You won ' +  Math.abs(spins[spin]) + ' points <br>'
            } else {
                document.getElementById('result').innerHTML = 'You lost ' +  Math.abs(spins[spin]) + ' points <br>'
            }
            document.getElementById('result').style.display = "inherit";
            document.getElementById('playBtn').style.display = "inherit";
            document.getElementById('backBtn').style.display = "inherit";
            window.alreadySpun = false;
        } else if (xhr.status === 401) {
            console.log("401 unauth")
            window.location.href = "/login";
            return "401";
        } else if (xhr.status === 400) {
            console.log("400 failure")
            return "400";
        } else if (xhr.status === 500) {
            console.log("500 failure")
            return "500";
        } else if (xhr.status === 403) {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                console.log("403 access denied");
                document.getElementById('result').innerHTML = 'You have a balance of under -2000 points, you cannot gamble!';
                document.getElementById('result').style.display = "inherit";
                throw new Error('unable to gamble');
            }
        } else {
            console.log("awaiting response")
        }
        }

        xhr.send()
    }
}
function goToHome() {
    window.location.href = "/points";
}