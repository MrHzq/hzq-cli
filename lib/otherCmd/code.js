const { prompt } = require("../../utils/inquirer");
const log = require("../../utils/log");
const { processRun, codeCmd } = require("../../utils/process");

const getRunCmdList = () => {
  return [
    {
      name: "用 vscode 打开当前文件夹",
      value: `${codeCmd} .`,
    },
    {
      name: "用 vscode 打开当前 .vscode 设置",
      value: `${codeCmd} .vscode/settings.json`,
    },
  ];
};

const fun = async () => {
  const answers = await prompt([
    {
      type: "list",
      name: "cmd",
      message: "请选择要运行的命令:",
      choices: getRunCmdList(),
    },
  ]);

  log.succeed(answers.cmd);

  processRun(answers.cmd);
};

module.exports = {
  fun,
  desc: "vscode 相关快捷命令",
};