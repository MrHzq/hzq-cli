const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const path = require("path");


module.exports = async (_, options = {}) => {
  const { _name = getDirName(__dirname), _description } = options;

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
  const createConfigPromptList = (config) => {
    const promptList = [];

    const configKeys = Object.keys(config);
    const configLen = configKeys.length;

    if (!configLen) configType = "add";

    const $2Prompt = {
      type: "input",
      name: "config.$2",
      message: "请输入:",
      validate: notNumberRule,
    };

    if (["reset", "add"].includes(configType)) {
      promptList.push($2Prompt);
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

      answers = await prompt([
        {
          type: "input",
          name: "$1",
          message: "请输入:",
          validate: notNumberRule,
        },
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
