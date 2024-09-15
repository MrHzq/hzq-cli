const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const path = require("path");
const { getDirName } = require("../../utils/path");

module.exports = async (_, options = {}) => {
  const { _name = getDirName(__dirname), _description } = options;

  let cliName, config, configType;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();
  };

  const runMain = async () => {
    // 运行命令...

    const cmdList = CmdList.getList();

    console.table(cmdList, ["alias", "cmd", "_description"]);
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => _description,
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => "todo...",
    // },
  ];

  return {
    initVar,
    mainStepList,
    todoStepList,
  };
};
