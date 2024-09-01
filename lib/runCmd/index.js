const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { getDirRePath } = require("../../utils/path");
const path = require("path");
const actionMain = require("../../bin/actionMain");

module.exports = async (_, options = {}) => {
  let cliName, cmdItem, config;

  let cmd, currLibPath, cmdFilePath;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    cmd = answers.cmd;

    cmdItem = CmdList.find(cmd);

    currLibPath = getDirRePath(__dirname, "../");
    cmdFilePath = path.join(currLibPath, cmd);
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: () => actionMain(null, cmdItem),
      desc: () => `运行命令 ${cmd}`,
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => "todo...",
    // },
  ];

  return {
    async prompt(...args) {
      const [arg] = args;
      const answers = await prompt([
        {
          type: "list",
          name: "cmd",
          message: "请选择要运行的命令:",
          choices: CmdList.getFormatListFilter({ cmd: options._name }),
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
