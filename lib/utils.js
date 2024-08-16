const fs = require("fs-extra");
const dayjs = require("dayjs");
const { execSync } = require("child_process");

const Handlebars = require("handlebars");

const { log, Spinner } = require("./log");
const path = require("path");

const toHBSTemp = (temp) => Handlebars.compile(temp);
const getHBSContent = (temp, config) => toHBSTemp(temp)(config);

const startSpace = `  `; // 2 个开始空格
const lbc = `\n`; // 换行符
const newLine = lbc + startSpace;

// 格式化时间
const formatTime = (format = "YYYY-MM-DD HH:mm:ss") => dayjs().format(format);

// 全字匹配，判断是否存在
const isExistByRegTest = (content, target) => {
  const regex = new RegExp(`\\b${target}\\b`); // 创建正则表达式对象，^表示匹配字符串的开头，$表示匹配字符串的结尾，从而实现完全匹配
  return regex.test(content); // 使用 test 方法进行正则匹配
};

// 将驼峰命名转换为横线连接
const camelToHyphen = (str) => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

// 首字母大写
const firstUpperCase = (word) => word[0].toLocaleUpperCase() + word.slice(1);

// 首字母小写
const firstLowerCase = (word) => word[0].toLocaleLowerCase() + word.slice(1);

// 获取简称：addPage->ap
const getAlias = (str) => {
  let result = str[0];
  for (let char of str) {
    if (/[A-Z]/.test(char)) result += char.toLowerCase();
  }
  return result;
};

// 执行命令
const runCmd = (cmd) => {
  try {
    execSync(cmd, { stdio: "inherit" });
    return true;
  } catch (error) {
    const tip = `执行 '${cmd}' 时出错: ${error.message}`;
    log.error(tip);
    return tip;
  }
};

// 获取 git 用户信息
const getGitUser = () => {
  try {
    // 获取用户名
    const userName = execSync("git config --global user.name", {
      encoding: "utf8",
    }).trim();

    // 获取用户邮箱
    const userEmail = execSync("git config --global user.email", {
      encoding: "utf8",
    }).trim();

    return { userName, userEmail };
  } catch (error) {
    log.error(`获取 Git 用户信息时出错: ${error.message}`);
  }
};

// 检查文件是否存在
const checkFileExist = (_p) => fs.existsSync(_p);

// 同步读取文件内容
const readFileSync = (_p) =>
  checkFileExist(_p) ? fs.readFileSync(_p, "utf-8") : "";

// 同步读取文件内容 && \n 格式化
const readFileSyncFormat = (_p) => readFileSync(_p).split("\n");

// 同步写入文件内容
const writeFileSync = (_p, content) => fs.writeFileSync(_p, content, "utf-8");

// 递归创建文件夹
const mkdirSync = (_p) => fs.mkdirSync(_p, { recursive: true });

// 删除文件夹 & 子文件
const removeDir = (_p) => {
  if (checkFileExist(_p)) {
    fs.removeSync(_p);
    return true;
  } else return `${_p} 文件不存在`;
};

// 复制文件夹
const copyDir = (s, t) => fs.copy(s, t, { recursive: true });

// 简单的分割 + 拼接
const splitContentAndJoin = (
  filePath,
  splitStr,
  getAddContent,
  addToBefore
) => {
  const content = readFileSync(filePath);

  if (content) {
    const splitList = content.split(splitStr);

    if (splitList.length) {
      const { error, addContent } = getAddContent(content);

      if (addContent) {
        let newContent = splitList[0];

        if (addToBefore) newContent += addContent + splitStr;
        else newContent += splitStr + addContent;

        newContent += splitList[1];

        writeFileSync(filePath, newContent);
        return true;
      } else return error;
    } else return `未找到匹配的 ${splitStr} 部分`;
  } else return `${filePath} 的内容为空`;
};

