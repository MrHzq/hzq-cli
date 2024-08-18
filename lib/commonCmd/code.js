const { prompt } = require("../../utils/inquirer");
const log = require("../../utils/log");
const { runCmd } = require("../../utils/process");

const getRunCmdList = () => {
  return [
    {
      name: "用 vscode 打开当前文件夹",
      value: "code .",
    },
  ];
};

const fun = async () => {
  const answer = await prompt([
    {
      type: "list",
      name: "cmd",
      message: "请选择要运行的命令:",
      choices: getRunCmdList(),
    },
  ]);

  log.succeed(answer.cmd);

  runCmd(answer.cmd);
};

module.exports = {
  fun,
  desc: "vscode 相关快捷命令",
};
