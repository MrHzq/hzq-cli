const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const {
  getFileList,
  logFileDetail,
  checkFileExist,
} = require("../../utils/fs");
const log = require("../../utils/log");
const { checkFnAndGetFfmpeg } = require("../../plugins");
const sharp = require("sharp");
const { imageInfo } = require("../../plugins/sharp");

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname), _description } = options;

  let cliName, config;

  let file;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    file = answers.file;
  };

  const runMain = async () => {
    // 运行命令...
    const stat = await logFileDetail(file);

    if (stat.isVideo) {
      const currUseFfmpeg = await checkFnAndGetFfmpeg("videoTo3D");
      const { success, res } = await currUseFfmpeg.videoInfo({
        videoPath: stat.fullPath,
      });
      if (success) log.succeed(res);
    } else if (stat.isImage) {
      const metadata = await imageInfo(stat.fullPath);
      if (metadata.infoStr) log.succeed(metadata.infoStr);
    }
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => "查看文件详情",
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
      const [arg, arg2] = args;

      let answers = {};

      if (checkFileExist(arg)) {
        answers = { file: arg };
      } else {
        const needList = arg === "ls";

        const choices = getFileList(
          (arg2 ?? "").replace(new RegExp(",", "g"), "||")
        );

        answers = await prompt(
          needList && choices.length
            ? [
                {
                  type: "list",
                  name: "file",
                  message: "请选择文件:",
                  choices,
                },
              ]
            : [
                {
                  type: "input",
                  name: "file",
                  message: "请输入文件路径:",
                  validate: notNumberRule,
                },
              ]
        );
      }

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