// 往 TS 文件内容新增 enum 值
const addValueToEnum = (filePath, enumName, msgValueList, addContent) => {
  const content = readFileSync(filePath);

  if (content) {
    // 正则表达式匹配 export enum XX {...} 部分
    const enumRegex = new RegExp(
      `export\\s+enum\\s+${enumName}\\s*{([^}]*)}`,
      ""
    );

    const match = content.match(enumRegex);

    if (match) {
      const enumContent = match[1];

      const hasExistList = [];

      const [key, value, comment] = msgValueList;

      const keyExist = isExistByRegTest(enumContent, key);
      const valueExist = isExistByRegTest(enumContent, value);

      if (keyExist) hasExistList.push(`key：${key} 重复`);
      if (valueExist) hasExistList.push(`value：${value} 重复`);

      if (hasExistList.length) return hasExistList.join(lbc);

      const addEnumContent =
        addContent || `,${newLine}${key} = ${value} // ${comment}${lbc}`;

      const newEnumContent = enumContent + addEnumContent;

      const newContent = content.replace(
        match[0],
        `export enum ${enumName} {${newEnumContent}}`
      );

      writeFileSync(filePath, newContent);
      return true;
    } else return `未找到匹配的 export enum ${enumName} {...} 部分`;
  } else return `${filePath} 的内容为空`;
};

// 往 TS 文件内容新增 type 值
const addValueToType = (filePath, typeName, typeKey) => {
  return splitContentAndJoin(
    filePath,
    `export type ${typeName} =`,
    (content) => {
      if (isExistByRegTest(content, typeKey)) {
        return { error: `${typeKey} 重复` };
      }

      return { addContent: newLine + `| ` + typeKey };
    }
  );
};

// 统一的运行流程方法
const runStep = async (list, _failType = "fail", config = {}) => {
  let everySuccess = false;
  for (let index = 0; index < list.length; index++) {
    const { fun, desc, ignore, failType } = list[index];

    if (ignore) continue;

    const finalType = failType || _failType;

    const currDesc = typeof desc === "function" ? desc() : desc;

    const stepSpinner = new Spinner(
      (config.hideIndex ? "" : index + 1 + "、") + currDesc
    );

    let res = typeof fun === "function" ? await fun() : {};

    if (res === true) res = {};

    const { success = true, errorTip, warnTip } = res;

    if (success === true) {
      everySuccess = true;
      stepSpinner.succeed();
      if (typeof config.onSuccess === "function") {
        config.onSuccess(list[index], res);
      }
    } else {
      everySuccess = failType === "warn";

      if (finalType === "fail") {
        stepSpinner.fail();

        if (errorTip) log.error(errorTip);
        if (typeof config.onFail === "function") {
          config.onFail(list[index], res);
        }

        break;
      } else if (finalType === "warn") {
        stepSpinner.warn();

        if (warnTip) log.warn(warnTip);
        if (typeof config.onWarn === "function") {
          config.onWarn(list[index], res);
        }
      }
    }
  }

  return everySuccess;
};

const cmdListPath = path.join(__dirname, "../bin/cmdList.json");

// 获取 cmdList.json 数据
const cmdListGet = () => {
  const cmdList = readFileSync(cmdListPath);
  return cmdList ? JSON.parse(cmdList) : "";
};

// 返回[index, item]
const cmdListFind = (cmd) => {
  const cmdList = cmdListGet();

  if (cmdList) {
    const index = cmdList.findIndex((item) => item.cmd === cmd);
    return [index, cmdList[index]];
  } else [];
};

const cmdListPush = (item) => {
  const cmdList = cmdListGet();

  if (cmdList) {
    // 新增数据
    cmdList.push(item);

    writeFileSync(cmdListPath, JSON.stringify(cmdList, null, 2));
    return true;
  } else return false;
};

const cmdListDelete = (value) => {
  let index = value;

  if (typeof index !== "number") [index] = cmdListFind(value);

  const cmdList = cmdListGet();

  if (cmdList) {
    // 新增数据
    cmdList.splice(index, 1);

    writeFileSync(cmdListPath, JSON.stringify(cmdList, null, 2));
    return true;
  } else return false;
};

module.exports = {
  toHBSTemp,
  getHBSContent,

  startSpace,
  lbc,
  newLine,
  formatTime,

  isExistByRegTest,
  camelToHyphen,
  firstUpperCase,
  firstLowerCase,
  getAlias,

  execSync,
  runCmd,
  getGitUser,

  checkFileExist,
  readFileSync,
  readFileSyncFormat,
  writeFileSync,
  mkdirSync,
  removeDir,
  copyDir,

  splitContentAndJoin,

  addValueToType,
  addValueToEnum,

  runStep,

  cmdListGet,
  cmdListFind,
  cmdListPush,
  cmdListDelete,
};
