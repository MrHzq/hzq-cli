const chalk = require("chalk");

const info = console.log;

const newLine = (num = 1) => {
  Array(num)
    .fill(0)
    .forEach(() => info(" "));
};

const log = {
  info,
  newLine,

  infoWithNewLine(msg, newLine) {
    const [beforeNewLine, afterNewLine] = Array.isArray(newLine)
      ? newLine
      : [newLine];
    if (beforeNewLine) this.newLine();

    this.info(msg);

    if (afterNewLine) this.newLine();
  },

  chalkText(msg, color) {
    if (!color) return msg;

    const { getValueByPath } = require("./common");

    return getValueByPath(chalk, color)?.(msg);
  },
  chalk(msg, color) {
    this.infoWithNewLine(this.chalkText(msg, color));
  },

  successText: chalk.green,
  success(msg, newLine) {
    this.infoWithNewLine(this.successText(msg), newLine);
  },

  warnText: chalk.yellow,
  warn(msg, newLine) {
    this.infoWithNewLine(this.warnText(msg), newLine);
  },

  errorText: chalk.red,
  error(msg, newLine) {
    this.infoWithNewLine(this.errorText(msg), newLine);
  },

  succeedText(msg) {
    return this.successText(msg);
  },
  succeed(msg, newLine) {
    return this.success(msg, newLine);
  },

  failText(...args) {
    return this.errorText(...args);
  },
  fail(...args) {
    return this.error(...args);
  },

  batchLog(totalList, successList, failList) {
    const totalLen = Array.isArray(totalList) ? totalList.length : totalList;
    const totalTip = `总共 ${totalLen} 个`;

    const successLen = Array.isArray(successList)
      ? successList.length
      : successList;
    const successTip = `成功 ${successLen} 个`;

    const failLen = failList ? failList.length : totalLen - successLen;
    const failTip = `失败 ${failLen} 个`;

    const successRate = `成功率：${((100 * successLen) / totalLen).toFixed(
      2
    )}%`;

    return [
      totalTip,
      successLen ? this.successText(successTip) : this.warnText(successTip),
      failLen ? this.errorText(failTip) : "",
      successRate,
    ]
      .filter(Boolean)
      .join("，");
  },
};

module.exports = log;
