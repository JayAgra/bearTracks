import { _get } from "../_modules/get/get.min.js"

(window as any).alreadySpun = false;
const spins: Array<number> = [10, 20, 50, -15, -25, -35,  -100, -50, 100, 250, -1000, 1250]
async function spinWheel() {
    if ((window as any).alreadySpun) {} else {
        (window as any).alreadySpun = true;
        (document.getElementById("playBtn") as HTMLButtonElement).style.display = "none";
        (document.getElementById("backBtn") as HTMLButtonElement).style.display = "none";
        _get("/api/v1/casino/spin_thing", null).then(async (spinAPI) => {
            const spin = spinAPI.spin;
            (document.getElementById("wheel") as HTMLImageElement).className = "spinc" + spin;
            await new Promise((res) => setTimeout(res, 8015));
            if (spins[spin] > 0) {
                (document.getElementById("result") as HTMLHeadingElement).innerHTML = "You won " +  Math.abs(spins[spin]) + " points <br>"
            } else {
                (document.getElementById("result") as HTMLHeadingElement).innerHTML = "You lost " +  Math.abs(spins[spin]) + " points <br>"
            }
            (document.getElementById("result") as HTMLHeadingElement).style.display = "inherit";
            (document.getElementById("playBtn") as HTMLButtonElement).style.display = "unset";
            (document.getElementById("backBtn") as HTMLButtonElement).style.display = "unset";
            (window as any).alreadySpun = false;
        }).catch(() => {});
    }
}

(window as any).spinWheel = spinWheel;