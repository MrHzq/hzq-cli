const log = require("../../utils/log");
const { readFileSyncFormat } = require("../../utils/fs");
const { prompt } = require("../../utils/inquirer");
const path = require("path");
const { root } = require("../../utils/path");
const { processRun } = require("../../utils/process");

const fileName = ".zshrc";
const filePath = path.join(root(), fileName);

const getRunCmdList = (cmd) => {
  const contentList = readFileSyncFormat(filePath);

  return contentList
    .filter(
      (content) =>
        content.indexOf("alias ") === 0 && (!cmd || content.includes(cmd))
    )
    .map((content, index) => {
      const [alias, fullCmd, desc] = content
        .replace("alias ", "")
        .replace(/\"/g, "")
        .split("=");
      return {
        name: `${index + 1}. ${alias}: ${fullCmd}`,
        value: fullCmd,
        alias,
      };
    });
};

module.exports = async (_, options) => {
  const { args } = options;

  const choices = getRunCmdList(args?.[0]);

  if (choices.length === 0) return log.warn("未找到相关命令");

  log.succeed(`.zshrc path: ${filePath}`);
  log.newLine();

  choices.forEach((item, index) => {
    log.info(
      `${log.warnText(index + 1)}. ${log.succeedText(
        item.alias
      )} = ${log.chalkText(item.value, "blue")}`
    );
  });
};
