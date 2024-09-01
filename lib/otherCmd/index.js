const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const { getDirRePath } = require("../../utils/path");
const CmdList = require("../../bin/handleCmdList");
const { prompt } = require("../../utils/inquirer");
const { getFilterList, formatCmdList } = require("../../utils/common");

let mainSpinner;

let cmd, filePath;

// 初始化变量
const initVar = (answers) => {
  cmd = answers.cmd;
  filePath = getDirRePath(__dirname, cmd);
};

const runCmd = () => {
  const { fun } = require(filePath);

  if (typeof fun === "function") fun();
  else log.error(`未找到对应命令 ${cmd}`);
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: runCmd,
    desc: () => "运行命令",
  },
];

// todo 流程 - step 集合
const todoStepList = [
  // {
  //   desc: () => "todo...",
  // },
];

const getCmdList = (selfCmd, filterCmd) => {
  const curCmd = CmdList.find(selfCmd);
  return formatCmdList(
    getFilterList(curCmd.children, { cmd: filterCmd }, "eq")
  );
};

module.exports = async (_, options = {}) => {
  const { _name, _description, args } = options;

  const [arg] = args || [];

  let answers = {};

  const choices = getCmdList(_name, arg);

  if (choices.length === 0) return log.warn("未找到相关命令");

  if (choices.length === 1) {
    answers = { cmd: choices[0].value };
  } else {
    answers = await prompt([
      {
        type: "list",
        name: "cmd",
        message: "请选择要运行的命令:",
        choices,
      },
    ]);
  }

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

    log.warn("next todo", true);
    runStep(todoStepList, "warn", { prefix: "todo" });
  } else {
    mainSpinner.fail();
  }
};
