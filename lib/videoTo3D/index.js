module.exports = async (_, options = {}) => {
  const { getFullPathBy } = require("../../utils/path");
  const { prompt, notNumberRule } = require("../../utils/inquirer");
  const {
    getFileList,
    newFileName,
    checkFileExist,
  } = require("../../utils/fs");
  const { videoTo3D } = require("./to3D");

  let videoPathList, outFileList;

  // 初始化变量
  const initVar = (answers) => {
    videoPathList = answers.videoPathList;

    outFileList = [];
  };

  // 视频转为 3D
  const videoTo3DStep = async () => {
    if (!Array.isArray(videoPathList)) videoPathList = [videoPathList];

    if (videoPathList.length === 0) return "没有视频文件";

    // 生成 Promise 列表
    const outFileListPromise = videoPathList
      .map((videoPath) => {
        const videoFullPath = getFullPathBy(videoPath);
        const outPath = newFileName(videoFullPath, { suffix: "3d" });
        return {
          videoPath: videoFullPath,
          outPath,
        };
      })
      .filter(({ outPath }) => !checkFileExist(outPath))
      .map(({ videoPath, outPath }) => {
        return videoTo3D({
          videoPath,
          outPath,
        });
      });

    // 执行 Promise 列表
    outFileList = await Promise.allSettled(outFileListPromise);

    outFileList = outFileList.filter(
      (outPath) => outPath.status === "fulfilled"
    );

    return {
      success: true,
      tip: `总共 ${videoPathList.length} 个，成功 ${
        outFileList.length
      } 个，失败 ${videoPathList.length - outFileList.length} 个，成功率 ${(
        (outFileList.length / videoPathList.length) *
        100
      ).toFixed(2)}%`,
    };
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: videoTo3DStep,
      desc: () => "视频转为 3D",
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    {
      desc: () => `视频已转换完毕，请及时查看`,
    },
  ];

  console.log(1);

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
