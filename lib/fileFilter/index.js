const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { getFileList, getFileDetail, logFileDetail } = require("../../utils/fs");
const { currCwdPath } = require("../../utils/path");
const path = require("path");
const { requireRule, prompt } = require("../../utils/inquirer");

let mainSpinner, filterKey;

// 初始化变量
const initVar = (answers) => {
  filterKey = answers.filterKey;
};

const findFile = () => {
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
    fun: findFile,
    desc: () => "文件查找并展示列表",
  },
];

module.exports = async (_, options) => {
  const { _description, args } = options;

  let answers = {};

  const arg = args?.[0];
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

  initVar(answers);

  mainSpinner = new Spinner(_description);

  if (mainStepList.length === 1) {
    await mainStepList[0].fun();
    return mainSpinner.succeed();
  }

  mainSpinner.start();

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();
  } else {
    mainSpinner.fail();
  }
};
