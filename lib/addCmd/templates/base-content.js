module.exports = `const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const path = require("path");

let mainSpinner;

// 初始化变量
const initVar = () => {};

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

  initVar();

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
