module.exports = `const inquirer = require("inquirer");
const { log, Spinner, logSplit } = require("../log");
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

let userInfo, cmd;

// 初始化变量
const initVar = (answers) => {
  userInfo = getGitUser();
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

module.exports = (_, options) => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "cmd",
        message: "命令名称（eg： XX）:",
        validate(value) {
          value = value.trim();
          if (value) {
            if (isNaN(Number(value))) return true;
            else return "此字段不能为数字";
          } else return "此字段必填";
        },
      },
    ])
    .then((answers) => {
      const { _description } = options;

      const mainSpinner = new Spinner(_description);

      mainSpinner.start();
      logSplit();

      initVar(answers);

      const runSuccess = runStep(mainStepList);

      if (runSuccess) {
        mainSpinner.succeed();

        logSplit();

        log.warn("next todo");
        runStep(todoStepList, "warn");
      } else {
        mainSpinner.fail();
      }
    });
};

`;
