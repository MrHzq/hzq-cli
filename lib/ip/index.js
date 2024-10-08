const os = require("os");
const log = require("../../utils/log");
const CmdList = require("../../bin/handleCmdList");

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname), _description } = options;

  let cliName, config;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();
  };

  const runMain = () => {
    // 运行命令...
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const interface of interfaces[name]) {
        if (interface.family === "IPv4" && !interface.internal) {
          log.success(interface.address);
        }
      }
    }
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => "运行",
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
