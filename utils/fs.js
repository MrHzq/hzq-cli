const path = require("path");
const fs = require("fs-extra");
const log = require("./log");
const { getFileName, getFileType } = require("./path");
const {
  bitTransform,
  formatTimeBy,
  getTime,
  doFun,
  getRandomStr,
} = require("./common");

// 检查文件是否存在
const checkFileExist = fs.existsSync;

// 基于传入文件(不需要存在)，生成自定义的文件名称
const createNewName = (filePath, { suffix, prefix } = {}) => {
  let [fileName, ext] = getFileName(filePath);
  fileName = [prefix, fileName, suffix].filter(Boolean).join("_");
  return path.join(path.dirname(filePath), `${fileName}${ext}`);
};

// 基于已有文件，生成自定义的文件名称
const createNewNameBy = (filePath, config) => {
  if (checkFileExist(filePath)) return createNewName(filePath, config);
  else return filePath;
};

// 基于已有文件，生成唯一的文件名称
const createUniqueNameBy = (filePath, { suffix, prefix } = {}) => {
  const random_suffix = getRandomStr();
  return createNewNameBy(filePath, {
    prefix,
    suffix: [suffix, random_suffix].filter(Boolean).join("_"),
  });
};

// 基于文件名，当后缀不存在，则强制添加后缀
const foreAddSuffix = (fileName, suffix) => {
  if (!fileName.includes(suffix)) {
    const newFileName = createNewNameBy(fileName, { suffix });

    if (checkFileExist(fileName)) renameSync(fileName, newFileName);

    // 修改文件的的时间为当前时间
    if (checkFileExist(newFileName)) utimesSync(newFileName);
  }
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

// 读取当前所有文件和文件夹以及子文件
const reReaddirSync = (config = {}) => {
  const fileList = [];

  const { dir = ".", ignoreList = [], showIgnoreLog = false, cb } = config;

  const currIgnoreList = getDefaultIgnoreList()
    .concat(ignoreList)
    .filter(Boolean);

  const fileEach = (_dir) => {
    const files = readdirSync(_dir);

    files.forEach((file) => {
      const fullFilePath = path.join(_dir, file);

      const isIgnore = checkPathIsIgnore(fullFilePath, currIgnoreList);

      if (isIgnore && showIgnoreLog) {
        log.error(`已忽略文件: ${fullFilePath}`);
      }

      if (!isIgnore) {
        if (statSync(fullFilePath).isDirectory()) fileEach(fullFilePath);
        else {
          const item = {
            filePath: file,
            fullFilePath,
            fileContent: readFileSync(fullFilePath),
            fileContentFormat: readFileSyncFormat(fullFilePath),
          };

          if (doFun([cb, true], item)) fileList.push(item);
        }
      }
    });
  };

  fileEach(dir);

  return fileList;
};

// 根据文件名称进行过滤
const filterFileList = (fileList, filterKey, notFilterKey) => {
  const getFlg = (file, strKey) => {
    let flg = true;
    if (typeof strKey === "string") {
      if (strKey.includes("||")) {
        flg = strKey.split("||").some((key) => file.includes(key.trim()));
      } else if (strKey.includes("&&")) {
        flg = strKey.split("&&").every((key) => file.includes(key.trim()));
      } else {
        flg = file.includes(strKey);
      }
    } else if (Array.isArray(strKey)) {
      flg = strKey.filter(Boolean).every((key) => file.includes(key));
    }

    return flg;
  };

  return fileList.filter((file) => {
    let flg = true;

    if (flg && filterKey?.length) flg = getFlg(file, filterKey);

    if (flg && notFilterKey?.length) flg = !getFlg(file, notFilterKey);

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

  if (
    targetPath &&
    (targetPath.includes("||") ||
      targetPath.includes("&&") ||
      Array.isArray(targetPath))
  ) {
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
      const fileDetail = getFileDetail(path.resolve(file));

      return {
        name: `${index + 1}. ${file} ${fileDetail.sizeFormat.mbs || ""}`,
        value: file,
        fileDetail,
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
      ...getFileType(fullPath),
    });
  } catch (error) {
    throw Error(`${file} 文件不存在`);
  }
};

// 打印查询到的查看文件详情
const logFileDetail = async (file) => {
  const stat = typeof file === "object" ? file : getFileDetail(file);

  if (stat.isFile()) {
    log.succeed(`类型: ${stat.fileType}`);
  } else {
    log.succeed("分类: 目录");
  }

  if (stat.fullPath !== stat.filePath) log.succeed(`名称: ${stat.filePath}`);

  if (stat.sizeFormat.mbs) log.succeed(`大小: ${stat.sizeFormat.mbs}`);

  log.succeed(`修改时间: ${stat.mtimeFormat}`);
  log.succeed(`创建时间: ${stat.birthtimeFormat}`);
  log.succeed(`完整路径: ${stat.fullPath}`);

  return stat;
};

// 获取 JSON 文件的内容
const getJsonContent = (path = ".") => JSON.parse(readFileSync(path) || "{}");

// 获取 .gitignore 的内容
const getIgnoreList = (gitIgnorePath = ".gitignore") => {
  try {
    const ignoreList = readFileSyncFormat(gitIgnorePath).filter(
      (line) => line.trim() !== "" && !line.includes("#")
    );
    return ignoreList;
  } catch (error) {
    if (error.code === "ENOENT") {
      log.info(".gitignore 文件不存在");
    } else {
      log.error("读取.gitignore 文件时出错:", err);
    }
    return [];
  }
};

const getDefaultIgnoreList = () => {
  return [".git", "dist", "node_modules", ".gitignore"].concat(getIgnoreList());
};

// 当前路径是否是忽略的
const checkPathIsIgnore = (path, ignoreList = []) => {
  for (const ignoreItem of ignoreList) {
    if (ignoreItem.includes("*")) {
      const parts = ignoreItem.split("*");
      let match = true;
      let startIndex = 0;
      for (const part of parts) {
        const index = path.indexOf(part, startIndex);
        if (index === -1) {
          match = false;
          break;
        }
        startIndex = index + part.length;
      }
      if (match) return true;
    } else {
      if (path.includes(ignoreItem)) return true;
    }
  }
  return false;
};

module.exports = {
  checkFileExist,
  createNewNameBy,
  createUniqueNameBy,
  foreAddSuffix,
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
  reReaddirSync,
  filterFileList,
  getFileList,
  getFileDetail,
  logFileDetail,
  getJsonContent,
  getIgnoreList,
  getDefaultIgnoreList,
};
