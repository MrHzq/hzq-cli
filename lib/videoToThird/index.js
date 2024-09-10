const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const {
  getFileList,
  createNewNameBy,
  checkFileExist,
  foreAddSuffix,
} = require("../../utils/fs");
const { getFullPathBy } = require("../../utils/path");
const path = require("path");
const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const ffmpeg = require("../../plugins/ffmpeg");
const fluentFfmpeg = require("../../plugins/fluent-ffmpeg");

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
    const currUseFfmpeg = (await ffmpeg.checkFn("videoTo3D"))
      ? ffmpeg
      : fluentFfmpeg;

    if (!Array.isArray(videoPathList)) videoPathList = [videoPathList];

    const total = videoPathList.length;

    if (total === 0) return "没有视频文件";

    const info = new Spinner();

    for (let i = 0; i < total; i++) {
      info.start(`当前进度: ${i + 1}/${total}`);
      const videoPath = videoPathList[i];
      const videoFullPath = getFullPathBy(videoPath);
      const outPath = createNewNameBy(videoFullPath, { suffix: "3d" });
      const params = {
        videoPath: videoFullPath,
        outPath,
      };

      if (!checkFileExist(outPath)) {
        log.chalk(`执行参数：${JSON.stringify(params, null, 2)}`, "blue");

        const { success, res } = await currUseFfmpeg.videoTo3D(params);
        if (success) {
          foreAddSuffix(params.videoPath, "has_3od");
          successPathList.push(res);
        } else {
          foreAddSuffix(params.videoPath, "_n3od");
          foreAddSuffix(params.outPath, "_n3od");
        }
      } else {
        log.warn(`${path.basename(outPath)} 已存在`);
      }
    }

    info.do("stopAndPersist");

    return {
      success: successPathList.length > 0,
      tip: log.batchLog(videoPathList, successPathList),
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
    {
      desc: () => `转换已结束，请及时查看`,
    },
  ];

  return {
    async prompt(_config, ...args) {
      const [arg] = args;

      const needList = arg === "ls";

      const choices = getFileList(
        [".mp4", ".mov", ".avi", ".MP4", ".MOV"].join("||"),
        ["_3d", "has_3od"].join("||"),
        "size"
      );

      let answers = {};

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
    needLogTime: true,
  };
};
