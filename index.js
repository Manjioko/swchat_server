const express = require('express');
const path = require("path");
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');
const child = require("child_process");
// mqtt 服务器
const mosca = require('mosca')
// https
const { createServer } = require("https");
// https server
const httpsServer = createServer({
  key: fs.readFileSync('assets/swchat.xyz.key'),
  cert: fs.readFileSync('assets/swchat.xyz_bundle.crt')
}, app);

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


const ascoltatore = {
  //using ascoltatore
  type: 'mongo',
  url: 'mongodb://localhost:27017/mqtt',
  pubsubCollection: 'ascoltatori',
  mongo: {}
};

const moscaSettings = {
  port: 1884,
  backend: ascoltatore,
  persistence: {
    factory: mosca.persistence.Mongo,
    url: 'mongodb://localhost:27017/mqtt'
  },
};
// 启动MQTT服务器
const MQTTserver = new mosca.Server(moscaSettings);
// https websocket 化 mqtt
MQTTserver.attachHttpServer(httpsServer)


// MQTT操作
MQTTserver.on('ready', () => {
  console.log('Mosca MQTTserver is up and running on *:1884')
});

MQTTserver.on('clientDisconnected', function (client) {
  console.log('clientDisconnected: ', client.id);
});

MQTTserver.on('clientConnected', function (client) {
  console.log('client connected: ', client.id);
});

// fired when a message is received
MQTTserver.on('published', function (packet, client) {
  console.log('Published', packet.payload.toString());
});

MQTTserver.on("subscribed",function(topic,client) {
  console.log(`The ${client.id} has subscribed the topic: ${topic}`)
})

MQTTserver.on("unsubscribed",function(topic,client) {
  console.log(`The ${client.id} has *unSubscribed* the topic: ${topic}`)
})






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

// https
httpsServer.listen(6438, () => {
  console.log('https server is listening on *:6438');
});
