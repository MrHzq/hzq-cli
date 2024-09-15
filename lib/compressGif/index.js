const { prompt, notNumberRule, requireRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const { getDirName, getCmdName, getFullPathBy } = require("../../utils/path");
const { getFileList } = require("../../utils/fs");
const { compressGif } = require("../../plugins/sharp");
const Spinner = require("../../utils/spinner");

module.exports = async (_, options = {}) => {
  const {
    _name = getDirName(__dirname),
    _cmdName = getCmdName(),
    _description,
  } = options;

  let cliName, config, configType;

  let gifPathList, successPathList;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    gifPathList = answers.gifPathList;
    successPathList = [];
  };

  const runMain = async () => {
    // 运行命令...
    if (!Array.isArray(gifPathList)) gifPathList = [gifPathList];

    const total = gifPathList.length;

    if (total === 0) return "没有 GIF 文件";

    const forLoading = new Spinner();

    for (let i = 0; i < total; i++) {
      forLoading.start(`当前进度: ${i + 1}/${total}`);
      const gifPath = gifPathList[i];
      const gifFullPath = getFullPathBy(gifPath);
      const params = {
        gifPath: gifFullPath,
      };

      log.chalk(`执行参数：${JSON.stringify(params, null, 2)}`, "blue");

      const { success, res } = await compressGif(params);
      if (success) {
        successPathList.push(res);
      }
    }

    forLoading.stop();

    return {
      success: successPathList.length > 0,
      tip: log.batchLog(gifPathList, successPathList),
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

      let answers = {};

      const needList = arg === "ls";

      const choices = getFileList([".gif", ".GIF"].join("||"), ["compress"]);

      answers = await prompt([
        needList && choices.length
          ? {
              type: "checkbox",
              name: "gifPathList",
              message: `请选择文件(可选${choices.length}个):`,
              choices,
              validate: requireRule,
            }
          : {
              type: "input",
              name: "gifPathList",
              message: "请输入GIF文件路径:",
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
