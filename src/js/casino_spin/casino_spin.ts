(window as any).alreadySpun = false;
const spins: Array<number> = [10, 20, 50, -15, -25, -35,  -100, -50, 100, 250, -1000, 1250]

async function spinWheel() {
    if ((window as any).alreadySpun) {} else {
        (window as any).alreadySpun = true;
        (document.getElementById('playBtn') as HTMLButtonElement).style.display = "none";
        (document.getElementById('backBtn') as HTMLButtonElement).style.display = "none";
        
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open("GET", `/api/casino/spinner/spinWheel`, true);
        xhr.withCredentials = true;

        xhr.onreadystatechange = async () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                const spinAPI = await JSON.parse(JSON.parse(xhr.responseText));
                const spin = spinAPI.spin;
                (document.getElementById('wheel') as HTMLImageElement).className = "spinc" + spin;
                await new Promise((res) => setTimeout(res, 8015));
                if (spins[spin] > 0) {
                    (document.getElementById('result') as HTMLHeadingElement).innerHTML = 'You won ' +  Math.abs(spins[spin]) + ' points <br>'
                } else {
                    (document.getElementById('result') as HTMLHeadingElement).innerHTML = 'You lost ' +  Math.abs(spins[spin]) + ' points <br>'
                }
                (document.getElementById('result') as HTMLHeadingElement).style.display = "inherit";
                (document.getElementById('playBtn') as HTMLButtonElement).style.display = "unset";
                (document.getElementById('backBtn') as HTMLButtonElement).style.display = "unset";
                (window as any).alreadySpun = false;
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
            } else if (xhr.status === 403 && xhr.responseText == String(0x1933)) {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    console.log("403 access denied");
                    (document.getElementById('result') as HTMLHeadingElement).innerHTML = 'You have a balance of under -2000 points, you cannot gamble!';
                    (document.getElementById('result') as HTMLHeadingElement).style.display = "inherit";
                    throw new Error('unable to gamble');
                }
            } else {
                console.log("awaiting response")
            }
        }

        xhr.send()
    }
}