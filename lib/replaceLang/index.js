const path = require("path");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const { prompt } = require("../../utils/inquirer");
const {
  readdirSync,
  statSync,
  removeSync,
  writeFileSync,
  readFileSync,
  logFileDetail,
  getFileDetail,
  filterFileList,
  checkFileExist,
} = require("../../utils/fs");
const { git } = require("../../utils/process");
const { pathEqCwd } = require("../../utils/path");

module.exports = async (_, options = {}) => {
  let cliName, config;

  let findLangFileName,
    findLangFilePath,
    projectLangFilePath,
    inProject,
    commit;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    projectLangFilePath = path.join(config.projectPath, config.projectLangPath);
    inProject = pathEqCwd(config.projectPath);
    commit = "feat: auto replace lang";
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
  const deleteLang = () => {
    try {
      if (checkFileExist(projectLangFilePath)) {
        const detail = getFileDetail(projectLangFilePath);

        removeSync(projectLangFilePath);

        return {
          success: true,
          onSuccess() {
            log.newLine();
            logFileDetail(detail);
          },
        };
      } else {
        return {
          failType: "warn",
          tip: "文件已不存在",
        };
      }
    } catch (error) {
      return error.message;
    }
  };

  // 拷贝 ${findLangFileName} 到当前项目
  const copyToLang = () => {
    try {
      writeFileSync(projectLangFilePath, readFileSync(findLangFilePath));
    } catch (error) {
      return `发生错误: ${error.message}`;
    }
  };

  // 暂存 ${config.projectLangPath}
  const gitAddLang = () => {
    try {
      git.run("add", config.projectLangPath);
    } catch (error) {
      return `发生错误: ${error.message}`;
    }
  };

  // 提交 git commit...
  const gitCommitLang = () => {
    try {
      const statusOutput = execSync("git status --porcelain").toString();

      const isStaged = statusOutput.includes(config.projectLangPath + "  "); // 检查文件是否以 "文件名  " 的形式出现在状态输出中

      if (isStaged) {
        git.run("commit", commit);
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
      fun: deleteLang,
      desc: () => "删除当前项目的 lang.json",
    },
    {
      fun: copyToLang,
      desc: () => `拷贝 ${findLangFileName} 到当前项目`,
    },
    {
      fun: gitAddLang,
      desc: () => `暂存 ${config.projectLangPath}`,
      failType: "warn",
      ignore: () => !inProject,
    },
    {
      fun: gitCommitLang,
      desc: () => "提交 git commit...",
      failType: "warn",
      ignore: () => !inProject,
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    {
      desc: () => `vscode 打开 ${config.projectPath}`,
    },
    {
      desc: () => `提交代码: ${commit}`,
    },
  ];

  // 生成当前配置对应的 prompt
  const createConfigPromptList = (config) => {
    const promptList = [];

    const langDownDirPrompt = {
      type: "input",
      name: "config.langDownDir",
      message: "请输入语言包下载目录:",
    };

    const langFileKwdPrompt = {
      type: "input",
      name: "config.langFileKwd",
      message: "请输入语言包文件名关键词:",
    };

    const projectPathPrompt = {
      type: "input",
      name: "config.projectPath",
      message: "请输入项目路径:",
    };

    const projectLangPathPrompt = {
      type: "input",
      name: "config.projectLangPath",
      message: "请输入项目内语言包文件路径:",
    };

    if (!config.langDownDir) promptList.push(langDownDirPrompt);
    if (!config.langFileKwd) promptList.push(langFileKwdPrompt);
    if (!config.projectPath) promptList.push(projectPathPrompt);
    if (!config.projectLangPath) promptList.push(projectLangPathPrompt);

    return promptList;
  };

  return {
    async prompt(...args) {
      const config = args.pop(); // 最后一个为配置项

      const reset = args[0] === "reset";

      if (reset) args.shift(); // 若需要重置，则将第一个参数删除掉

      const promptList = createConfigPromptList(reset ? {} : config);
      // promptList 按情况使用

      const [arg] = args;

      let answers = {};

      answers = await prompt(promptList);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
