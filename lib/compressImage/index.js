const { prompt, notNumberRule, requireRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const { getDirName, getCmdName, getFullPathBy } = require("../../utils/path");
const { getFileList } = require("../../utils/fs");
const { compressImage } = require("../../plugins/sharp");
const Spinner = require("../../utils/spinner");
const { IMAGE_TYPE_LIST } = require("../../utils/constant");

module.exports = async (_, options = {}) => {
  const {
    _name = getDirName(__dirname),
    _cmdName = getCmdName(),
    _description,
  } = options;

  let cliName, config, configType;

  let imagePathList, successList;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    imagePathList = answers.imagePathList;
    successList = [];
  };

  const runMain = async () => {
    // 运行命令...
    if (!Array.isArray(imagePathList)) imagePathList = [imagePathList];

    const total = imagePathList.length;

    if (total === 0) return `没有找到文件`;

    const forLoading = new Spinner();

    for (let i = 0; i < total; i++) {
      forLoading.start(`当前进度: ${i + 1}/${total}`);
      const forItem = imagePathList[i];
      const params = {
        imagePath: getFullPathBy(forItem),
      };

      log.chalk(`执行参数：${JSON.stringify(params, null, 2)}`, "blue");

      const { success, res } = await compressImage(params);
      if (success) {
        successList.push(res);
      }
    }

    forLoading.stop();

    return {
      success: successList.length > 0,
      tip: log.batchLog(imagePathList, successList),
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
      let [arg] = args;

      const needList = arg === "ls";

      if (needList) arg = "";

      const defaultFilterList = IMAGE_TYPE_LIST;
      const defaultIgnoreList = ["compress"];

      const choices = getFileList(
        defaultFilterList.join("||"),
        defaultIgnoreList
      );

      let answers = {};

      answers = await prompt([
        needList && choices.length
          ? {
              type: "checkbox",
              name: "imagePathList",
              message: `请选择文件(可选${choices.length}个):`,
              choices,
              validate: requireRule,
            }
          : {
              type: "input",
              name: "imagePathList",
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
