const fs = require("fs-extra");

// 检查文件是否存在
const checkFileExist = (p) => fs.existsSync(p);

// 同步读取文件内容
const readFileSync = (p, c = "utf-8") =>
  checkFileExist(p) ? fs.readFileSync(p, c) : "";

// 同步读取文件内容 && \n 格式化
const readFileSyncFormat = (p, sp = "\n") => readFileSync(p).split(sp);

// 同步写入文件内容
const writeFileSync = (p, text, c = "utf-8") => fs.writeFileSync(p, text, c);

// 递归创建文件夹
const mkdirSync = (p, recursive = true) => fs.mkdirSync(p, { recursive });

// 删除文件夹 & 子文件
const removeDir = (p) => {
  if (checkFileExist(p)) return fs.removeSync(p);
  else return `${p} 文件不存在`;
};

// 复制文件夹
const copyDir = (s, t, recursive = true) => fs.copy(s, t, { recursive });

// 读取当前所有文件和文件夹
const readdirSync = (p = ".") => fs.readdirSync(p);

module.exports = {
  checkFileExist,
  readFileSync,
  readFileSyncFormat,
  writeFileSync,
  mkdirSync,
  removeDir,
  copyDir,
  readdirSync,
};
