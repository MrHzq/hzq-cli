const log = require("../../utils/log");
const CmdList = require("../../bin/handleCmdList");
const { prompt } = require("../../utils/inquirer");
const path = require("path");
const { getDirRePath } = require("../../utils/path");

let cmd, currLibPath, deleteFilePath;

// 初始化变量
const initVar = (answers) => {
  cmd = answers.cmd;

  cmdItem = CmdList.find(cmd);
  currLibPath = getDirRePath(__dirname, "../");
  deleteFilePath = path.join(currLibPath, cmd);
};

const runCmd = () => {
  const fun = require(deleteFilePath);

  if (typeof fun === "function") {
    fun(null, cmdItem);
  } else log.error(`未找到对应命令 ${cmd}`);
};

const getRunCmdList = (selfCmd) => {
  return CmdList.getFormatList().filter((item) => item.value !== selfCmd) || [];
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
