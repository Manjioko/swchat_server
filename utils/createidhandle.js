const { Schema, mongoose } = require("../db/mongodb")

const { log } = console


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

const chatMsg = new Schema({
    roomid: String,
    userid: String,
    clientid: String,
    time: Number,
    content: String,
    self: Boolean
})


function createIdModel(model) {
    let idModel = mongoose.model(model.userid, idModelSchema, model.userid)
    idModel.create(model, (err, doc) => {
        if (!err) {
            log(`${model.userid} 表已经创建成功`)
        } else {
            log(`${model.userid} 表创建失败,原因是: ${err}`)
        }
    })
}


module.exports = createIdModel