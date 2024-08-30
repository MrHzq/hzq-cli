const path = require("path");
const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { renameSync } = require("../../utils/fs");
const { getDirName } = require("../../utils/path");
const { prompt, notNumberRule } = require("../../utils/inquirer");

let mainSpinner;


let inputValue;

// 初始化变量
const initVar = (answers) => {
  inputValue = answers.inputValue;
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
  const { _description, args } = options;

  const [arg] = args || []


  let answers = {};

  answers = await prompt([
    {
      type: "input",
      name: " inputValue",
      message: "请输入:",
      validate: notNumberRule,
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

    log.newLine();

    log.warn("next todo");
    runStep(todoStepList, "warn", { prefix: "todo" });
  } else {
    mainSpinner.fail();
  }
};
