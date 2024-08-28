const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const {
  readdirSync,
  statSync,
  removeDir,
  writeFileSync,
  readFileSync,
  logFileDetail,
  fileDetail,
  filterFileList,
} = require("../../utils/fs");
const { prompt } = require("../../utils/inquirer");
const path = require("path");
const { readConfig, writeConfig } = require("../../config/handler");
const { processRun } = require("../../utils/process");

const configKey = "replaceLang";

let mainSpinner;

let cmd, config, findLangFileName, findLangFilePath;

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
  cmd = answers.cmd;
};

// 查找新下载的语言包
const findLang = () => {
  try {
    const fileList = filterFileList(
      readdirSync(config.langDownDir),
      config.langFileKwd
    ).sort((a, b) => {
      const statA = statSync(path.join(config.langDownDir, a));
      const statB = statSync(path.join(config.langDownDir, b));
      if (statA.mtimeMs - statB.mtimeMs > 0) return -1;
      else if (statA.mtimeMs - statB.mtimeMs < 0) return 1;
      else return 0;
    });

    const latest = fileList[0];

    // 找到了最新的文件
    if (latest) {
      findLangFileName = latest;
      findLangFilePath = path.join(config.langDownDir, latest);
      return {
        success: true,
        onSuccess() {
          log.newLine();
          logFileDetail(findLangFilePath);
        },
      };
    } else return `未找到包含 ${config.langFileKwd} 关键词的文件`;
  } catch (error) {
    return `发生错误: ${error.message}`;
  }
};

// 删除当前项目的 lang.json
const deleteQAILang = () => {
  const detail = fileDetail(config.projectLangPath);

  removeDir(config.projectLangPath);

  return {
    success: true,
    onSuccess() {
      log.newLine();
      logFileDetail(detail);
    },
  };
};

// 拷贝 ${findLangFileName} 到当前项目
const copyToQAILang = () => {
  try {
    writeFileSync(config.projectLangPath, readFileSync(findLangFilePath));
  } catch (error) {
    return `发生错误: ${error.message}`;
  }
};

// 暂存 ${config.projectLangPath}
const gitAddLang = () => {
  try {
    processRun(`git add ${config.projectLangPath}`);
  } catch (error) {
    return `发生错误: ${error.message}`;
  }
};

// 提交 git commit...
const gitCommitLang = () => {
  const commit = "feat: auto replace lang";
  try {
    const statusOutput = execSync("git status --porcelain").toString();

    const isStaged = statusOutput.includes(config.projectLangPath + "  "); // 检查文件是否以 "文件名  " 的形式出现在状态输出中

    if (isStaged) {
      processRun(`git commit -m "${commit}"`);
    }
  } catch (error) {}

  return commit;
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: findLang,
    desc: () => "查找新下载的语言包",
  },
  {
    fun: deleteQAILang,
    desc: () => "删除当前项目的 lang.json",
  },
  {
    fun: copyToQAILang,
    desc: () => `拷贝 ${findLangFileName} 到当前项目`,
  },
  {
    fun: gitAddLang,
    desc: () => `暂存 ${config.projectLangPath}`,
    failType: "warn",
  },
  {
    fun: gitCommitLang,
    desc: () => "提交 git commit...",
    failType: "warn",
  },
];

// 生成当前 prompt
const handlePromptList = () => {
  const promptList = [];

  const langDownDirPrompt = {
    type: "type",
    name: "langDownDir",
    message: "请输入语言包下载目录:",
  };

  const langFileKwdPrompt = {
    type: "type",
    name: "langFileKwd",
    message: "请输入语言包文件名关键词:",
  };

  const projectPathPrompt = {
    type: "type",
    name: "projectPath",
    message: "请输入项目路径:",
  };

  const projectLangPathPrompt = {
    type: "type",
    name: "projectLangPath",
    message: "请输入项目内语言包路径:",
  };

  if (!config.langDownDir) promptList.push(langDownDirPrompt);
  if (!config.langFileKwd) promptList.push(langFileKwdPrompt);
  if (!config.projectPath) promptList.push(projectPathPrompt);
  if (!config.projectLangPath) promptList.push(projectLangPathPrompt);

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
