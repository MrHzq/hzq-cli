const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt } = require("../../utils/inquirer");
const { readdirSync, removeDir, checkFileExist } = require("../../utils/fs");

let mainSpinner;

let file;

// 初始化变量
const initVar = (answers) => {
  file = answers.file;
};

const deleteFile = async () => {
  if (checkFileExist(file)) {
    mainSpinner.do("stop");

    const { force } = await prompt([
      {
        type: "list",
        message: `确定删除 ${file}`,
        name: "force",
        choices: [
          { name: "否", value: false },
          { name: "是", value: true },
        ],
      },
    ]);

    if (force) removeDir(file);
    else return "放弃删除";
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

const getDeleteFileList = () => {
  const filesAndFolders = readdirSync(".");

  return filesAndFolders.map((file) => {
    return {
      name: file,
      value: file,
    };
  });
};

module.exports = async (_, options) => {
  const { _description } = options;

  const choices = getDeleteFileList();

  const answers = await prompt([
    {
      type: "list",
      name: "file",
      message: `请选择要删除的文件(${choices.length}个):`,
      choices,
    },
  ]);

  mainSpinner = new Spinner(_description);

  mainSpinner.start();

  initVar(answers);

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();
  } else {
    mainSpinner.fail();
  }
};
