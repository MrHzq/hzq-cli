const path = require("path");
const { prompt } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { getDirRePath, getDirName } = require("../../utils/path");
const { removeSync } = require("../../utils/fs");

module.exports = async (_, options = {}) => {
  const { _name = getDirName(__dirname) } = options;

  let cliName, config;

  let cmd, currLibPath, deleteFilePath;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

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
      fun: () => removeSync(deleteFilePath),
      desc: () => `删除文件 ${deleteFilePath}`,
      failType: "warn",
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => "todo...",
    // },
  ];

  const getCmdList = (selfCmd) => CmdList.getFormatListFilter({ cmd: selfCmd });

  return {
    async prompt(...args) {
      const config = args.pop(); // 最后一个为配置项

      const [arg] = args;

      let answers = {};

      answers = await prompt([
        {
          type: "list",
          name: "cmd",
          message: "请选择要删除的命令:",
          choices: getCmdList(_name),
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
