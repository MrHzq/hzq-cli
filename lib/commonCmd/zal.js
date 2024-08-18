const path = require("path");
const { readFileSyncFormat } = require("../../utils/fs");
const { root } = require("../../utils/path");
const log = require("../../utils/log");

const fun = () => {
  const fileName = ".zshrc";

  const fileContent = readFileSyncFormat(path.join(root(), fileName));

  fileContent.forEach((content) => {
    if (content.includes("-start")) {
      log.newLine();
      log.succeed(content);
    } else if (content.indexOf("alias ") === 0) {
      log.info(content.replace("alias ", "").replace("=", " = "));
    }
  });
};
module.exports = {
  fun,
  desc: "查看 .zshrc 里面定义的 alias",
};
