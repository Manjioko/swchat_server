const fs = require('fs')

function isFileExisted(handleName) {
    return new Promise(function(resolve, reject) {
        fs.access(handleName, (err) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        })
    })
}

async function createDir(path) {
    let isExist = await isFileExisted(path)
    if(!isExist) {
        fs.mkdir(path, err => {
            if(!err) {
                console.log(`文件夹 '${path}' 创建成功!`)
            } else {
                console.log(`文件夹 '${path}' 创建失败,原因是: ${err}`)
            }
        })
    } else {
        console.log(`文件夹 ${path} 已经存在`)
    }
    
}

module.exports = createDir