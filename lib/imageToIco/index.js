const { prompt, notNumberRule, requireRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const { getDirName, getCmdName, getFullPathBy } = require("../../utils/path");
const { getFileList } = require("../../utils/fs");
const Spinner = require("../../utils/spinner");
const { imageToIco } = require("../../plugins/iconGen");
const { IMAGE_TYPE_LIST } = require("../../utils/constant");

const needMuteConfig = true; // 一个 key 是否存在多个

module.exports = async (_, options = {}) => {
  const {
    _name = getDirName(__dirname),
    _cmdName = getCmdName(),
    _description,
  } = options;

  let cliName, config, configType;

  let currPromptKey = "icoSize";

  let filePathList, successList;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    if (answers.currPromptKey) currPromptKey = answers.currPromptKey;

    cliName = CmdList.getCliName();

    filePathList = answers.filePathList;

    successList = [];
  };

  const runMain = async () => {
    // 运行命令...
    if (!Array.isArray(filePathList)) filePathList = [filePathList];

    const total = filePathList.length;

    if (total === 0) return "未找到文件";

    const forLoading = new Spinner();

    for (let i = 0; i < total; i++) {
      forLoading.start(`当前进度: ${i + 1}/${total}`);

      const forItem = filePathList[i];

      const params = {
        imagePath: getFullPathBy(forItem),
        icoSize: Number(config[currPromptKey]),
      };

      log.chalk(`执行参数：${JSON.stringify(params, null, 2)}`, "blue");

      const { success, res } = await imageToIco(params);
      if (success) {
        successList.push(res);
      }
    }

    forLoading.stop();

    return {
      success: successList.length > 0,
      tip: log.batchLog(filePathList, successList),
    };
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

    let isChoices = Boolean(configLen);

    if (["reset", "add"].includes(configType)) isChoices = false;

    if (needMuteConfig && configType === "add" && configLen) {
      currPromptKey = currPromptKey + configLen;
    }

    if (!configLen) configType = "add";

    let icoSizePrompt = {
      type: "input",
      name: `config.${currPromptKey}`,
      message: "请输入 ico 尺寸:",
      validate: requireRule,
    };

    if (isChoices) {
      icoSizePrompt = {
        type: "list",
        name: "config.icoSize",
        message: "请选择 ico 尺寸:",
        choices: configKeys.map((key) => ({
          name: config[key],
          value: config[key],
        })),
      };
    }
    promptList.push(icoSizePrompt);

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

      const needList = arg === "ls";

      if (needList) arg = "";

      const defaultFilterList = IMAGE_TYPE_LIST;
      const defaultIgnoreList = ["favicon", ".ico"];

      const choices = getFileList(
        defaultFilterList.join("||"),
        defaultIgnoreList.join("||")
      );

      let answers = {};

      let firstPrompt = {
        type: "input",
        name: "filePathList",
        message: "请输入:",
        validate: notNumberRule,
      };

      answers = await prompt([
        needList && choices.length
          ? {
              type: "checkbox",
              name: "filePathList",
              message: `请选择文件(可选${choices.length}个):`,
              choices,
              validate: requireRule,
            }
          : firstPrompt,
        ...promptList,
      ]);

      answers.configType = configType;
      answers.currPromptKey = currPromptKey;

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
    needMuteConfig,
  };
};
