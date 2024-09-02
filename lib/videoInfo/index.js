const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const {
  getFileList,
  newFileName,
  createUniqueFileName,
} = require("../../utils/fs");
const { getFullPathBy } = require("../../utils/path");
const ffmpeg = require("../../utils/video");

module.exports = async (_, options = {}) => {
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

      const outPath = createUniqueFileName(videoFullPath, {
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
    async prompt(...args) {
      const config = args.pop(); // 最后一个为配置项

      const [arg] = args;

      const needList = arg === "ls";

      let answers = {};

      answers = await prompt([
        needList
          ? {
              type: "checkbox",
              name: "videoPathList",
              message: "请选择文件:",
              choices: getFileList([".mp4"], ["3d"], "size"),
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
