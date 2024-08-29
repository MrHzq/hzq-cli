const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { renameSync } = require("../../utils/fs");
const CmdList = require("../../bin/handleCmdList");
const { getDirRePath } = require("../../utils/path");
const { prompt } = require("../../utils/inquirer");
const path = require("path");
const { getAlias } = require("../../utils/common");

let mainSpinner;

let cmd, newName, alias, currLibPath, oldFilePath, newFilePath;

// 初始化变量
const initVar = (answers) => {
  cmd = answers.cmd;
  newName = answers.newName;

  alias = getAlias(newName);

  currLibPath = getDirRePath(__dirname, "../");

  oldFilePath = path.join(currLibPath, cmd);
  newFilePath = path.join(currLibPath, newName);
};

// 更改文件
const changeFileName = () => {
  renameSync(oldFilePath, newFilePath);
};

// 更改命令
const changeCmdName = () => {
  CmdList.replace({ cmd: newName, alias }, cmd);
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: changeFileName,
    desc: () => "更改文件",
  },
  {
    fun: changeCmdName,
    desc: () => "更改命令",
  },
];

// todo 流程 - step 集合
const todoStepList = [
  {
    desc: () => `可运行 ${cliName} 查询当前命令`,
  },
];

const getRunCmdList = (selfCmd) => {
  return CmdList.getFormatList().filter((item) => item.value !== selfCmd) || [];
};

module.exports = async (_, options) => {
  const { _description, _name, args } = options;

  const [arg] = args || [];

  let answers = {};

  answers = await prompt([
    {
      type: "list",
      name: "cmd",
      message: "请选择要更名的命令:",
      choices: getRunCmdList(_name),
    },
    {
      type: "input",
      name: "newName",
      message: "请输入新的命令名称:",
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
  } else {
    mainSpinner.fail();
  }
};
