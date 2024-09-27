const { prompt, notNumberRule, requireRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const { getDirName, getCmdName } = require("../../utils/path");
const { getValueByPath } = require("../../utils/common");

module.exports = async (_, options = {}) => {
  const {
    _name = getDirName(__dirname),
    _cmdName = getCmdName(),
    _description,
  } = options;

  let cliName, config, configType;
  let $1;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    $1 = answers.$1;
  };

  const runMain = async () => {
    // 运行命令...
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

  // 生成当前配置对应的 prompt
  const createConfigPromptList = (_config) => {
    const promptList = [];

    const configKeys = Object.keys(_config);
    const configLen = configKeys.length;

    if (!configLen) configType = "add";
    const createPromptName = (key) => {
      return ["config", configByProject ? _cmdName : "", key]
        .filter(Boolean)
        .join(".");
    };

    const $2Prompt = {
      type: "input",
      name: createPromptName("$2"), // config.??.$2
      message: "请输入:",
      validate: notNumberRule,
    };

    if (["reset", "add"].includes(configType)) {
      promptList.push($2Prompt);
    } else {
      if (!getValueByPath({ config: _config }, $2Prompt.name)) {
        promptList.push($2Prompt);
        configType = "add";
      }
    };

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

      answers = await prompt([
        firstPrompt,
        // ...promptList,
      ]);

      answers.configType = configType;

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
