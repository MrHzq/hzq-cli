const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { getFileList, createUniqueNameBy } = require("../../utils/fs");
const { getFullPathBy } = require("../../utils/path");
const ffmpeg = require("../../utils/ffmpeg");
const Spinner = require("../../utils/spinner");
const log = require("../../utils/log");

module.exports = async (_, options = {}) => {
  const { _name = getDirName(__dirname), _description } = options;

  let cliName, config;

  let videoPathList;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    videoPathList = answers.videoPathList;
  };

  const runMain = async () => {
    if (!Array.isArray(videoPathList)) videoPathList = [videoPathList];

    const total = videoPathList.length;

    if (total === 0) return "没有视频文件";

    const info = new Spinner();

    for (let i = 0; i < total; i++) {
      info.start(`当前进度: ${i + 1}/${total}`);
      const videoPath = videoPathList[i];
      const videoFullPath = getFullPathBy(videoPath);

      log.succeed(await ffmpeg.info(videoFullPath), true);
    }

    info.do("stopAndPersist");
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

      const choices = getFileList(
        [".mp4", ".mov", ".avi", ".MP4", ".MOV"].join("||"),
        "",
        "size"
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
  };
};
