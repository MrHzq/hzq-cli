const path = require("path");
const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt, notNumberRule } = require("../../utils/inquirer");
const { code } = require("../../utils/process");

let mainSpinner;

let filePath, editor;

// 初始化变量
const initVar = (answers) => {
  filePath = answers.filePath;
  editor = answers.editor;
  code.setEditor(editor);
};

const runMain = () => {
  code.run("open", filePath);
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: runMain,
    desc: () => "运行命令",
  },
];

// todo 流程 - step 集合
const todoStepList = [
  // {
  //   desc: () => "todo...",
  // },
];

const getCmdList = () => {
  return [
    {
      name: "用编辑器打开当前文件夹",
      value: ".",
    },
    {
      name: "用编辑器打开当前 .vscode 设置",
      value: ".vscode/settings.json",
    },
  ];
};

module.exports = async (_, options = {}) => {
  const { _name, _description, args } = options;

  const [arg] = args || [];

  let answers = {};

  answers = await prompt([
    {
      type: "list",
      name: "filePath",
      message: "请选择要运行的命令:",
      choices: getCmdList(),
    },
    code.prompt,
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

    log.warn("next todo", true);
    runStep(todoStepList, "warn", { prefix: "todo" });
  } else {
    mainSpinner.fail();
  }
};
