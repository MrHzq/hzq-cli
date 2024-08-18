const { prompt } = require("../../utils/inquirer");
const { getAllYears } = require("../../utils/common");
const log = require("../../utils/log");
const { runCmd } = require("../../utils/process");

// 查看自己的 npm 下载量
const createNudList = () => {
  return getAllYears().map((year) => {
    return {
      name: `查看自己的 npm 下载量(${year} 年度)`,
      value: `nud hzq ${year}-01-01:${year}-12-31`,
    };
  });
};
const getRunCmdList = () => {
  return [
    {
      name: "查看全局依赖包",
      value: "npm list -g --depth 0",
    },
    {
      name: "查看当前源",
      value: "npm get registry",
    },
    {
      name: "全局安装命令",
      value: "npm i -g [npm]",
    },
    ...createNudList(),
  ].map((item) => {
    return {
      name: `${item.name}: ${item.value}`,
      value: item.value,
    };
  });
};

const fun = async () => {
  const answer = await prompt([
    {
      type: "rawlist",
      name: "cmd",
      message: "请选择要运行的命令:",
      choices: getRunCmdList(),
    },
  ]);

  log.succeed(answer.cmd);

  if (!answer.cmd.includes("[")) runCmd(answer.cmd);
};

module.exports = {
  fun,
  desc: "运行 npm 相关命令",
};
