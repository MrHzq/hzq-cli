const chalk = require("chalk");

const info = console.log;

const log = {
  newLine(num = 1) {
    Array(num)
      .fill(0)
      .forEach(() => info(" "));
  },

  info,

  chalk(msg, color) {
    color && chalk[color] ? info(chalk[color](msg)) : info(msg);
  },

  successText: chalk.green,
  success(msg) {
    info(this.successText(msg));
  },

  warnText: chalk.yellow,
  warn(msg) {
    info(this.warnText(msg));
  },

  errorText: chalk.red,
  error(msg) {
    info(this.errorText(msg));
  },

  succeedText(msg) {
    return this.successText(msg);
  },
  succeed(msg) {
    return this.success(msg);
  },

  failText(...args) {
    return this.errorText(...args);
  },
  fail(...args) {
    return this.error(...args);
  },
};

module.exports = log;
