const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt, tfList } = require("../../utils/inquirer");
const { readdirSync, removeDir, checkFileExist } = require("../../utils/fs");
const log = require("../../utils/log");

let mainSpinner;

let file;
let doubleCheck = true;

// 初始化变量
const initVar = (answers) => {
  file = answers.file;
};

const deleteFile = async () => {
  if (checkFileExist(file)) {
    if (doubleCheck) {
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

const getDeleteFileList = (fileName) => {
  const filesAndFolders = readdirSync();

  return filesAndFolders
    .filter((file) => !fileName || file.includes(fileName))
    .sort((a, b) => a.localeCompare(b))
    .map((file, index) => {
      return {
        name: `${index + 1}、${file}`,
        value: file,
      };
    });
};

module.exports = async (_, options) => {
  const { _description, args } = options;

  const choices = getDeleteFileList(args?.[0]);

  if (choices.length === 0) return log.warn("未找到相关文件");

  if (args?.[0]) doubleCheck = false;

  const answers = await prompt([
    {
      type: "list",
      name: "file",
      message: `请选择要删除的文件(共${choices.length}个):`,
      choices,
    },
  ]);

  initVar(answers);

  mainSpinner = new Spinner(_description);

  mainSpinner.start();

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();
  } else {
    mainSpinner.fail();
  }
};
