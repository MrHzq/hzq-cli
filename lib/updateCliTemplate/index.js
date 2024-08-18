const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const path = require("path");
const { readdirSync, statSync, removeDir, copyDir } = require("../../utils/fs");
const {
  processRun,
  cdPath,
  gitAdd,
  gitCommit,
} = require("../../utils/process");
const { formatTime } = require("../../utils/common");

const currFilePath = path.dirname(path.dirname(__dirname));
const targetFileName = "cli-template-2024";
const targetFilePath = path.join(currFilePath, `../${targetFileName}`);

let mainSpinner, needUpdateDir, noUpdateFile, handleFile;

// 初始化变量
const initVar = () => {
  needUpdateDir = ["bin", "config", "lib", "utils"];
  noUpdateFile = ["cmdList.json"];
  handleFile = [];
};

const update = () => {
  needUpdateDir.forEach((dir) => {
    const filePath = path.join(targetFilePath, dir);

    readdirSync(filePath).forEach((file) => {
      const _filePath = path.join(filePath, file);

      if (noUpdateFile.includes(file)) return;

      const t = _filePath;

      const s = _filePath.replace(targetFilePath, currFilePath);

      removeDir(t);
      copyDir(s, t);
      handleFile.push(_filePath.replace(targetFilePath, ""));
    });
  });

  return {
    success: true,
    tip: `已处理文件: \n${handleFile.join("\n")}`,
  };
};

const gitOp = () => {
  cdPath(targetFilePath);
  gitAdd();
  gitCommit(`auto update from hzq-cli - ${formatTime()}`);
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: update,
    desc: () => "删除&拷贝",
  },
];

// todo 流程 - step 集合
const todoStepList = [
  {
    desc: () => `cd ${targetFileName}`,
  },
];

module.exports = async (_, options) => {
  const { _description, parent } = options;

  initVar();

  mainSpinner = new Spinner(_description);

  mainSpinner.start();

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();

    await gitOp();

    log.newLine();

    log.warn("next todo");
    runStep(todoStepList, "warn");
  } else {
    mainSpinner.fail();
  }
};
