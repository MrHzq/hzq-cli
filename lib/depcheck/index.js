const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const path = require("path");
const { getDirName, currCwdPath } = require("../../utils/path");
const { getJsonContent, reReaddirSync } = require("../../utils/fs");
const { checkDependencyUsed } = require("../../utils/common");

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname), _description } = options;

  let cliName, config, configType;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();
  };

  const runMain = async () => {
    // 获取依赖
    const { dependencies = {} } = getJsonContent("./package.json");

    // 获取到所有的文件路径
    const fileList = reReaddirSync();

    const unUseList = [];

    Object.keys(dependencies).forEach((key) => {
      const isUse = fileList.some((file) => {
        return checkDependencyUsed(key, file.fileContent);
      });
      if (!isUse) unUseList.push(key);
    });

    if (unUseList.length) {
      const char = "\n* ";
      log.warn(
        `${log.succeedText("未使用的依赖:")}${char}${unUseList.join(char)}`,
        true
      );
    } else {
      log.succeed("无未使用的依赖", true);
    }
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
    initVar,
    mainStepList,
    todoStepList,
    needLogTime: true,
    forceLoading: true,
  };
};
