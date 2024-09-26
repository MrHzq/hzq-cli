const { prompt, notNumberRule, requireRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const { getDirName, getCmdName } = require("../../utils/path");
const { getValueByPath } = require("../../utils/common");
const { getWebInfo } = require("../../plugins/cheerio");

module.exports = async (_, options = {}) => {
  const {
    _name = getDirName(__dirname),
    _cmdName = getCmdName(),
    _description,
  } = options;

  let cliName, config, configType;
  let website;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    website = answers.website;
  };

  const runMain = async () => {
    // 运行命令...
    const { success, res } = await getWebInfo(website);
    console.log("[ res ] >", res); // TODO:
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

  return {
    // 第一个 _config 为配置项
    async prompt(_config, ...args) {
      let [arg] = args;

      let answers = {};

      let firstPrompt = {
        type: "input",
        name: "website",
        message: "请输入网址:",
        validate: notNumberRule,
        default: "https://netnewswire.com/",
      };

      answers = await prompt([firstPrompt]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
    forceLoading: true,
  };
};
