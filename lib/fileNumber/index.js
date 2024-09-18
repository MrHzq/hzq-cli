const CmdList = require("../../bin/handleCmdList");
const { reReaddirSync, checkFileExist } = require("../../utils/fs");
const log = require("../../utils/log");
const { getDirName, getCmdName } = require("../../utils/path");

module.exports = async (_, options = {}) => {
  const {
    _name = getDirName(__dirname),
    _cmdName = getCmdName(),
    _description,
  } = options;

  let cliName, config, configType;

  let dir, noDir;

  // 初始化变量
  const initVar = (answers, args) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    [dir = "./", noDir = ""] = args;
  };

  const runMain = async () => {
    if (!checkFileExist(dir)) return `${dir} 文件不存在`;

    const filePathList = reReaddirSync({
      dir,
      ignoreList: [noDir],
    });

    return {
      success: filePathList.length > 0,
      onSuccess() {
        log.infoWithNewLine(
          `查找范围：${dir}` + (noDir ? ` 排除文件：${noDir}` : "")
        );

        log.succeed(`文件数量：${filePathList.length}`);

        filePathList.forEach((file) => {
          // log.succeed(file.fullFilePath);
        });
      },
    };
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
    initVar,
    mainStepList,
    todoStepList,
  };
};
