const { prompt, tfList } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const {
  checkFileExist,
  getFileList,
  renameSync,
  utimesSync,
} = require("../../utils/fs");
const log = require("../../utils/log");

module.exports = async (_, options = {}) => {
  let cliName, config;

  let needDoubleCheck,
    fileList,
    successFileList,
    failFileList,
    filterKey,
    replaceKey;

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

    if (fileList.length === 0) return "没有待重命名的文件";

    for (let index = 0; index < fileList.length; index++) {
      const file = fileList[index];

      if (checkFileExist(file)) {
        const newFileName = file.replace(filterKey, replaceKey);

        if (needDoubleCheck) {
          mainSpinner.do("stop");

          const { force } = await prompt([
            {
              type: "list",
              message: `确定重命名为 ${newFileName}`,
              name: "force",
              choices: tfList(true),
            },
          ]);

          if (!force) return "放弃删除";
        }

        renameSync(file, newFileName);

        utimesSync(newFileName);

        if (checkFileExist(file)) failFileList.push(file);
        else successFileList.push(newFileName);
      } else failFileList.push(file);
    }

    return {
      success: true,
      tip: `总共 ${fileList.length} 个，成功 ${
        successFileList.length
      } 个，失败 ${failFileList.length} 个，成功率 ${(
        (successFileList.length / fileList.length) *
        100
      ).toFixed(2)}%`,
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
    async prompt(...args) {
      const config = args.pop(); // 最后一个为配置项

      const [arg, arg2] = args;

      const choices = getFileList([arg], [arg2]);

      filterKey = arg;
      replaceKey = arg2;

      if (choices.length === 0) return log.warn("未找到相关文件");

      let answers = {};

      answers = await prompt([
        {
          type: "checkbox",
          name: "fileList",
          message: `请选择要重命名的文件(可选${choices.length}个):`,
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