const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { getFileList, checkFileExist } = require("../../utils/fs");
const { getFullPathBy, getDirName } = require("../../utils/path");
const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const { checkFnAndGetFfmpeg } = require("../../plugins");
const { VIDEO_TYPE_LIST } = require("../../utils/constant");

module.exports = async (_, options = {}) => {
  const { _name = getDirName(__dirname), _description } = options;

  let cliName, config;

  let videoPathList, successPathList;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    videoPathList = answers.videoPathList;

    successPathList = [];
  };

  const runMain = async () => {
    const currUseFfmpeg = await checkFnAndGetFfmpeg("videoInfo");

    if (!Array.isArray(videoPathList)) videoPathList = [videoPathList];

    const total = videoPathList.length;

    if (total === 0) return "没有视频文件";

    const info = new Spinner();

    for (let i = 0; i < total; i++) {
      info.start(`当前进度: ${i + 1}/${total}`);
      const videoPath = videoPathList[i];
      const videoFullPath = getFullPathBy(videoPath);
      const params = {
        videoPath: videoFullPath,
      };

      if (checkFileExist(videoFullPath)) {
        // log.chalk(`执行参数：${JSON.stringify(params, null, 2)}`, "blue");

        const { success, res } = await currUseFfmpeg.videoInfo(params);
        if (success) {
          successPathList.push({
            videoPath,
            videoFullPath,
            res,
          });
        }
      }
    }

    info.stop();

    return {
      success: successPathList.length > 0,
      onSuccess() {
        successPathList.forEach(({ videoPath, res }) => {
          log.succeed(`视频文件: ${videoPath}`, true);
          log.succeed(res);
        });
      },
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
    async prompt(_config, ...args) {
      const [arg] = args;

      const needList = arg === "ls";

      let answers = {};

      const choices = getFileList(VIDEO_TYPE_LIST.join("||"), "", "size");

      answers = await prompt([
        needList && choices.length
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
