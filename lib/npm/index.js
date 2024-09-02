const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { formatCmdList, getAllYears } = require("../../utils/common");
const log = require("../../utils/log");
const { processRun } = require("../../utils/process");

module.exports = async (_, options = {}) => {
  let cliName, config;

  let cmd;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    cmd = answers.cmd;
  };

  const runMain = () => {
    // 运行命令...
    if (!cmd.includes("[")) processRun(cmd);
    else log.succeed(cmd);
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

  // 查看自己的 npm 下载量
  const createNudList = () => {
    return getAllYears().map((year) => {
      return {
        cmd: `nud hzq ${year}-01-01:${year}-12-31`,
        _description: `查看自己的 npm 下载量(${year} 年度)`,
      };
    });
  };

  const getCmdList = () => {
    return formatCmdList([
      {
        cmd: "npm list -g --depth 0",
        _description: "查看全局依赖包",
      },
      {
        cmd: "npm get registry",
        _description: "查看当前源",
      },
      {
        cmd: "npm i -g [npm]",
        _description: "全局安装命令",
      },
      ...createNudList(),
    ]);
  };

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
          choices: getCmdList(),
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
