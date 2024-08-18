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
    desc: () => cdPath(targetFileName),
  },
  {
    desc: () => gitAdd(),
  },
  {
    desc: () => gitCommit(`auto update from hzq-cli - ${formatTime()}`),
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

    log.newLine();

    log.warn("next todo");
    runStep(todoStepList, "warn", { prefix: "todo" });
  } else {
    mainSpinner.fail();
  }
};
