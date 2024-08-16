const inquirer = require("inquirer");
const { log, Spinner, logSplit } = require("../log");
const {
  checkFileExist,

  runStep,
  getGitUser,
  cmdListGet,
  removeDir,
  cmdListDelete,
} = require("../utils");

let userInfo, toDeleteCmd;

// 初始化变量
const initVar = (answers) => {
  userInfo = getGitUser();
  toDeleteCmd = answers.toDeleteCmd;
  filePath = `lib/${toDeleteCmd}`;
};

const deleteFile = () => removeDir(filePath);

const deleteCmd = () => cmdListDelete(toDeleteCmd);

// 主流程 - step 集合
const mainStepList = [
  {
    fun: deleteFile,
    desc: () => `删除文件 ${filePath}`,
  },
  {
    fun: deleteCmd,
    desc: () => `删除命令 ${toDeleteCmd}`,
  },
];

const toDeleteCmdList = (selfCmd) => {
  const cmdList = cmdListGet();

  if (cmdList) {
    return cmdList
      .filter((item) => item.cmd !== selfCmd)
      .map((item, index) => {
        const { cmd, desc } = item;
        return {
          name: `${cmd}: ${desc}`,
          value: cmd,
        };
      });
  } else return [];
};

module.exports = (_, options) => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "toDeleteCmd",
        message: "请选择要删除的命令:",
        choices: toDeleteCmdList(options._name),
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
      } else {
        mainSpinner.fail();
      }
    });
};
