const { prompt, tfList, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { checkFileExist, getFileList, removeSync } = require("../../utils/fs");
const log = require("../../utils/log");

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname), _description } = options;

  let cliName, config;

  let needDoubleCheck, fileList, successFileList, failFileList;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    fileList = answers.fileList;

    needDoubleCheck = fileList.length === 1;

    successFileList = [];
    failFileList = [];
  };

  const runMain = async ({ mainSpinner }) => {
    if (!Array.isArray(fileList)) fileList = [fileList];

    if (fileList.length === 0) return "没有待删除的文件";

    for (let index = 0; index < fileList.length; index++) {
      const file = fileList[index];

      if (checkFileExist(file)) {
        if (needDoubleCheck) {
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

        removeSync(file);

        if (checkFileExist(file)) failFileList.push(file);
        else successFileList.push(file);
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
      desc: () => `${fileList.length ? "批量" : ""}删除文件`,
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => "todo...",
    // },
  ];

  return {
    async prompt(_config, ...args) {
      let [arg] = args;

      const needList = arg === "ls";

      if (needList) arg = "";

      const choices = getFileList(
        (arg ?? "").replace(new RegExp(",", "g"), "||")
      );

      let answers = {};

      answers = await prompt([
        needList && choices.length
          ? {
              type: "checkbox",
              name: "fileList",
              message: `请选择要删除的文件(可选${choices.length}个):`,
              choices,
            }
          : {
              type: "input",
              name: "fileList",
              message: "请输入文件路径:",
              validate: notNumberRule,
            },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
