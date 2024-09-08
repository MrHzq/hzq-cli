const { prompt, notNumberRule, isNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { getFileList } = require("../../utils/fs");
const { video2Gif } = require("./toGif");
const { getFullPathBy, getFileName } = require("../../utils/path");
const Spinner = require("../../utils/spinner");

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

  // 视频转为 GIF
  const runMain = async () => {
    if (!Array.isArray(videoPathList)) videoPathList = [videoPathList];

    const total = videoPathList.length;

    if (total === 0) return "没有视频文件";

    const toGif = new Spinner();

    for (let i = 0; i < total; i++) {
      toGif.start(`当前进度: ${i + 1}/${total}`);
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

      // if (!checkFileExist(outPath)) {
      try {
        const res = await video2Gif(params);

        successPathList.push(res);
      } catch (error) {}
      // } else {
      //   log.warn(`${path.basename(outPath)} 已存在`);
      // }
    }

    toGif.do("stopAndPersist");

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

      const choices = getFileList([".mp4"], "", "size");

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
