const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt, tfList } = require("../../utils/inquirer");
const { checkFileExist, removeDir, getFileList } = require("../../utils/fs");

let mainSpinner;

let file, noCheck;

// 初始化变量
const initVar = (answers) => {
  file = answers.file;
};

const deleteFile = async () => {
  if (checkFileExist(file)) {
    if (noCheck) {
      mainSpinner.do("stop");

      const { force } = await prompt([
        {
          type: "list",
          message: `确定删除 ${file}`,
          name: "force",
          choices: tfList(true),
        },
      ]);

      if (!force) return "放弃删除";
    }

    removeDir(file);
  } else return `选中的 ${file} 不存在`;
};

const checkFile = () => {
  if (checkFileExist(file)) return "删除失败，请重新操作";
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: deleteFile,
    desc: () => `删除文件 ${file}`,
  },
  {
    fun: checkFile,
    desc: () => `已删除 ${file}`,
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

  const choices = getFileList(arg);

  if (choices.length === 0) return log.warn("未找到相关文件");

  if (arg) noCheck = true;

  answers = await prompt([
    {
      type: "list",
      name: "file",
      message: `请选择要删除的文件(共${choices.length}个):`,
      choices,
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

    log.warn("next todo", true);
    runStep(todoStepList, "warn", { prefix: "todo" });
  } else {
    mainSpinner.fail();
  }
};
