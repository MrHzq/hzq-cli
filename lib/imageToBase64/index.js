const { prompt, notNumberRule, requireRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const { getDirName, getCmdName, getFullPathBy } = require("../../utils/path");
const { getFileList } = require("../../utils/fs");
const Spinner = require("../../utils/spinner");
const { IMAGE_TYPE_LIST } = require("../../utils/constant");
const { imageToBase64 } = require("../../plugins/sharp");
const { processRun } = require("../../utils/process");

module.exports = async (_, options = {}) => {
  const {
    _name = getDirName(__dirname),
    _cmdName = getCmdName(),
    _description,
  } = options;

  let cliName, config, configType;

  let filePathList, successList;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    filePathList = answers.filePathList;

    successList = [];
  };

  const runMain = async () => {
    // 运行命令...
    if (!Array.isArray(filePathList)) filePathList = [filePathList];

    const total = filePathList.length;

    if (total === 0) return "未找到文件";

    const forLoading = new Spinner();

    for (let i = 0; i < total; i++) {
      forLoading.start(`当前进度: ${i + 1}/${total}`);

      const forItem = filePathList[i];

      const params = {
        imagePath: getFullPathBy(forItem),
      };

      const { success, res } = await imageToBase64(params);
      if (success) {
        successList.push(res);
        log.succeed(`base64 已存入 ${res}`, true);
      }
    }

    forLoading.stop();

    return {
      success: successList.length > 0,
      tip: log.batchLog(filePathList, successList),
    };
  };

  const open = async () => {
    if (successList.length === 1) processRun(`open ${successList[0]}`);
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => _description,
    },
    {
      fun: open,
      desc: () => `系统命令打开 txt`,
      delay: 5,
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
      let [arg] = args;

      const needList = arg === "ls";

      if (needList) arg = "";

      const defaultFilterList = IMAGE_TYPE_LIST;
      const defaultIgnoreList = [];

      const choices = getFileList(
        defaultFilterList.join("||"),
        defaultIgnoreList.join("||")
      );

      let answers = {};

      let firstPrompt = {
        type: "input",
        name: "filePathList",
        message: "请输入:",
        validate: notNumberRule,
      };

      answers = await prompt([
        needList && choices.length
          ? {
              type: "checkbox",
              name: "filePathList",
              message: `请选择文件(可选${choices.length}个):`,
              choices,
              validate: requireRule,
            }
          : firstPrompt,
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
