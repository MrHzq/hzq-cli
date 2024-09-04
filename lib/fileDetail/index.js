const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const {
  getFileList,
  logFileDetail,
  checkFileExist,
} = require("../../utils/fs");

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname) } = options;

  let cliName, config;

  let file;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    file = answers.file;
  };

  const runMain = () => {
    // 运行命令...
    logFileDetail(file);
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => "查看文件详情",
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => "todo...",
    // },
  ];

  return {
    async prompt(...args) {
      const config = args.pop(); // 最后一个为配置项

      const [arg, arg2] = args;

      let answers = {};

      if (checkFileExist(arg)) {
        answers = { file: arg };
      } else {
        const needList = arg === "ls";

        const choices = getFileList(arg2);

        answers = await prompt(
          needList && choices.length
            ? [
                {
                  type: "list",
                  name: "file",
                  message: "请选择文件:",
                  choices,
                },
              ]
            : [
                {
                  type: "input",
                  name: "file",
                  message: "请输入文件路径:",
                  validate: notNumberRule,
                },
              ]
        );
      }

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
