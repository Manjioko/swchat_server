const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//连接数据库
mongoose.connect('mongodb://localhost:27017/test001', {
    useNewUrlParser: true
})

//监听数据库连接状态
mongoose.connection.once('open', () => {
    console.log('数据库连接成功...')
})
mongoose.connection.once('close', () => {
    console.log('数据库断开...')
})


//创建Schema对象（约束）
const userMsg = new Schema({
    username: String,
    password: String,
    userid: String
})



//将stuSchema映射到一个MongoDB collection并定义这个文档的构成
const userMsgModel = mongoose.model("usermsg", userMsg, "usermsg")
// const idHandleModel = mongoose.model("idhandle", idHandle, "idhandle")

//向student数据库中插入数据
// stuModle.create({
//     name:"小明",
//     age:"20",
//     addr:"天津"
// },(err,docs)=>{
//     if(!err){
//         console.log('插入成功'+docs)
//     }
// })

// stuModle.insertMany([{name:"小黄",age:12,addr:"beijing",gender:"female"},{name:"小芳",age:21, addr:"shanghai", gender:"female"}],(err,docs) => {
//     if(!err){
//          console.log(docs)
//      }
//  })

// stuModle.find((err,docs) => {
//     if(!err){
//          console.log(docs)
//      }
//  })




module.exports = {
    mongoose,
    Schema,
    userMsgModel
}