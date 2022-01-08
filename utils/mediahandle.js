const { spawn, exec } = require("child_process");
const fs = require('fs')


function handlePicture(path, userid) {
    return new Promise((resolve, reject) => {
        let newFilePath = `./public/${userid}/avatar/${userid}_avatar.jpg`
        console.log(`new file path is : ${newFilePath}`)
        let ff = spawn('ffmpeg', ["-y", "-i", path, "-vf", "scale='400:400'", "-q", "9", newFilePath])

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
            try {
                fs.unlink(path, (err) => {
                    if (err)
                        console.log(err)
                })
            } catch {
                console.log("删除缓存文件失败")
            }
            console.log(`子进程退出，退出码 ${code}`);
            resolve(code)
        });
    })
}

module.exports = handlePicture;