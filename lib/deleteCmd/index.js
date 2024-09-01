const path = require("path");
const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { getDirRePath } = require("../../utils/path");
const CmdList = require("../../bin/handleCmdList");
const { prompt } = require("../../utils/inquirer");
const { removeDir } = require("../../utils/fs");

let mainSpinner;

let cliName, cmd, currLibPath, deleteFilePath;

// 初始化变量
const initVar = (answers) => {
  cliName = CmdList.getCliName();

  cmd = answers.cmd;
  currLibPath = getDirRePath(__dirname, "../");
  deleteFilePath = path.join(currLibPath, cmd);
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: () => CmdList.delete(cmd),
    desc: () => `删除命令 ${cmd}`,
  },
  {
    fun: () => removeDir(deleteFilePath),
    desc: () => `删除文件 ${deleteFilePath}`,
    failType: "warn",
  },
];

// todo 流程 - step 集合
const todoStepList = [
  {
    desc: () => `可运行 ${cliName} 查询当前命令`,
  },
];

const getCmdList = (selfCmd) => CmdList.getFormatListFilter({ cmd: selfCmd });

module.exports = async (_, options = {}) => {
  const { _name, _description, args } = options;

  const [arg] = args || [];

  let answers = {};

  answers = await prompt([
    {
      type: "list",
      name: "cmd",
      message: "请选择要删除的命令:",
      choices: getCmdList(_name),
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
