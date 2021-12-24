// db
const { userMsgModel } = require("../db/mongodb")
// create unique id
const uniqueid = require("./uniqueid")

const { log } = console


module.exports = async function handleCreateUser(body) {

    let notHasUser = await findUser(body.username)
    // log(notHasUser)
    if (notHasUser.isTrue) {
        let newId = await findId()
        let userModel = body
        userModel.userid = newId
        return await createUser(userModel, newId)
    }

    return { id: notHasUser.id, create: false }
}

// 查看是否存在用户
function findUser(username) {
    return new Promise((resolve, reject) => {
        userMsgModel.find({ username: username }, (err, userIsExist) => {
            if (!err) {
                if (!userIsExist?.length) {
                    resolve({ isTrue: true, id: '' })
                } else {
                    log(`用户 ${username} 已经存在!`)
                    resolve({ isTrue: false, id: userIsExist[0].userid })
                }
            } else {
                reject(err)
            }
        })
    })
}


// 返回一个全新的id
function findId() {
    return new Promise(function findId_promise(resolve, reject) {
        let newUserId = uniqueid(16)
        userMsgModel.find({ userid: newUserId }, (err, idIsExist) => {
            if (!err) {
                if (!idIsExist?.length) {
                    log("ID 创建成功.")
                    resolve(newUserId)
                } else {
                    findId_promise(resolve, reject)
                }
            } else {
                console.log("createuser.js --> findId 错误")
                reject(err)
            }
        })
    })
}


function createUser(userModel, newId) {
    return new Promise((resolve, reject) => {
        userMsgModel.create(userModel, (createErr, doc) => {
            if (!createErr) {
                log(`用户'${userModel.username}'创建成功!`)
                log(doc)
                resolve({ id: newId, create: true })
            } else {
                console.log("createuser.js --> createUser 错误")
                reject(createErr)
                // log(createErr)
            }
        })
    })
}