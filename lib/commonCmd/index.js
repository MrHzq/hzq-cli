const log = require("../../utils/log");
const { readdirSync } = require("../../utils/fs");
const { prompt } = require("../../utils/inquirer");
const path = require("path");

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

const getRunCmdList = () => {
  const files = readdirSync(__dirname);

  if (files) {
    return files
      .filter((file) => file !== "index.js")
      .sort((a, b) => a.localeCompare(b))
      .map((file) => {
        const cmd = file.split(".")[0];
        const { desc } = require(`./${file}`);
        return {
          name: `${cmd}: ${desc}`,
          value: cmd,
        };
      });
  } else return [];
};

module.exports = async (_, options = {}) => {
  const { args } = options;

  if (args?.[0]) initVar({ cmd: args[0] });
  else {
    const answers = await prompt([
      {
        type: "list",
        name: "cmd",
        message: "请选择要运行的命令:",
        choices: getRunCmdList(),
      },
    ]);
    initVar(answers);
  }

  runCmd();
};
