const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const path = require("path");

module.exports = async (_, options = {}) => {
  const { _name = getDirName(__dirname), _description } = options;

  let cliName, config, configType;

  let $1;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    $1 = answers.$1;
  };

  const runMain = async () => {
    // 运行命令...
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
    // 第一个 _config 为配置项
    async prompt(_config, ...args) {
      const [arg] = args;

      let answers = {};

      answers = await prompt([
        {
          type: "input",
          name: "$1",
          message: "请输入:",
          validate: notNumberRule,
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
