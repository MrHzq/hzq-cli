const {
  getFileList,
  newFileName,
  createUniqueFileName,
} = require("../../utils/fs");
const { getFullPathBy } = require("../../utils/path");

module.exports = async (_, options = {}) => {
  const CmdList = require("../../bin/handleCmdList");
  const { prompt, notNumberRule } = require("../../utils/inquirer");

  const ffmpeg = require("../../utils/video");

  let cliName, videoPathList;

  // 初始化变量
  const initVar = (answers) => {
    cliName = CmdList.getCliName();

    videoPathList = answers.videoPathList;
  };

  const runMain = async () => {
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
    async prompt(arg) {
      const needList = arg === "ls";

      return await prompt([
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
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
