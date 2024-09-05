const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { getFileList, createUniqueNameBy } = require("../../utils/fs");
const { getFullPathBy } = require("../../utils/path");
const ffmpeg = require("../../utils/video");

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname) } = options;

  let cliName, config;

  let videoPathList;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    videoPathList = answers.videoPathList;
  };

  const runMain = async () => {
    // 运行命令...
    if (!Array.isArray(videoPathList)) videoPathList = [videoPathList];

    videoPathList.forEach(async (videoPath) => {
      const videoFullPath = getFullPathBy(videoPath);

      const outPath = createUniqueNameBy(videoFullPath, {
        suffix: "213qwsazx",
      });

      await ffmpeg({ videoPath: videoFullPath, outPath });
    });
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => "运行",
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
      const [arg] = args;

      const needList = arg === "ls";

      let answers = {};

      const choices = getFileList([".mp4"], "", "size");

      answers = await prompt([
        needList && choices.length
          ? {
              type: "checkbox",
              name: "videoPathList",
              message: "请选择文件:",
              choices,
            }
          : {
              type: "input",
              name: "videoPathList",
              message: "请输入视频文件路径:",
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
