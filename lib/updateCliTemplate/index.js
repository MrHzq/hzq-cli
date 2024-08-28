const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const path = require("path");
const { readdirSync, removeDir, copyDir } = require("../../utils/fs");
const { cdPath, gitAdd, gitCommit } = require("../../utils/process");
const { formatTime } = require("../../utils/common");
const { readConfig, writeConfig } = require("../../config/handler");
const { prompt, notNumberRule } = require("../../utils/inquirer");
const { getDirRePath } = require("../../utils/path");

const configKey = "updateCliTemplate";

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

let mainSpinner;

let needUpdateDir, noUpdateFile, handleFile;

// 初始化变量
const initVar = () => {
  needUpdateDir = ["bin", "config", "lib", "utils"];
  noUpdateFile = ["cmdList.json", "global.json", ".DS_Store"];
  needUpdateLibFile = ["addCmd", "deleteCmd", "runCmd"];
  handleFile = [];
  currProjectPath = getDirRePath(__dirname, "../../");
};

const update = () => {
  needUpdateDir.forEach((dir) => {
    const cpFile = path.join(currProjectPath, dir);

    readdirSync(cpFile).forEach((file) => {
      if (noUpdateFile.includes(file)) return;

      if (dir === "lib") {
        if (!needUpdateLibFile.includes(file)) return;
      }

      const s = path.join(cpFile, file);
      const t = path.join(config.cliTemDir, s.replace(currProjectPath, ""));
      removeDir(t);
      copyDir(s, t);
      handleFile.push(s.replace(currProjectPath, ""));
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
    desc: () => cdPath(config.cliTemDir),
  },
  {
    desc: () => gitAdd(),
  },
  {
    desc: () => gitCommit(`feat: auto update from hzq-cli - ${formatTime()}`),
  },
];

// 生成当前 prompt
const handlePromptList = () => {
  const promptList = [];

  const cliTemDirPrompt = {
    type: "type",
    name: "cliTemDir",
    message: "请输入项目目录:",
    default: config.cliTemDir,
    validate: notNumberRule,
  };

  promptList.push(cliTemDirPrompt);

  return promptList;
};

module.exports = async (_, options) => {
  const { _description } = options;

  getConfig();

  const promptList = handlePromptList();

  let answers = {};

  if (promptList.length) {
    answers = await prompt(promptList);
    Object.assign(config, answers);
    setConfig();
  }

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

    log.newLine();

    log.warn("next todo");
    runStep(todoStepList, "warn", { prefix: "todo" });
  } else {
    mainSpinner.fail();
  }
};
