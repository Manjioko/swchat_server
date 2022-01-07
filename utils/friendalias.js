const { mongoose } = require("../db/mongodb")
const { idModelSchema } = require("../db/schema_model")
const { log } = console



function friendAlias(myid, clientid, alias) {
    return new Promise((resolve, reject) => {
        let idModel = mongoose.model(myid, idModelSchema, myid)
        idModel.findOne({ friendidarray: { $elemMatch: { $eq: clientid } } }, (err, hasFriend) => {
            if (!err) {
                let isExist = hasFriend?.alias?.some(e => e.clientid === clientid)
                if (!isExist) {
                    // 不存在就创建一个
                    hasFriend?.alias?.push({
                        clientid: clientid,
                        alias: alias
                    })
                    hasFriend.save()
                    log("添加好友备注成功")
                    resolve(true)
                } else {
                    // 存在就更新alias
                    hasFriend?.alias?.forEach(e => {
                        if (e.clientid === clientid) {
                            e.alias = alias
                            hasFriend.save()
                            log("好友备注更新成功")
                            resolve(true)
                        }
                    })
                }

            } else {
                log("friendalias.js --> friendAlias hasFriend err")
                log(err)
                resolve(false)
            }
        })
    })
}


module.exports = friendAlias