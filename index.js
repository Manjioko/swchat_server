const express = require('express');
const path = require("path");
const app = express();
// http
// const http = require('http');
// const server = http.createServer(app);

// https
const { createServer } = require("https");

const bodyParser = require('body-parser');
const multer = require('multer');
const child = require("child_process");
const fs = require('fs')
const { Server } = require("socket.io");

// https
const httpsServer = createServer({
  key: fs.readFileSync('assets/swchat.xyz.key'),
  cert: fs.readFileSync('assets/swchat.xyz_bundle.crt')
}, app);

// websocket 允许跨域 http
// const io = new Server(server, {
//   cors: {
//     origin: '*'
//   }
// });

// websocket 允许跨域 https
const io = new Server(httpsServer, {
  cors: {
    origin: '*'
  }
});

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
// 获取好友列表
const friendlist = require("./utils/getmyfriendlist")
// 删除好友
const deletefriend = require('./utils/deletefriend')
// 添加好友备注
const friendalias = require('./utils/friendalias')
const { log } = console

const chatTmp = {}




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
    createIdModel({ userid: usermsg.id })
    // 在public下创建相应的id文件夹
    await fileHandle(`public/${usermsg.id}`)
    await fileHandle(`public/${usermsg.id}/avatar`)
    await fileHandle(`public/${usermsg.id}/image`)
    await fileHandle(`public/${usermsg.id}/video`)
    fs.writeFileSync(`public/${usermsg.id}/avatar/${usermsg.id}_avatar.jpg`, fs.readFileSync('public/default_avatar.jpg'))
    res.send({
      success: true,
      userid: usermsg.id
    })
  } else {
    let { username, password } = req.body
    let isCorrect = await logincheck(username, password)
    res.send({
      success: false,
      userid: usermsg.id,
      check: true,
      correct: isCorrect
    })
  }
})

app.post("/getfriend", async (req, res) => {
  let { friendname, userid } = req.body
  let addfriendResult = await addfriend(friendname, userid)
  res.send(addfriendResult)
})

app.post("/removefriend", async (req, res) => {
  // console.log(req.body)
  let myid = req.body.userid
  let clientid = req.body.clientid
  let isSucess = await deletefriend(myid, clientid)
  res.send(isSucess)
})

app.post("/remarkfriend", async (req, res) => {
  // console.log(req.body)
  let { clientid, clientAlias, userid } = req.body
  let isSucess = await friendalias(userid, clientid, clientAlias)
  res.send(isSucess)
})

app.post("/getmyfriendlist", async (req, res) => {
  let { userid } = req.body
  let result = ''
  if (userid) {
    // log(userid)
    result = await friendlist(userid)
  }
  res.send(result)
})


// 测试所需
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(req.body)
    cb(null, './public/tmp');
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`)
  }
})
// console.log(storage)
const upload = multer({ storage: storage });

// 测试
app.post('/test', upload.single('key'), async (req, res) => {
  log(req.file)
  // log(req.files)
  log(req.body.userid)
  if (req?.file?.path) {
    let isfail = await handlePicture(req.file.path, req.body.userid)
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


// websocket 接入入口
io.on('connection', async (socket) => {
  log('a user connected');

  // 上线后将所有好友加入私人聊天室
  let userid = socket.handshake.query.userid
  console.log(userid)
  // 查找好友列表
  let list = await friendlist(userid)
  for (const l of list) {
    let roomid = userid > l.userid ? userid + l.userid : l.userid + userid
    // 加入私人房间
    socket.join(roomid)
    // log("join to " + roomid)
  }

  socket.on("getDisconnectChatMsg", isGet => {
    console.log("getDisconnectChatMsg")
    if (isGet) {
      // 上线后发送缓存在服务器上的聊天记录
      if (chatTmp[userid]) {
        let chatArr = chatTmp[userid]
        // log(chatArr)
        setTimeout(() => {
          for (const chatBox of chatArr) {
            socket.emit("testreconnect", chatBox, (getReturn) => {
              if (getReturn) {
                log("收到 " + getReturn)
              } else {
                log("没收到")
              }
            })
          }
        }, 5000);

        // 删除缓存区
        delete chatTmp[userid]
      }
    }
  })


  // 私人聊天处理平台
  socket.on("privateChat", (data, cb) => {
    console.log(data)
    // chatTmp[data.clientid] 存在,证明 clientid 已经离线了
    if (chatTmp[data.clientid]) {
      // 离线存储在服务器中
      chatTmp[data.clientid].push(data)
    } else {
      // 在线则直接发送
      socket.to(data.roomid).emit("privateChatWithOther", data)
    }
    cb("privateChat success get data.")
  })

  // 监听离线,如果离线就创建一个缓存区存放聊天记录
  socket.on("disconnecting", () => {
    console.log(socket.handshake.query.userid + " disconnected")
    let userid = socket.handshake.query.userid
    chatTmp[userid] = []
  })

  // 创建私聊房间
  // socket.on("createPrivateChatRoom", roomidArr => {
  //   if (roomidArr) {
  //     for (const id of roomidArr) {
  //       console.log(`join to ${id}`)
  //       socket.join(id)
  //     }
  //   }
  // })

  // 离开私聊房间
  // socket.on("deletePrivateChatRoom", data => {
  //   console.log("leave from " + data.roomid)
  // })

});

//http
// server.listen(3000, () => {
//   log('http server is listening on *:3000');
// });

// https
httpsServer.listen(3000, () => {
  log('https server is listening on *:3000');
});