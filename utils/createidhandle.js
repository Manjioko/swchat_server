const { mongoose } = require("../db/mongodb")
const { idModelSchema } = require("../db/schema_model")
const { log } = console



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