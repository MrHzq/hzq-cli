const CmdList = require("../../bin/handleCmdList");
const { readFileSyncFormat } = require("../../utils/fs");
const log = require("../../utils/log");
const path = require("path");
const { root } = require("../../utils/path");

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname) } = options;

  let cliName, config;

  let fileName, filePath, filterKey;

  // 初始化变量
  const initVar = (answers, args) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    fileName = ".zshrc";
    filePath = path.join(root(), fileName);
    filterKey = args[0];
  };

  const getRunCmdList = (cmd) => {
    const contentList = readFileSyncFormat(filePath);

    return contentList
      .filter(
        (content) =>
          content.indexOf("alias ") === 0 && (!cmd || content.includes(cmd))
      )
      .map((content, index) => {
        const [alias, reset] = content.replace("alias ", "").split('="');
        const [fullCmd, desc] = reset.replace(/\"/g, "").split("#");

        return {
          name: `${index + 1}. ${alias}: ${fullCmd}`,
          value: fullCmd,
          alias,
          desc,
        };
      });
  };

  const runMain = async () => {
    // 运行命令...
    const choices = getRunCmdList(filterKey);

    if (choices.length === 0) return "未找到相关命令";

    return {
      success: true,
      onSuccess() {
        log.succeed(`.zshrc path: ${filePath}`, [, true]);

        choices.forEach((item, index) => {
          log.info(
            `${log.warnText(index + 1)}. ${log.succeedText(
              item.alias
            )} = ${log.chalkText(item.value, "blue")}${
              item.desc ? log.chalkText("#" + item.desc, "gray") : ""
            }`
          );
        });
      },
    };
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
