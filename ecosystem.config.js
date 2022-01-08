module.exports = {
  apps : [{
    name   : "swchat",
    script : "./index.js",
    cwd:"./",
    // instances : "max",
    // exec_mode : "cluster",
    watch: [  // 监控变化的目录，一旦变化，自动重启
      "utils",
      "db",
      "./index.js",
      "dist"
    ],
    ignore_watch : [  // 从监控目录中排除
      "node_modules", 
      "logs",
      "public",
      "assets",
    ],
    watch_options: {
      "followSymlinks": false
    },
    error_file : "./logs/app-err.log",  // 错误日志路径
    out_file   : "./logs/app-out.log",  // 普通日志路径
    env_production: {
      NODE_ENV: "production"
   },
   env_development: {
      NODE_ENV: "development"
   }
  }]
}
