const log = require("../../utils/log");
const { readFileSyncFormat } = require("../../utils/fs");
const path = require("path");
const { root } = require("../../utils/path");

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

module.exports = async (_, options) => {
  const { args } = options;

  const choices = getRunCmdList(args?.[0]);

  if (choices.length === 0) return log.warn("未找到相关命令");

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
};
