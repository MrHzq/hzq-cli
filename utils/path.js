const os = require("os");
const path = require("path");

// 获取不同操作系统的根目录
const root = () => os.homedir();

// 获取当前工作目录
const currCwdPath = () => process.cwd();

// 获取当前运行命令的目录
const currCmdPath = () => __dirname;

module.exports = { root, currCwdPath, currCmdPath };
