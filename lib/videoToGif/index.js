const { prompt, notNumberRule, isNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { getFileList, checkFileExist } = require("../../utils/fs");
const { getFullPathBy, getFileName } = require("../../utils/path");
const log = require("../../utils/log");
const path = require("path");
const Spinner = require("../../utils/spinner");
const ffmpeg = require("../../plugins/ffmpeg");
const fluentFfmpeg = require("../../plugins/fluent-ffmpeg");

module.exports = async (_, options = {}) => {
  const { _name = getDirName(__dirname), _description } = options;

  let cliName, config, configType;

  let videoPathList, gifFps, startTime, duration, successPathList;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    videoPathList = answers.videoPathList;

    gifFps = answers.gifFps;
    startTime = answers.startTime;
    duration = answers.duration;

    successPathList = [];
  };

  const runMain = async () => {
    const currUseFfmpeg = (await ffmpeg.checkFn("videoToGif"))
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
      const outPath = [getFullPathBy(getFileName(videoPath)[0]), "gif"].join(
        "."
      );
      const params = {
        videoPath: videoFullPath,
        gifFps,
        startTime,
        duration,
        outPath,
      };

      if (!checkFileExist(outPath)) {
        log.chalk(`执行参数：${JSON.stringify(params, null, 2)}`, "blue");

        const { success, res } = await currUseFfmpeg.videoToGif(params);
        if (success) {
          successPathList.push(res);
        }
      } else {
        log.warn(`${path.basename(outPath)} 已存在`);
      }
    }

    info.stop();

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

  // 生成当前配置对应的 prompt
  const createConfigPromptList = (config) => {
    const promptList = [];

    const configKeys = Object.keys(config);
    const configLen = configKeys.length;

    if (!configLen) configType = "add";

    promptList.push(
      ...[
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
      ]
    );

    return promptList;
  };

  return {
    // 第一个 _config 为配置项
    async prompt(_config, ...args) {
      configType = args[0];

      if (["reset", "add"].includes(configType)) args.shift(); // 若需要重置/新增，则将第一个参数删除掉

      // promptList 按情况使用
      const promptList = createConfigPromptList(_config, configType);

      const [arg] = args;

      const needList = arg === "ls";

      const choices = getFileList(
        [".mp4", ".mov", ".avi", ".MP4", ".MOV"].join("||"),
        "",
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
        ...promptList,
      ]);

      answers.configType = configType;

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
