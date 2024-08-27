const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { getFileList, fileDetail } = require("../../utils/fs");
const { currCwdPath } = require("../../utils/path");
const path = require("path");

let mainSpinner, filter;

// 初始化变量
const initVar = (answer) => {
  filter = answer.filter;
};

const findFile = () => {
  const list = getFileList(filter);
  log.succeed(`当前目录：${currCwdPath()}`);
  log.newLine();

  list.forEach(({ name, value }) => {
    const { sizeFormat } = fileDetail(path.resolve(value));
    log.info(`${name} ${log.warnText(sizeFormat ? sizeFormat.mbs : "")}`);
    log.info(log.chalkText(path.resolve(value), "blue"));

    log.newLine();
  });
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: findFile,
    desc: () => "文件过滤",
  },
];

module.exports = async (_, options) => {
  const { _description, args } = options;

  initVar({ filter: args?.[0] });

  if (mainStepList.length === 1) return await mainStepList[0].fun();

  mainSpinner = new Spinner(_description);

  mainSpinner.start();

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();
  } else {
    mainSpinner.fail();
  }
};
