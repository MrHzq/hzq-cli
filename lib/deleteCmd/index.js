const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const CmdList = require("../../bin/handleCmdList");
const { prompt } = require("../../utils/inquirer");
const { removeDir } = require("../../utils/fs");
const path = require("path");

let mainSpinner, cliName;

let cmd, filePath;

// 初始化变量
const initVar = (answers) => {
  cmd = answers.cmd;
  filePath = path.join(path.dirname(__dirname), cmd);
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: () => CmdList.delete(cmd),
    desc: () => `删除命令 ${cmd}`,
  },
  {
    fun: () => removeDir(filePath),
    desc: () => `删除文件 ${filePath}`,
    failType: "warn",
  },
];

// todo 流程 - step 集合
const todoStepList = [
  {
    desc: () => `可运行 ${cliName} 查询当前命令`,
  },
];

const getDeleteCmdList = (selfCmd) => {
  const cmdList = CmdList.getList();

  if (cmdList) {
    return cmdList
      .filter((item) => item.cmd !== selfCmd)
      .map((item) => {
        const { cmd, desc } = item;
        return {
          name: `${cmd}: ${desc}`,
          value: cmd,
        };
      });
  } else return [];
};

module.exports = async (_, options) => {
  const { _description, _name, parent } = options;

  cliName = parent._name;

  const answers = await prompt([
    {
      type: "list",
      name: "cmd",
      message: "请选择要删除的命令:",
      choices: getDeleteCmdList(_name),
    },
  ]);

  initVar(answers);

  mainSpinner = new Spinner(_description);

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
