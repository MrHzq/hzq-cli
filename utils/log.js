const chalk = require("chalk");

const log = {
  info: console.log,

  newLine: (num = 1) => {
    Array(num)
      .fill(0)
      .forEach(() => log.info(" "));
  },

  chalk: (msg, color) => {
    color && chalk[color] ? log.info(chalk[color](msg)) : log.info(msg);
  },

  successText: chalk.green,
  success: (msg) => log.info(log.successText(msg)),

  warnText: chalk.yellow,
  warn: (msg) => log.info(log.warnText(msg)),

  errorText: chalk.red,
  error: (msg) => log.info(log.errorText(msg)),
};

module.exports = log;
