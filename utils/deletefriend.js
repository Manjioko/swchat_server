const { mongoose } = require("../db/mongodb")
const { idModelSchema } = require("../db/schema_model")
const { log } = console



function deleteFriend(myid, clientid) {
    return new Promise(async (resolve, reject) => {
        // 从我的好友列表中删除
        let myremove = await removeFriendFromFriendList(myid,clientid)
        // 从好友的好友列表中删除
        let clientremove = await removeFriendFromFriendList(clientid,myid)
        if(myremove && clientremove)
            resolve(true)
        else 
            resolve(false)
    })
}

function removeFriendFromFriendList(myid, clientid) {
    return new Promise((resolve, reject) => {
        let idModel = mongoose.model(myid, idModelSchema, myid)
        idModel.findOne({ friendidarray: { $elemMatch: { $eq: clientid } } }, (err, hasFriend) => {
            if (!err) {
                hasFriend?.updateOne({ $pull: { friendidarray: clientid } }, (updateErr, data) => {
                    if (!updateErr) {
                        resolve(true)
                        log("删除好友成功")
                    } else {
                        log("deletefriend.js --> removeFriendFromFriendList_updateOne err")
                        log(updateErr)
                        resolve(false)
                    }
                }) ?? log("好友不存在")
            } else {
                log("deletefriend.js --> removeFriendFromFriendList err")
                log(err)
                resolve(false)
            }
        })
    })
}


module.exports = deleteFriend