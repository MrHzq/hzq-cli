const fs = require("fs-extra");
const log = require("./log");
const { bitTransform, formatTimeBy } = require("./common");
const path = require("path");

// 检查文件是否存在
const checkFileExist = (p) => fs.existsSync(p);

// 获取文件状态信息
const statSync = (p) => fs.statSync(p);

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

// 获取当前目录下的所有文件（可通过 fileName 过滤）
const getFileList = (fileName) => {
  const filesAndFolders = readdirSync();

  return filesAndFolders
    .filter((file) => !fileName || file.includes(fileName))
    .sort((a, b) => a.localeCompare(b))
    .map((file, index) => {
      return {
        name: `${index + 1}. ${file}`,
        value: file,
      };
    });
};

// 查询文件详情
const fileDetail = (file) => {
  const stat = statSync(file);

  const isFile = stat.isFile();
  const sizeFormat = isFile ? bitTransform(stat.size) : null;
  const birthtimeFormat = formatTimeBy(stat.birthtime);
  const mtimeFormat = formatTimeBy(stat.mtime);
  const fullPath = path.resolve(file);

  return {
    ...stat,
    isFile,
    sizeFormat,
    birthtimeFormat,
    mtimeFormat,
    fullPath,
  };
};

// 打印查询到的文件详情
const logFileDetail = (file) => {
  const stat = fileDetail(file);

  log.succeed(`类型: ${stat.isFile ? "文件" : "目录"}`);

  if (stat.isFile) {
    log.succeed(`大小: ${stat.sizeFormat.mbs}`);
  }

  log.succeed(`创建时间: ${stat.birthtimeFormat}`);
  log.succeed(`修改时间: ${stat.mtimeFormat}`);
  log.succeed(`完整路径: ${stat.fullPath}`);
};

module.exports = {
  checkFileExist,
  statSync,
  readFileSync,
  readFileSyncFormat,
  writeFileSync,
  mkdirSync,
  removeDir,
  copyDir,
  readdirSync,
  getFileList,
  fileDetail,
  logFileDetail,
};
