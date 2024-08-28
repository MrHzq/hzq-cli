const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt, notNumberRule, isNumberRule } = require("../../utils/inquirer");
const { video2Gif } = require("./toGif");
const { compressGif } = require("./compressGif");
const { currCwdPath, getFullPathBy, getFileName } = require("../../utils/path");
const {
  getFileList,
  logFileDetail,
  createUniqueFileName,
} = require("../../utils/fs");
const { readConfig, writeConfig } = require("../../config/handler");

const configKey = "videoToGif";

let mainSpinner;

let config,
  videoPath,
  gifWidth,
  gifFps,
  startTime,
  duration,
  gifFileName,
  gifOutPath;

// 获取当前所需配置
const getConfig = () => {
  const allConfig = readConfig() || {};
  config = allConfig[configKey] || {};
};

// 设置当前所得配置
const setConfig = () => {
  const allConfig = readConfig() || {};
  writeConfig({ ...allConfig, [configKey]: config });
};

// 初始化变量
const initVar = (answers) => {
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
  {
    fun: compressGifStep,
    desc: () => "压缩 GIF",
  },
];

module.exports = async (_, options) => {
  const { _description, args } = options;

  getConfig();

  const needList = args?.[0] === "ls";

  const answers = await prompt([
    needList
      ? {
          type: "list",
          name: "videoPath",
          message: "请选择文件:",
          choices: getFileList(".mp4"),
        }
      : {
          type: "input",
          name: "videoPath",
          message: "请输入视频文件路径:",
          validate: notNumberRule,
        },
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
  ]);

  Object.assign(config, answers);
  setConfig();

  initVar(answers);

  if (mainStepList.length === 1) return await mainStepList[0].fun();

  mainSpinner = new Spinner(_description);

  mainSpinner.start();

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();
  } else {
    mainSpinner.fail();
  }
};
