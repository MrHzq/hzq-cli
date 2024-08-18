const os = require("os");

// 获取不同操作系统的根目录
const root = () => os.homedir();

module.exports = { root };
