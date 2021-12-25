const { mongoose } = require("../db/mongodb")
const { userMsgModel, idModelSchema } = require("../db/schema_model")
const { log } = console




async function addfriendHandle(friendname, myid) {
    let finduser = await findFriendUser(friendname, myid);
    console.log(finduser)
    if (finduser?.addfriend) {
        let adduserid = finduser.adduserid
        let friendArr = await findMyFriendArray(myid, adduserid,friendname)
        if(friendArr.addfriend) {
            let result = await updateFriendArray(myid, adduserid)
            return result
        }
        return friendArr
    }
    return finduser
}
function findFriendUser(friendname, myid) {
    return new Promise((resolve, reject) => {
        userMsgModel.find({ username: friendname }, (err, isExisted) => {
            if (!err) {
                if (isExisted.length) {
                    log(`用户 ${friendname} 已查找到:`)
                    log(isExisted[0])
                    let adduserid = isExisted[0].userid
                    if (adduserid === myid) {
                        resolve({
                            addfriend: false,
                            // 0 代表加的是自己
                            why: 0,
                            adduserid: adduserid
                        })
                    }
                    resolve({
                        addfriend: true,
                        // 2 代表正常流程
                        why: 2,
                        adduserid: adduserid
                    })

                } else {
                    log(`用户 ${friendname} 不存在`)
                    resolve({
                        addfriend: false,
                        // 1 代表该用户不存在
                        why: 1,
                        adduserid: null
                    })
                }
            } else {
                log("addfriend.js --> findFriendUser err")
                log(err)
            }
        })
    })
}

function findMyFriendArray(myid,adduserid,friendname) {
    return new Promise((resolve, reject) => {
        let idModel = mongoose.model(myid, idModelSchema, myid)
        idModel.find({ friendidarray: { $elemMatch: { $eq: adduserid } } }, (err, hasFriend) => {
            if (!err) {
                if (!hasFriend.length) {

                    resolve({
                        addfriend: true,
                        why: 2,
                        adduserid: null
                    })
                    
                } else {
                    log(`${friendname} 之前已经存在好友列表中:${hasFriend[0]}`)
                    resolve({
                        addfriend: false,
                        // 3 用户已经存在
                        why: 3,
                        adduserid: null
                    })
                }
            } else {
                log("addfriend.js --> findMyFriendArray err")
                log(err)
            }
        })
    })
}

function updateFriendArray(myid,adduserid) {
    return new Promise((resolve,reject) => {
        let idModel = mongoose.model(myid, idModelSchema, myid)
        // 自己的数据库更新
        idModel.update({ userid: myid }, { $push: { friendidarray: adduserid } }, (isPushErr, isPush) => {
            if (!isPushErr) {
                log(`数据库更新成功${isPush[0]}`)
                resolve({
                    addfriend: true,
                    why: 2,
                    adduserid: adduserid
                })
            } else {
                log(`数据库更新失败,原因是: ${isPushErr}`)
            }
        })

        // 好友的数据库更新
        idModel.update({ userid: adduserid }, { $push: { friendidarray: myid } }, (isPushErr, isPush) => {
            if (!isPushErr) {
                log(`好友数据库更新成功${isPush[0]}`)
                resolve({
                    addfriend: true,
                    why: 2,
                    adduserid: adduserid
                })
            } else {
                log(`好友数据库更新失败,原因是: ${isPushErr}`)
            }
        })
    })
}

module.exports = addfriendHandle