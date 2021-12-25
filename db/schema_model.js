const { Schema, mongoose } = require("./mongodb")

// 用户登陆信息结构
const userMsgSchema = new Schema({
    username: String,
    password: String,
    userid: String
})

//将stuSchema映射到一个MongoDB collection并定义这个文档的构成
const userMsgModel = mongoose.model("usermsg", userMsgSchema, "usermsg")


// 用户id表结构
const idModelSchema = new Schema({
    userid: String,
    friendidarray: {
        type: [String],
        default: []
    },
    chat: {
        type: [{
            roomid: String,
            userid: String,
            clientid: String,
            time: Number,
            content: String,
            self: Boolean
        }],
        default: []
    },
})


module.exports = {
    userMsgModel, // 用户登陆模型
    idModelSchema, // id表结构
}