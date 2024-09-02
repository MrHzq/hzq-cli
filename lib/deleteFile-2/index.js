const { prompt } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { checkFileExist, getFileList, removeDir } = require("../../utils/fs");
const log = require("../../utils/log");

module.exports = async (_, options = {}) => {
  let cliName, config;

  let mainSpinner;

  let file, noDoubleCheck;

  // 初始化变量
  const initVar = (answers, mainSpinner) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    mainSpinner = mainSpinner;

    file = answers.file;
  };

  const deleteFile = async () => {
    if (checkFileExist(file)) {
      if (noDoubleCheck) {
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
      desc: () => `已确认删除 ${file}`,
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => "todo...",
    // },
  ];

  return {
    async prompt(...args) {
      const [arg] = args;

      const choices = getFileList(arg);

      if (choices.length === 0) return log.warn("未找到相关文件");

      if (arg) noDoubleCheck = true;
      const answers = await prompt([
        {
          type: "list",
          name: "file",
          message: `请选择要删除的文件(共${choices.length}个):`,
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
