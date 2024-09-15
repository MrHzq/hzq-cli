const CmdList = require("../../bin/handleCmdList");
const { prompt } = require("../../utils/inquirer");
const { code } = require("../../utils/process");

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname), _description } = options;

  let cliName, config;

  let cmdValue;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    cmdValue = answers.cmdValue;
  };

  const runMain = () => {
    code.run("open", cmdValue);
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

  const getCmdList = (filter) => {
    return [
      {
        name: "用编辑器打开当前文件夹",
        value: ".",
      },
      {
        name: "用编辑器打开 .zshrc",
        value: "/Users/hzq/.zshrc",
      },
    ].filter((i) => !filter || i.name.includes(filter));
  };

  return {
    async prompt(_config, ...args) {
      const [arg] = args;

      let answers = {};

      const choices = getCmdList(arg);

      if (choices.length > 1) {
        answers = await prompt([
          {
            type: "list",
            name: "cmdValue",
            message: "请选择要运行的命令:",
            choices,
          },
        ]);
      } else answers.cmdValue = choices[0].value;

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
