const { prompt } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const actionMain = require("../../bin/actionMain");
const { getDirName } = require("../../utils/path");

module.exports = async (_, options = {}) => {
  const { _name = getDirName(__dirname) } = options;

  let cliName, cmdItem, config;

  let cmd;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    cmd = answers.cmd;

    cmdItem = CmdList.find(cmd);
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
      const config = args.pop(); // 最后一个为配置项

      const [arg] = args;

      let answers = {};

      answers = await prompt([
        {
          type: "list",
          name: "cmd",
          message: "请选择要运行的命令:",
          choices: CmdList.getFormatListFilter({ cmd: _name }),
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
