module.exports = `const { log, Spinner, logSplit } = require("../log");
const {
  getHBSContent,

  isExistByRegTest,

  checkFileExist,
  writeFileSync,
  mkdirSync,

  splitContentAndJoin,

  runStep,
  getGitUser,
} = require("../utils");

let userInfo;

// 初始化变量
const initVar = () => {
  userInfo = getGitUser();
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

module.exports = (_, options) => {
  const { _description } = options;

  const mainSpinner = new Spinner(_description);

  mainSpinner.start();
  logSplit();

  initVar();

  const runSuccess = runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();

    logSplit();

    log.warn("next todo");
    runStep(todoStepList, "warn");
  } else {
    mainSpinner.fail();
  }
};

`;
