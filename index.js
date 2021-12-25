const express = require('express');
const path = require("path");
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const multer = require('multer');
const child = require("child_process");
const fs = require('fs')
const { Server } = require("socket.io");

// 用户头像压缩
const handlePicture = require("./utils/mediahandle")
// 创建用户
const createUser = require("./utils/createuser")
// 创建文件夹
const fileHandle = require("./utils/filehandle")
// 创建用户ID表
const createIdModel = require("./utils/createidhandle")
// 查验账号密码正确与否
const logincheck = require("./utils/logincheck")
// 查找好友
const addfriend = require("./utils/addfriend")

const { log } = console


// websocket 允许跨域
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});



app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, 'dist')));
app.use('/public', express.static(path.join(__dirname, 'public')));

//设置允许跨域访问该服务.
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  // res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

// 返回web app
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});

// 登陆注册
app.post("/registerandlogin", async (req, res) => {
  // 如果数据库没有该用户,就创建一个新用户
  let usermsg = await createUser(req.body)
  if (usermsg.create) {
    // 创建新用户ID表
    createIdModel({userid: usermsg.id})
    // 在public下创建相应的id文件夹
    await fileHandle(`public/${usermsg.id}`)
    await fileHandle(`public/${usermsg.id}/avatar`)
    await fileHandle(`public/${usermsg.id}/image`)
    await fileHandle(`public/${usermsg.id}/video`)
    res.send({
      success: true,
      userid: usermsg.id
    })
  } else {
    let {username,password} = req.body
    let isCorrect = await logincheck(username,password)
    res.send({
      success: false,
      userid: usermsg.id,
      check:true,
      correct:isCorrect
    })
  }
})

app.post("/getfriend",(req,res) => {
  console.log("get friend:")
  console.log(req.body)
  let {friendname,userid } = req.body
  addfriend(friendname,userid)
  res.send("ok")
})

// 测试所需
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public');
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`)
  }
})
const upload = multer({ storage: storage });

// 测试
app.post('/test', upload.single('key'), async (req, res) => {
  if (req?.file?.path) {
    let isfail = await handlePicture(req.file.path)
    let path;
    if (!isfail) {
      path = "http://47.242.27.76:3000/" + req.file.path
    }
    res.json({
      success: !isfail ? true : false,
      path: path ? path : ''
    })
  }
});


io.on('connection', (socket) => {
  log('a user connected');
  socket.join("testRoom0");
  socket.on("otherSendMsg", (msg) => {
    log(msg)
    // socket.broadcast.emit("otherSendMsg",msg)
    socket.to("testRoom0").emit("otherSendMsg", msg)
  })
});


server.listen(3000, () => {
  log('http server is listening on *:3000');
});