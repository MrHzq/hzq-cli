const CmdList = require("../../bin/handleCmdList");
const { getHBSContent } = require("../../utils/common");
const { readFileSync, writeFileSync } = require("../../utils/fs");
const path = require("path");
const { git } = require("../../utils/process");

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname) } = options;

  let cliName, config;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();
  };

  const runMain = () => {
    // 运行命令...

    const list = CmdList.getStringifyList();

    const templateContent = readFileSync(
      path.join(__dirname, "./templates/readme.hbs")
    );

    const fileContent = getHBSContent(templateContent, {
      cmdList: list,
    });

    writeFileSync(
      path.join(__dirname, "../../README.md"),
      fileContent.replace(/&quot;/g, '"')
    );
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => "运行",
    },
    {
      fun: () => git.run("add"),
      desc: () => "暂存",
      failType: "warn",
    },
    {
      fun: () => git.run("commit", `feat: auto update readme`),
      desc: () => "提交",
      failType: "warn",
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
  };
};
