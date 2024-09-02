const { prompt, notNumberRule, requireRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { getFileList, getFileDetail, logFileDetail } = require("../../utils/fs");
const log = require("../../utils/log");
const { currCwdPath } = require("../../utils/path");
const path = require("path");

module.exports = async (_, options = {}) => {
  let cliName, config;

  let filterKey;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    filterKey = answers.filterKey;
  };

  const runMain = () => {
    const list = getFileList(filterKey);
    log.succeed(`查找目录：${currCwdPath}`, [true, true]);

    const showDetailLen = 10;
    const len = list.length;

    if (len) {
      list.forEach(({ name, value }) => {
        const fileDetail = getFileDetail(path.resolve(value));
        if (len > showDetailLen) {
          log.info(
            `${name} ${log.warnText(
              fileDetail.sizeFormat ? fileDetail.sizeFormat.mbs : ""
            )}`
          );
          log.info(log.chalkText(path.resolve(value), "blue"), [, true]);
        } else {
          log.info(name);
          logFileDetail(fileDetail);
          log.newLine();
        }
      });
    } else {
      log.warn(`未找到包含 ${filterKey} 的文件`);
    }
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => "文件查找并展示列表",
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

      const [arg] = args;

      let answers = {};

      if (arg) {
        answers = { filterKey: arg };
      } else {
        answers = await prompt([
          {
            type: "input",
            name: "filterKey",
            message: "请输入查找关键词:",
            validate: requireRule,
          },
        ]);
      }

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
