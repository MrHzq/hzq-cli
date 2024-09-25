const { prompt } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const actionMain = require("../../bin/actionMain");
const { formatCmdList, getFilterList } = require("../../utils/common");
const { getDirName } = require("../../utils/path");

module.exports = async (_, options = {}) => {
  const { _name = getDirName(__dirname), _description } = options;

  let cliName, config, cmdItem;

  let cmd, runCmdItem;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    cmd = answers.cmd;

    runCmdItem = CmdList.find(cmd, cmdItem.children);
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: () => actionMain(null, { parentCmd: cmdItem.cmd, ...runCmdItem }),
      desc: () => `运行命令 ${cmd}`,
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => "todo...",
    // },
  ];

  const getCmdList = (selfCmd, filterCmd) => {
    cmdItem = CmdList.find(selfCmd);

    return formatCmdList(
      getFilterList(cmdItem.children, {
        filterValue: { cmd: filterCmd, alias: filterCmd },
        filterType: "eq",
      })
    );
  };

  return {
    async prompt(_config, ...args) {
      const [arg] = args;

      const choices = getCmdList(_name, arg);

      if (choices.length === 0) return log.warn("未找到相关命令");

      let answers = {};

      answers = await prompt([
        {
          type: "list",
          name: "cmd",
          message: "请选择要运行的命令:",
          choices,
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
