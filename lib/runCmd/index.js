const log = require("../../utils/log");
const CmdList = require("../../bin/handleCmdList");
const { prompt } = require("../../utils/inquirer");
const path = require("path");

let cmd, filePath;

// 初始化变量
const initVar = (answers) => {
  cmd = answers.cmd;

  cmdItem = CmdList.find(cmd);
  filePath = path.join(path.dirname(__dirname), cmd);
};

const runCmd = () => {
  const fun = require(filePath);

  if (typeof fun === "function") fun(null, cmdItem);
  else log.error(`未找到对应命令 ${cmd}`);
};

const getRunCmdList = (selfCmd) => {
  const cmdList = CmdList.getList();

  if (cmdList) {
    return cmdList
      .filter((item) => item.cmd !== selfCmd)
      .map((item) => {
        const { cmd, desc } = item;
        return {
          name: `${cmd}: ${desc}`,
          value: cmd,
        };
      });
  } else return [];
};

module.exports = async (_, options = {}) => {
  const { _name } = options;

  const answers = await prompt([
    {
      type: "list",
      name: "cmd",
      message: "请选择要运行的命令:",
      choices: getRunCmdList(_name),
    },
  ]);
  initVar(answers);

  runCmd();
};
