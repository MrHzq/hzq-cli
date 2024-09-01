const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt, notNumberRule } = require("../../utils/inquirer");
const {
  checkFileExist,
  getFileList,
  logFileDetail,
} = require("../../utils/fs");

let mainSpinner;

let file;

// 初始化变量
const initVar = (answers) => {
  file = answers.file;
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: () => logFileDetail(file),
    desc: () => "查看文件详情",
  },
];

// todo 流程 - step 集合
const todoStepList = [
  // {
  //   desc: () => "todo...",
  // },
];

module.exports = async (_, options = {}) => {
  const { _name, _description, args } = options;

  const [arg] = args || [];

  let answers = {};

  if (checkFileExist(arg)) {
    answers = { file: arg };
  } else {
    const needList = arg === "ls";

    answers = await prompt(
      needList
        ? [
            {
              type: "list",
              name: "file",
              message: "请选择文件:",
              choices: getFileList(args?.[1]),
            },
          ]
        : [
            {
              type: "input",
              name: "file",
              message: "请输入文件路径:",
              validate: notNumberRule,
            },
          ]
    );
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
