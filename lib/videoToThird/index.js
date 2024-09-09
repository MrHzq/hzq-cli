const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const {
  getFileList,
  createNewNameBy,
  checkFileExist,
  renameSync,
  utimesSync,
  foreAddSuffix,
} = require("../../utils/fs");
const { getFullPathBy } = require("../../utils/path");
const { videoTo3D } = require("./to3D");
const log = require("../../utils/log");
const path = require("path");
const Spinner = require("../../utils/spinner");
const ffmpeg = require("../../utils/ffmpeg");

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

  // 视频转为 3D
  const runMain = async () => {
    if (!Array.isArray(videoPathList)) videoPathList = [videoPathList];

    const total = videoPathList.length;

    if (total === 0) return "没有视频文件";

    const to3D = new Spinner();

    for (let i = 0; i < total; i++) {
      to3D.start(`当前进度: ${i + 1}/${total}`);
      const videoPath = videoPathList[i];
      const videoFullPath = getFullPathBy(videoPath);
      const outPath = createNewNameBy(videoFullPath, { suffix: "3d" });
      const params = {
        videoPath: videoFullPath,
        outPath,
      };

      if (!checkFileExist(outPath)) {
        try {
          log.chalk(`转换参数：${JSON.stringify(params, null, 2)}`, "blue");

          const res = await ffmpeg.to3D(params);

          foreAddSuffix(params.videoPath, "has_3od");

          successPathList.push(res);
        } catch (error) {
          console.log("error", error);

          foreAddSuffix(params.videoPath, "_n3od");
          foreAddSuffix(params.outPath, "_n3od");
        }
      } else {
        log.warn(`${path.basename(outPath)} 已存在`);
      }
    }

    to3D.do("stopAndPersist");

    return {
      success: true,
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
      desc: () => `已转换完毕，请及时查看`,
    },
  ];

  return {
    async prompt(_config, ...args) {
      const [arg] = args;

      const needList = arg === "ls";

      let answers = {};

      const choices = getFileList(
        [".mp4", ".mov", ".avi", ".MP4", ".MOV"].join("||"),
        ["_3d", "has_3od"].join("||"),
        "size"
        // (videoPath) => {
        //   console.log(
        //     "%c [ videoPath ]-「videoToThird/index.js」",
        //     "font-size:13px; background:#98a8de; color:#dcecff;",
        //     videoPath
        //   );
        //   const videoFullPath = getFullPathBy(videoPath);
        //   const outPath = createNewNameBy(videoFullPath, { suffix: "3d" });
        //   return !checkFileExist(outPath);
        // }
      );

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
