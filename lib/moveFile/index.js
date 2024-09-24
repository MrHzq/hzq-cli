const { prompt, requireRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const path = require("path");
const { checkFileExist, moveSync, getFileList } = require("../../utils/fs");
const { getFullPathBy, getCwdRePath, getDirName } = require("../../utils/path");

module.exports = async (_, options = {}) => {
  const { _name = getDirName(__dirname), _description } = options;

  let cliName, config, configType;

  let fileList, successFileList, failFileList, moveDir;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    fileList = answers.fileList;
    moveDir = answers.moveDir;

    successFileList = [];
    failFileList = [];
  };

  const runMain = async () => {
    // 运行命令...
    if (!Array.isArray(fileList)) fileList = [fileList];

    if (fileList.length === 0) return "没有待移动的文件";

    for (let index = 0; index < fileList.length; index++) {
      const file = fileList[index];
      const fileFullPath = getFullPathBy(file);

      const moveFullDir = path.join(getCwdRePath(moveDir), file);

      if (checkFileExist(file)) {
        moveSync(fileFullPath, moveFullDir);

        if (checkFileExist(file)) failFileList.push(file);
        else successFileList.push(moveFullDir);
      } else failFileList.push(file);
    }

    return {
      success: true,
      tip: log.batchLog(fileList, successFileList, failFileList),
    };
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => _description,
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => "todo...",
    // },
  ];

  return {
    // 第一个 _config 为配置项
    async prompt(_config, ...args) {
      const [arg] = args;

      const filterKey = arg === "space" ? " " : arg; // 要查找的关键词

      const choices = getFileList(
        (filterKey ?? "").replace(new RegExp(",", "g"), "||")
      );

      if (choices.length === 0) return log.warn("未找到相关文件");

      let answers = {};

      answers = await prompt([
        {
          type: "checkbox",
          name: "fileList",
          message: `请选择要移动的文件(可选${choices.length}个):`,
          choices,
        },
        {
          type: "input",
          name: "moveDir",
          message: `请输入目标文件夹:`,
          validate: requireRule,
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
