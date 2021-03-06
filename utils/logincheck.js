// db
const { userMsgModel } = require("../db/schema_model")
const { log } = console

function loginChecked(name,pw) {
    return new Promise((resolve,reject) => {
        userMsgModel.find({ username: name,password:pw }, (err, isCorrect) => {
            if (!err) {
                if (isCorrect?.length) {
                    log(`用户 ${name} 账号密码正确`)
                    resolve(true)
                } else {
                    log(`用户 ${name} 账号或密码错误`)
                    resolve(false)
                }
            } else {
                console.log("logincheck.js --> loginChecked 错误")
                reject(err)
            }
        })
    })
}

module.exports = loginChecked