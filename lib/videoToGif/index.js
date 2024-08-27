const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt, numberRule } = require("../../utils/inquirer");
const path = require("path");
const { video2Gif } = require("./toGif");
const { compressGif } = require("./compressGif");
const { currCwdPath } = require("../../utils/path");

const { getFileList, checkFileExist } = require("../../utils/fs");

let mainSpinner;

let cmd, videoPath, gifPath, width, fps;

// 初始化变量
const initVar = (answers) => {
  cmd = answers.cmd;
  videoPath = path.join(currCwdPath, answers.videoPath);
  gifPath = path.join(currCwdPath, answers.gifPath);
  // if (checkFileExist(gifPath))
  //   gifPath = path.join(
  //     currCwdPath,
  //     (Math.random() * 1000).toFixed(4) + "_" + answers.gifPath
  //   );
  width = answers.width;
  fps = answers.fps;
};

const video2GifStep = async () => {
  await video2Gif({
    videoPath,
    gifPath,
    width,
    fps,
  });
};

const compressGifStep = async () => {
  await compressGif(
    path.join(currCwdPath, "./index.gif"),
    path.join(currCwdPath, "./indexCom.gif")
  );
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: video2GifStep,
    desc: () => "视频转为 GIF",
  },
  // {
  //   fun: compressGifStep,
  //   desc: () => "compressGifStep",
  // },
];

module.exports = async (_, options) => {
  const { _description, args } = options;

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
          validate: numberRule,
        },
    {
      type: "input",
      name: "gifPath",
      message: "请输入 GIF 存放位置:",
      default: "./index.gif",
    },
    {
      type: "input",
      name: "width",
      message: "请输入 GIF 宽度:",
      default: 600,
    },
    {
      type: "input",
      name: "fps",
      message: "请输入 GIF 帧率:",
      default: 80,
    },
  ]);

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
