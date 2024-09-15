const CmdList = require("../../bin/handleCmdList");
const { prompt } = require("../../utils/inquirer");
const { code } = require("../../utils/process");

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname), _description } = options;

  let cliName, config;

  let filePath;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    filePath = answers.filePath;
  };

  const runMain = () => {
    code.run("open", filePath);
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => "运行命令",
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => "todo...",
    // },
  ];

  const getCmdList = () => {
    return [
      {
        name: "用编辑器打开当前文件夹",
        value: ".",
      },
      {
        name: "用编辑器打开 .zshrc",
        value: "/Users/hzq/.zshrc",
      },
    ];
  };

  return {
    async prompt(_config, ...args) {
      const [arg] = args;

      let answers = {};

      answers = await prompt([
        {
          type: "list",
          name: "filePath",
          message: "请选择要运行的命令:",
          choices: getCmdList(),
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
