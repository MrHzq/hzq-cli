const path = require("path");
const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt, notNumberRule } = require("../../utils/inquirer");
const { formatCmdList, getAllYears } = require("../../utils/common");
const { processRun } = require("../../utils/process");

let mainSpinner;

let cmd;

// 初始化变量
const initVar = (answers) => {
  cmd = answers.cmd;
};

const runMain = () => {
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

module.exports = async (_, options = {}) => {
  const { _name, _description, args } = options;

  const [arg] = args || [];

  let answers = {};

  answers = await prompt([
    {
      type: "list",
      name: "cmd",
      message: "请选择要运行的命令:",
      choices: getCmdList(),
    },
  ]);

  initVar(answers);

  mainSpinner = new Spinner(_description);

  if (mainStepList.length === 1 && !todoStepList?.length) {
    await mainStepList[0].fun();
    return mainSpinner.succeed();
  }

  mainSpinner.start();

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();
  } else {
    mainSpinner.fail();
  }
};
