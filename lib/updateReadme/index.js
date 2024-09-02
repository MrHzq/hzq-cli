const CmdList = require("../../bin/handleCmdList");
const { getHBSContent } = require("../../utils/common");
const { readFileSync, writeFileSync } = require("../../utils/fs");
const path = require("path");

module.exports = async (_, options = {}) => {
  let cliName, config;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();
  };

  const runMain = () => {
    // 运行命令...

    const list = CmdList.getListOrigin();

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
