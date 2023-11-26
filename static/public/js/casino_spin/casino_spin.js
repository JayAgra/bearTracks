import { _get } from "../_modules/get/get.min.js";
window.alreadySpun = false;
const spins = [10, 20, 50, -15, -25, -35, -100, -50, 100, 250, -1000, 1250];
function unableToGamble() {
    document.getElementById("result").innerHTML = "You have a balance of under -2000 points, you cannot gamble!";
    document.getElementById("result").style.display = "inherit";
    throw new Error("unable to gamble");
}
async function spinWheel() {
    if (window.alreadySpun) { }
    else {
        window.alreadySpun = true;
        document.getElementById("playBtn").style.display = "none";
        document.getElementById("backBtn").style.display = "none";
        _get("/api/v1/casino/spin_thing", null).then(async (spinAPI) => {
            if (spinAPI.status === 0x1933) {
                unableToGamble();
            }
            else {
                const spin = spinAPI.spin;
                document.getElementById("wheel").className = "spinc" + spin;
                await new Promise((res) => setTimeout(res, 8015));
                if (spins[spin] > 0) {
                    document.getElementById("result").innerHTML = "You won " + Math.abs(spins[spin]) + " points <br>";
                }
                else {
                    document.getElementById("result").innerHTML = "You lost " + Math.abs(spins[spin]) + " points <br>";
                }
                document.getElementById("result").style.display = "inherit";
                document.getElementById("playBtn").style.display = "unset";
                document.getElementById("backBtn").style.display = "unset";
                window.alreadySpun = false;
            }
        }).catch(() => {
            unableToGamble();
        });
    }
}
window.spinWheel = spinWheel;
