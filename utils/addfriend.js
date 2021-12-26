const { mongoose } = require("../db/mongodb")
const { userMsgModel, idModelSchema } = require("../db/schema_model")
const { log } = console

/*
    @返回值为 {
        addfriend：boolean,
        why: number,
        adduserid: string
    }
    @ 其中， addfriend 确认添加好友是否成功， 成功返回true, 失败返回false
    @ 其中， why 返回失败原因， 0 是代表添加本身的账号， 1 是代表添加的用户不存在
    @ 2 是代表添加操作成功 3 是代表添加已经存在于自己好友列表的好友
    @ 其中， adduserid 是添加好友成功后返回好友的 userid
*/ 


async function addfriendHandle(friendname, myid) {
    let finduser = await findFriendUser(friendname, myid);
    // console.log(finduser)
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
                            adduserid: null
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
                        adduserid: adduserid
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
        let friendidModel = mongoose.model(adduserid, idModelSchema, adduserid)
        // 好友的数据库更新
        friendidModel.updateOne({ userid: adduserid }, { $push: { friendidarray: myid } }, (isPushErr, isPush) => {
            if (!isPushErr) {
                log(`好友数据库更新成功`)
                log(isPush)
            } else {
                log(`好友数据库更新失败,原因是: ${isPushErr}`)
            }
        })

        let idModel = mongoose.model(myid, idModelSchema, myid)
        // 自己的数据库更新
        idModel.updateOne({ userid: myid }, { $push: { friendidarray: adduserid } }, (isPushErr, isPush) => {
            if (!isPushErr) {
                log(`数据库更新成功`)
                log(isPush)
                resolve({
                    addfriend: true,
                    why: 2,
                    adduserid: adduserid
                })
            } else {
                log(`数据库更新失败,原因是: ${isPushErr}`)
            }
        })

    })
}

module.exports = addfriendHandle