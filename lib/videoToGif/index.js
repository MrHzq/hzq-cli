const { prompt, notNumberRule, isNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const {
  getFileList,
  logFileDetail,
  createUniqueFileName,
} = require("../../utils/fs");
const { compressGif } = require("./compressGif");
const { video2Gif } = require("./toGif");
const { getFullPathBy, getFileName, currCwdPath } = require("../../utils/path");

module.exports = async (_, options = {}) => {
  let cliName, config;

  let videoPath, gifWidth, gifFps, startTime, duration, gifFileName, gifOutPath;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    videoPath = getFullPathBy(answers.videoPath);

    gifWidth = answers.gifWidth;
    gifFps = answers.gifFps;
    startTime = answers.startTime;
    duration = answers.duration;

    gifFileName = answers.gifFileName;

    if (gifFileName.includes("[]")) {
      gifFileName = gifFileName.replace("[]", getFileName(videoPath)[0]);
    }
    gifOutPath = createUniqueFileName(getFullPathBy(gifFileName));
  };

  const videoToGifStep = async () => {
    try {
      const params = {
        videoPath,
        gifWidth,
        gifFps,
        startTime,
        duration,
        gifOutPath,
      };

      log.newLine();
      log.info("转换参数", params);

      const outFile = await video2Gif(params);

      return {
        success: true,
        onSuccess() {
          log.newLine();
          logFileDetail(outFile);
        },
      };
    } catch (error) {
      return error.message;
    }
  };

  const compressGifStep = async () => {
    try {
      const outFile = await compressGif(gifOutPath);
      return {
        success: true,
        onSuccess() {
          log.newLine();
          logFileDetail(outFile);
        },
      };
    } catch (error) {
      return error.message;
    }
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: videoToGifStep,
      desc: () => "视频转为 GIF",
    },
    // {
    //   fun: compressGifStep,
    //   desc: () => "压缩 GIF",
    // },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => "todo...",
    // },
  ];

  // 生成当前配置对应的 prompt
  const createConfigPromptList = (config) => {
    const promptList = [
      {
        type: "input",
        name: "gifWidth",
        message: "请输入 GIF 宽度(高度会等比缩放):",
        default: config.gifWidth,
        validate: isNumberRule,
      },
      {
        type: "input",
        name: "gifFps",
        message: "请输入 GIF 帧率:",
        default: config.gifFps,
        validate: isNumberRule,
      },
      {
        type: "input",
        name: "startTime",
        message: "请输入开始时间(秒):",
        default: config.startTime,
        validate: isNumberRule,
      },
      {
        type: "input",
        name: "duration",
        message: "请输入持续时间(秒):",
        default: config.duration,
        validate: isNumberRule,
      },
      {
        type: "input",
        name: "gifFileName",
        message: `请输入 GIF 文件名(存放目录${currCwdPath}):`,
        default: config.gifFileName,
        validate: notNumberRule,
      },
    ];

    return promptList;
  };

  return {
    async prompt(...args) {
      const config = args.pop(); // 最后一个为配置项

      const reset = args[0] === "reset";

      if (reset) args.shift(); // 若需要重置，则将第一个参数删除掉

      // promptList 按情况使用
      const promptList = createConfigPromptList(reset ? {} : config);

      const [arg] = args;

      const needList = arg === "ls";

      let answers = {};

      answers = await prompt([
        needList
          ? {
              type: "list",
              name: "videoPath",
              message: "请选择文件:",
              choices: getFileList([".mp4"], "", "size"),
            }
          : {
              type: "input",
              name: "videoPath",
              message: "请输入视频文件路径:",
              validate: notNumberRule,
            },
        ...promptList,
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
