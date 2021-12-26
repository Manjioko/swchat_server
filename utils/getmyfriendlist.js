const { idModelSchema,userMsgModel } = require("../db/schema_model")
const { mongoose } = require("../db/mongodb")

function getMyFriendList(id) {
    return new Promise((resolve,reject) => {
        let idModel = mongoose.model(id,idModelSchema,id)
        idModel.findOne({userid: id}, async (err, data) => {
            if(!err) {
                let friendList = data.friendidarray
                let userarr = []
                for (const fid of friendList) {
                    // console.log(fid)
                    let fdata = await finduser(fid)
                    console.log(fdata)
                    userarr.push({
                        username: fdata?.username ?? undefined,
                        userid: fdata?.userid ?? undefined,
                        avatar: `http://203.174.57.179:3000/public/${fdata?.userid}/avatar/${fdata?.userid}_avatar.jpg`
                    })

                }
                resolve(userarr)
            } else {
                console.log("getmyfriendlist.js --> err")
                reject(err)
            }
            
        })
    })
}

function finduser(userid) {
    return new Promise((resolve,reject) => {
        userMsgModel.findOne({userid: userid},(err,res) => {
            if(!err) {
                resolve(res)
            } else {
                console.log("getmyfriendlist.js finduser ----> err")
                reject(err)
            }
        })
    })
}

module.exports = getMyFriendList