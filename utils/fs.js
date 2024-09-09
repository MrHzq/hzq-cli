const path = require("path");
const fs = require("fs-extra");
const log = require("./log");
const { getFileName } = require("./path");
const {
  bitTransform,
  formatTimeBy,
  getTime,
  doFun,
  getRandomStr,
} = require("./common");

// 检查文件是否存在
const checkFileExist = fs.existsSync;

// 基于已有文件，生成自定义的文件名称
const createNewNameBy = (filePath, { suffix, prefix } = {}) => {
  if (checkFileExist(filePath)) {
    let [fileName, ext] = getFileName(filePath);
    fileName = [prefix, fileName, suffix].filter(Boolean).join("_");
    return path.join(path.dirname(filePath), `${fileName}${ext}`);
  } else return filePath;
};

// 基于已有文件，生成唯一的文件名称
const createUniqueNameBy = (filePath, { suffix, prefix } = {}) => {
  const random_suffix = getRandomStr();
  return createNewNameBy(filePath, {
    prefix,
    suffix: [random_suffix, suffix].filter(Boolean).join("_"),
  });
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

// 重命名文件
const renameSync = fs.renameSync;

// 修改文件的时间
const utimesSync = (p, t1, t2) => {
  if (checkFileExist(p)) fs.utimesSync(p, t1 || getTime(), t2 || getTime());
};

// 删除文件夹 & 子文件
const removeSync = (p) => {
  if (checkFileExist(p)) return fs.removeSync(p);
  else return `${p} 文件不存在`;
};

// 移动文件夹/文件夹
const moveSync = fs.moveSync;

// 复制文件夹
const copyDir = (s, t, re = true) => fs.copySync(s, t, { recursive: re });

// 读取当前所有文件和文件夹
const readdirSync = (p = ".") => fs.readdirSync(p);

// 根据文件名称进行过滤
const filterFileList = (fileList, filterKey, notFilterKey) => {
  return fileList.filter((file) => {
    let flg = true;

    if (flg && filterKey?.length) {
      if (typeof filterKey === "string") {
        if (filterKey.includes("||")) {
          flg = filterKey.split("||").some((key) => file.includes(key.trim()));
        } else if (filterKey.includes("&&")) {
          flg = filterKey.split("&&").every((key) => file.includes(key.trim()));
        } else {
          flg = file.includes(filterKey);
        }
      } else if (Array.isArray(filterKey)) {
        flg = filterKey.filter(Boolean).every((key) => file.includes(key));
      }
    }

    if (flg && notFilterKey?.length) {
      if (typeof notFilterKey === "string") {
        flg = !file.includes(notFilterKey);
      } else if (Array.isArray(notFilterKey)) {
        flg = notFilterKey.filter(Boolean).every((key) => !file.includes(key));
      }
    }

    return flg;
  });
};

// 获取当前 cwd 运行目录下的所有文件（可通过 filterKey 过滤）
const getFileList = (filterKey, targetPath, sortKey, filterFun) => {
  if (filterKey.includes("||") || filterKey.includes("&&")) {
  } else {
    filterKey = Array.isArray(filterKey)
      ? filterKey
      : filterKey
      ? [filterKey]
      : [];
  }

  let notFilterKey = [];

  if (Array.isArray(targetPath)) {
    notFilterKey = targetPath;
    targetPath = ".";
  }

  if (!targetPath) targetPath = ".";

  const fileList = readdirSync(targetPath);

  return filterFileList(fileList, filterKey, notFilterKey)
    .sort((a, b) => {
      if (sortKey) {
        if (sortKey === "size") {
          const aSize = getFileDetail(path.resolve(a)).sizeFormat.bit;
          const bSize = getFileDetail(path.resolve(b)).sizeFormat.bit;
          return aSize - bSize;
        }
      } else return a.localeCompare(b);
    })
    .filter((file) => doFun([filterFun, true], file))
    .map((file, index) => {
      const { sizeFormat } = getFileDetail(path.resolve(file));

      return {
        name: `${index + 1}. ${file} ${sizeFormat.mbs || ""}`,
        value: file,
      };
    });
};

// 查询查看文件详情
const getFileDetail = (file) => {
  try {
    const stat = typeof file === "object" ? file : statSync(file);
    const sizeFormat = stat.isFile() ? bitTransform(stat.size) : {};
    const birthtimeFormat = formatTimeBy(stat.birthtime);
    const mtimeFormat = formatTimeBy(stat.mtime);
    const fullPath = path.resolve(stat.filePath || file);

    return Object.assign(stat, {
      sizeFormat,
      birthtimeFormat,
      mtimeFormat,
      fullPath,
    });
  } catch (error) {
    throw Error(`${file} 文件不存在`);
  }
};

// 打印查询到的查看文件详情
const logFileDetail = (file) => {
  const stat = typeof file === "object" ? file : getFileDetail(file);

  log.succeed(`类型: ${stat.isFile ? "文件" : "目录"}`);
  if (stat.fullPath !== stat.filePath) log.succeed(`名称: ${stat.filePath}`);

  if (stat.sizeFormat.mbs) log.succeed(`大小: ${stat.sizeFormat.mbs}`);

  log.succeed(`创建时间: ${stat.birthtimeFormat}`);
  log.succeed(`修改时间: ${stat.mtimeFormat}`);
  log.succeed(`完整路径: ${stat.fullPath}`);
};

module.exports = {
  checkFileExist,
  createNewNameBy,
  createUniqueNameBy,
  statSync,
  readFileSync,
  readFileSyncFormat,
  writeFileSync,
  mkdirSync,
  renameSync,
  utimesSync,
  removeSync,
  moveSync,
  copyDir,
  readdirSync,
  filterFileList,
  getFileList,
  getFileDetail,
  logFileDetail,
};
