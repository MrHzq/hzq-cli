const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { getFileList, newFileName, checkFileExist } = require("../../utils/fs");
const { getFullPathBy } = require("../../utils/path");
const { videoTo3D } = require("./to3D");
const log = require("../../utils/log");
const path = require("path");
const Spinner = require("../../utils/spinner");

module.exports = async (_, options = {}) => {
  let cliName, config;

  let videoPathList, outFileList;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    videoPathList = answers.videoPathList;

    outFileList = [];
  };

  // 视频转为 3D
  const videoTo3DStep = async () => {
    if (!Array.isArray(videoPathList)) videoPathList = [videoPathList];

    const total = videoPathList.length;

    if (total === 0) return "没有视频文件";

    const to3D = new Spinner("视频转为 3D");

    for (let i = 0; i < total; i++) {
      to3D.start(`当前进度: ${i + 1}/${total}`);
      const videoPath = videoPathList[i];
      const videoFullPath = getFullPathBy(videoPath);
      const outPath = newFileName(videoFullPath, { suffix: "3d" });
      const videoTo3DParams = {
        videoPath: videoFullPath,
        outPath,
      };

      if (!checkFileExist(outPath)) {
        try {
          const res = await videoTo3D(videoTo3DParams);

          outFileList.push(res);
        } catch (error) {}
      } else {
        log.warn(`${path.basename(outPath)} 已存在`);
      }
    }

    to3D.succeed();

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

  return {
    async prompt(...args) {
      const config = args.pop(); // 最后一个为配置项

      const [arg] = args;

      const needList = arg === "ls";

      let answers = {};

      const choices = getFileList(
        [".mp4"],
        ["3d", "n3od"],
        "size",
        (videoPath) => {
          const videoFullPath = getFullPathBy(videoPath);
          const outPath = newFileName(videoFullPath, { suffix: "3d" });
          return !checkFileExist(outPath);
        }
      );

      answers = await prompt([
        needList
          ? {
              type: "checkbox",
              name: "videoPathList",
              message: `请选择文件(可选${choices.length}个):`,
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
