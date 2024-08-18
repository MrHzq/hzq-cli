module.exports = `const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt, numberRule } = require("../../utils/inquirer");
const path = require("path");

let mainSpinner;

let cmd;

// 初始化变量
const initVar = (answers) => {
  cmd = answers.cmd;
};

const step1 = () => {};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: step1,
    desc: () => "step1",
  },
];

// todo 流程 - step 集合
const todoStepList = [
  {
    desc: () => "todo...",
  },
];

module.exports = async (_, options) => {
  const { _description, parent } = options;

  const answers = await prompt([
    {
      type: "input",
      name: "cmd",
      message: "命令名称（eg：addMsg、addPage）:",
      validate: numberRule,
    },
  ]);

  initVar(answers);

  mainSpinner = new Spinner(_description);

  mainSpinner.start();

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();

    log.newLine();

    log.warn("next todo");
    runStep(todoStepList, "warn");
  } else {
    mainSpinner.fail();
  }
};
`;
