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

  const getCmdList = (selfCmd, filterCmd) => {
    return CmdList.getFormatListFilter({
      filterValue: { name: filterCmd },
      notFilterValue: { value: selfCmd },
    });
  };

  return {
    async prompt(_config, ...args) {
      const [arg] = args;

      const filterValue = {};

      if (arg) filterValue.name = arg;

      const choices = getCmdList(_name, arg);

      if (choices.length === 0) return log.warn("未找到相关命令");

      let answers = {};

      answers = await prompt([
        {
          type: "list",
          name: "cmd",
          message: `请选择要删除的命令(共 ${choices.length} 个):`,
          choices,
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
