const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const path = require("path");
const { getFullPathBy, getCwdRePath, getDirName } = require("../../utils/path");
const { readdirSync } = require("../../utils/fs");

module.exports = async (_, options = {}) => {
  const { _name = getDirName(__dirname), _description } = options;

  let cliName, config, configType;

  let allAnswers, dir1, dir2;

  // 初始化变量
  const initVar = (answers) => {
    allAnswers = answers;
    config = answers.config;

    cliName = CmdList.getCliName();

    dir1 = answers.dir1;
    dir2 = answers.dir2;
  };

  const runMain = async () => {
    if (dir1.includes(".")) dir1 = getCwdRePath(dir1);
    if (dir2.includes(".")) dir2 = getCwdRePath(dir2);

    // 对比 dir1 和 dir2 的文件内容
    const dir1Files = readdirSync(dir1);
    const dir2Files = readdirSync(dir2);

    const inDir1 = [];
    const notInDir1 = [];

    // 基于 dir2Files，找出在 dir1Files 里面的文件，即重复的
    dir2Files.forEach((file) => {
      const isExist = dir1Files.includes(file);
      if (isExist) inDir1.push(file);
      else notInDir1.push(file);
    });

    if (inDir1.length) {
      log.warn(
        `【${allAnswers.dir2}】 VS 【${allAnswers.dir1}】，以下文件在 【${allAnswers.dir2}】中是重复的: `,
        true
      );
      log.warn(inDir1.join(","), true);
    } else {
      log.warn("未找到重复文件", true);
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
    // 第一个 _config 为配置项
    async prompt(_config, ...args) {
      const [arg] = args;

      let answers = {};

      answers = await prompt([
        {
          type: "input",
          name: "dir1",
          message: "请输入文件夹:",
          validate: notNumberRule,
        },
        {
          type: "input",
          name: "dir2",
          message: "请输入要对比的文件夹:",
          validate: notNumberRule,
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
