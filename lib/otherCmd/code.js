const { prompt } = require("../../utils/inquirer");
const { code } = require("../../utils/process");

const canRunCmdList = () => {
  return [
    {
      name: "用编辑器打开当前文件夹",
      value: ".",
    },
    {
      name: "用编辑器打开当前 .vscode 设置",
      value: ".vscode/settings.json",
    },
  ];
};

const fun = async () => {
  const answers = await prompt([
    {
      type: "list",
      name: "cmd",
      message: "请选择要运行的命令:",
      choices: canRunCmdList(),
    },
  ]);

  code.run("open", answers.cmd);
};

module.exports = {
  fun,
  desc: "vscode 相关快捷命令",
};
