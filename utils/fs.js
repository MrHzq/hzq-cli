const path = require("path");
const fs = require("fs-extra");
const log = require("./log");
const { getFileName } = require("./path");
const { bitTransform, formatTimeBy } = require("./common");

// 检查文件是否存在
const checkFileExist = (p) => fs.existsSync(p);

// 基于已有文件，生成自定义的文件名称
const newFileName = (filePath, { suffix, prefix }) => {
  if (checkFileExist(filePath)) {
    let [fileName, ext] = getFileName(filePath);
    fileName = [prefix, fileName, suffix].filter((i) => i).join("-");
    return path.join(path.dirname(filePath), `${fileName}${ext}`);
  } else return filePath;
};

// 基于已有文件，生成唯一的文件名称
const createUniqueFileName = (filePath) => {
  const suffix = Math.random().toString(36).substring(2, 8);
  return newFileName(filePath, { suffix });
};

// 获取文件状态信息
const statSync = (p) => Object.assign(fs.statSync(p), { filePath: p });

// 同步读取文件内容
const readFileSync = (p, c = "utf-8") =>
  checkFileExist(p) ? fs.readFileSync(p, c) : "";

// 同步读取文件内容 && \n 格式化
const readFileSyncFormat = (p, sp = "\n") => readFileSync(p).split(sp);

// 同步写入文件内容
const writeFileSync = (p, text, c = "utf-8") => fs.writeFileSync(p, text, c);

// 递归创建文件夹
const mkdirSync = (p, re = true) => fs.mkdirSync(p, { recursive: re });

// 删除文件夹 & 子文件
const removeDir = (p) => {
  if (checkFileExist(p)) return fs.removeSync(p);
  else return `${p} 文件不存在`;
};

// 复制文件夹
const copyDir = (s, t, re = true) => fs.copy(s, t, { recursive: re });

// 读取当前所有文件和文件夹
const readdirSync = (p = ".") => fs.readdirSync(p);

// 根据文件名称进行过滤
const filterFileList = (fileList, filterKey) => {
  return fileList.filter((file) => !filterKey || file.includes(filterKey));
};

// 获取当前 cwd 运行目录下的所有文件（可通过 filterKey 过滤）
const getFileList = (filterKey, targetPath) => {
  const fileList = readdirSync(targetPath);

  return filterFileList(fileList, filterKey)
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
  const stat = typeof file === "object" ? file : statSync(file);
  const sizeFormat = stat.isFile() ? bitTransform(stat.size) : null;
  const birthtimeFormat = formatTimeBy(stat.birthtime);
  const mtimeFormat = formatTimeBy(stat.mtime);
  const fullPath = path.resolve(stat.filePath || file);

  return Object.assign(stat, {
    sizeFormat,
    birthtimeFormat,
    mtimeFormat,
    fullPath,
  });
};

// 打印查询到的文件详情
const logFileDetail = (file) => {
  const stat = typeof file === "object" ? file : fileDetail(file);

  log.succeed(`类型: ${stat.isFile ? "文件" : "目录"}`);
  if (stat.fullPath !== stat.filePath) log.succeed(`名称: ${stat.filePath}`);

  if (stat.isFile) log.succeed(`大小: ${stat.sizeFormat.mbs}`);

  log.succeed(`创建时间: ${stat.birthtimeFormat}`);
  log.succeed(`修改时间: ${stat.mtimeFormat}`);
  log.succeed(`完整路径: ${stat.fullPath}`);
};

module.exports = {
  checkFileExist,
  newFileName,
  createUniqueFileName,
  statSync,
  readFileSync,
  readFileSyncFormat,
  writeFileSync,
  mkdirSync,
  removeDir,
  copyDir,
  readdirSync,
  filterFileList,
  getFileList,
  fileDetail,
  logFileDetail,
};
