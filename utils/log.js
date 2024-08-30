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
    return color && chalk[color] ? chalk[color](msg) : msg;
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
};

module.exports = log;
