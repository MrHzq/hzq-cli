const log = require("../../utils/log");
const { readdirSync } = require("../../utils/fs");
const { prompt } = require("../../utils/inquirer");
const path = require("path");
const { doFun } = require("../../utils/common");

let cmd, filePath;

// 初始化变量
const initVar = (answers) => {
  cmd = answers.cmd;
  filePath = path.join(__dirname, cmd);
};

const runCmd = () => {
  const { fun } = require(filePath);

  if (typeof fun === "function") fun();
  else log.error(`未找到对应命令 ${cmd}`);
};

const getRunCmdList = (cmd) => {
  const files = readdirSync(__dirname);

  if (files) {
    return files
      .filter((file) => file !== "index.js" && (!cmd || file.includes(cmd)))
      .sort((a, b) => a.localeCompare(b))
      .map((file) => {
        const cmd = file.split(".")[0];
        const { desc, ignore } = require(`./${file}`);
        return {
          name: `${cmd}: ${desc}`,
          value: cmd,
          ignore: doFun([ignore, undefined]),
        };
      })
      .filter((item) => item.ignore !== true);
  } else return [];
};

module.exports = async (_, options = {}) => {
  const { args } = options;

  const choices = getRunCmdList(args?.[0]);

  if (choices.length === 0) return log.warn("未找到相关命令");

  const answers = await prompt([
    {
      type: "list",
      name: "cmd",
      message: "请选择要运行的命令:",
      choices,
    },
  ]);

  initVar(answers);

  runCmd();
};
