const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt, notNumberRule } = require("../../utils/inquirer");
const { getFileList, newFileName, logFileDetail } = require("../../utils/fs");
const { videoTo3D } = require("./to3D");
const { getFullPathBy } = require("../../utils/path");

let mainSpinner;

let videoPath, outPath;

// 初始化变量
const initVar = (answers) => {
  videoPath = getFullPathBy(answers.videoPath);

  outPath = newFileName(videoPath, { suffix: "3d" });
};

const videoTo3DStep = async () => {
  const outFile = await videoTo3D({
    videoPath,
    outPath,
  });

  return {
    success: true,
    onSuccess() {
      log.newLine();
      logFileDetail(outFile);
    },
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
    desc: () => `请查看 ${outPath}`,
  },
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
          validate: notNumberRule,
        },
  ]);

  initVar(answers);

  mainSpinner = new Spinner(_description);

  if (mainStepList.length === 1 && !todoStepList?.length) {
    await mainStepList[0].fun();
    return mainSpinner.succeed();
  }

  mainSpinner.start();

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();

    log.warn("next todo", true);
    runStep(todoStepList, "warn", { prefix: "todo" });
  } else {
    mainSpinner.fail();
  }
};
