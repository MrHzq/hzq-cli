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
const { getDirName, getCmdName, currCwdPath } = require("../../utils/path");
const { splitBy, someIncludes } = require("../../utils/common");

const configByProject = true; // 配置项是否以“项目”维度

module.exports = async (_, options = {}) => {
  const {
    _name = getDirName(__dirname),
    _cmdName = getCmdName(),
    _description,
  } = options;

  let cliName, config, configType;

  let findLangFileName, findLangFilePath, projectLangFilePath, commit;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    if (configByProject) config = config[_cmdName];

    cliName = CmdList.getCliName();

    projectLangFilePath = path.join(currCwdPath, config.projectLangPath);
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
      git.run("add", projectLangFilePath);
    } catch (error) {
      return `发生错误: ${error.message}`;
    }
  };

  // 提交 git commit...
  const gitCommitLang = () => {
    try {
      const isStaged = someIncludes(
        splitBy(git.run("status")),
        config.projectLangPath
      );

      if (isStaged) git.run("commit", commit);
      else return "暂无变更";
    } catch (error) {
      return commit;
    }
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
    },
    {
      fun: gitCommitLang,
      desc: () => "提交 git commit...",
      failType: "warn",
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => `打开项目`,
    // },
    // {
    //   desc: () => `推送代码`,
    // },
  ];

  // 生成当前配置对应的 prompt
  const createConfigPromptList = (config) => {
    const promptList = [];

    const configKeys = Object.keys(config);
    const configLen = configKeys.length;

    const createPromptName = (key) => {
      return ["config", configByProject ? _cmdName : "", key]
        .filter(Boolean)
        .join(".");
    };

    if (!configLen) configType = "add";

    if (configByProject) {
      if (!config[_cmdName]) configType = "add";
    }

    const langDownDirPrompt = {
      type: "input",
      name: createPromptName("langDownDir"),
      message: "请输入下载的语言包目录:",
    };

    const langFileKwdPrompt = {
      type: "input",
      name: createPromptName("langFileKwd"),
      message: "请输入语言包文件关键词:",
    };

    const projectLangPathPrompt = {
      type: "input",
      name: createPromptName("projectLangPath"),
      message: "请输入项目内语言包文件路径:",
    };

    if (["reset", "add"].includes(configType)) {
      promptList.push(langDownDirPrompt);
      promptList.push(langFileKwdPrompt);
      promptList.push(projectLangPathPrompt);
    }

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

      let answers = {};

      answers = await prompt([...promptList]);

      answers.configType = configType;

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
