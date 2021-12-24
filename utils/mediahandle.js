const { spawn, exec } = require("child_process");
const fs = require('fs')


function handlePicture(path, res) {
    return new Promise((resolve, reject) => {
        let ff = spawn('ffmpeg', ["-y", "-i", path, "-vf", "scale='400:400'", "-q", "9", path])

        ff.stdout.on("data", (data) => {
            console.log(`stdout: ${data}`);
        });

        ff.stderr.on("data", (data) => {
            // console.error(`stderr: ${data}`);
            let msg = data.toString();
            // if(msg.includes("Input") || msg.includes("Output"))
            console.log(msg);
        });

        ff.on("close", (code) => {
            console.log(`子进程退出，退出码 ${code}`);
            resolve(code)
        });
    })
}

module.exports = handlePicture;