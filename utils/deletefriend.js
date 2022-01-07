const { mongoose } = require("../db/mongodb")
const { userMsgModel, idModelSchema } = require("../db/schema_model")
const { log } = console



function deleteFriend(myid, clientid) {
    return new Promise((resolve, reject) => {
        let idModel = mongoose.model(myid, idModelSchema, myid)
        idModel.findOne({ friendidarray: { $elemMatch: { $eq: clientid } } }, (err, hasFriend) => {
            if (!err) {
                hasFriend?.updateOne({ $pull: { friendidarray: clientid } }, (updateErr, data) => {
                    if (!updateErr) {
                        resolve(true)
                        console.log("删除好友成功")
                    } else {
                        log("deletefriend.js --> updateOne err")
                        log(updateErr)
                        resolve(false)
                    }
                })
            } else {
                log("deletefriend.js --> deleteFriend err")
                log(err)
                resolve(false)
            }
        })
    })
}


module.exports = deleteFriend