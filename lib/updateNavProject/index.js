const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const { getDirName, getCmdName, pathEqCwd } = require("../../utils/path");
const { getValueByPath, formatTime } = require("../../utils/common");
const {
  getDefaultIgnoreList,
  reReaddirSync,
  removeSync,
  copyDir,
} = require("../../utils/fs");
const path = require("path");
const { cd, git } = require("../../utils/process");

const configByProject = true; // 配置项是否以“项目”维度

module.exports = async (_, options = {}) => {
  const {
    _name = getDirName(__dirname),
    _cmdName = getCmdName(),
    _description,
  } = options;

  let cliName, config, configType;
  let $1, inProject;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;
    if (configByProject) config = config[_cmdName];

    cliName = CmdList.getCliName();

    $1 = answers.$1;
    inProject = pathEqCwd(config["targetPath"]);
  };

  const runMain = async () => {
    // 运行命令...

    const { originPath, targetPath, ignoreDir } = config;

    const fileList = reReaddirSync({
      dir: originPath,
      getIgnoreContent: false,
      re: false,
      needContent: false,
    });

    fileList.forEach(({ filePath }) => {
      removeSync(path.join(targetPath, filePath));
      copyDir(path.join(originPath, filePath), path.join(targetPath, filePath));
      log.succeed(`${filePath} 拷贝成功`);
    });
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => _description,
    },
    {
      fun: () => git.run("add"),
      desc: () => "暂存",
      failType: "warn",
      ignore: () => !inProject,
    },
    {
      fun: () => git.runCommit(`feat: auto update - ${formatTime()}`),
      desc: () => "提交",
      failType: "warn",
      ignore: () => !inProject,
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    {
      desc: () => cd.cd(config["targetPath"]),
    },
    {
      desc: () => git.add(),
    },
    {
      desc: () => git.commit(`feat: auto update - ${formatTime()}`),
    },
  ];

  // 生成当前配置对应的 prompt
  const createConfigPromptList = (_config) => {
    const promptList = [];

    const configKeys = Object.keys(_config);
    const configLen = configKeys.length;

    if (!configLen) configType = "add";

    if (configByProject) {
      if (!_config[_cmdName]) configType = "add";
    }

    const createPromptName = (key) => {
      return ["config", configByProject ? _cmdName : "", key]
        .filter(Boolean)
        .join(".");
    };

    const originPathPrompt = {
      type: "input",
      name: createPromptName("originPath"),
      message: "请输入源路径:",
      validate: notNumberRule,
    };

    const targetPathPrompt = {
      type: "input",
      name: createPromptName("targetPath"), // config.??.targetPath
      message: "请输入目标路径:",
      validate: notNumberRule,
    };

    const ignoreDirPrompt = {
      type: "input",
      name: createPromptName("ignoreDir"), // config.??.targetPath
      message: "请输入忽略目录(,分隔):",
      default: getDefaultIgnoreList().join(","),
      validate: notNumberRule,
    };

    if (["reset", "add"].includes(configType)) {
      promptList.push(originPathPrompt);
      promptList.push(targetPathPrompt);
    } else {
      [originPathPrompt, targetPathPrompt, ignoreDirPrompt].forEach((item) => {
        if (!getValueByPath({ config: _config }, item.name)) {
          promptList.push(item);
          configType = "add";
        }
      });
    }

    return promptList;
  };

  return {
    // 第一个 _config 为配置项
    async prompt(_config, ...args) {
      configType = args.at(-1);

      if (["reset", "add"].includes(configType)) args.pop(); // 若需要重置/新增，则将最后一个参数删除掉

      // promptList 按情况使用
      const promptList = createConfigPromptList(_config, configType);

      let [arg] = args;

      let answers = {};

      let firstPrompt = {
        type: "input",
        name: "$1",
        message: "请输入:",
        validate: notNumberRule,
      };

      answers = await prompt([...promptList]);

      answers.configType = configType;

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList() {
      return inProject ? [] : todoStepList;
    },
  };
};
