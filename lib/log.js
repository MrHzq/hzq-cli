const ora = require("ora");
const chalk = require("chalk");

const logSplit = () => console.log(" ");

const towLogSplit = () => {
  logSplit();
  logSplit();
};

const log = {
  successText: function (msg) {
    return chalk.green.bold(`${msg}`);
  },
  success: function (msg) {
    console.log(this.successText(msg));
  },
  errorText: function (msg) {
    return chalk.red(`${msg}`);
  },
  error: function (msg) {
    console.log(this.errorText(msg));
  },
  warnText: function (msg) {
    return chalk.green.yellow(`${msg}`);
  },
  warn: function (msg) {
    console.log(this.warnText(msg));
  },
  info: console.log,
};

// 创建一个spinner实例：初始为【青色并加粗】
class Spinner {
  constructor(text) {
    this.spinner = ora(text);
    this.text = text;
  }
  start(text = true) {
    logSplit();

    let _text = this.text;

    if (text === true) _text = "start " + this.text;
    else if (text) _text = text;

    this.spinner.start(_text);
  }
  succeed(text = true) {
    logSplit();

    let _text = this.text;

    if (text === true) _text = "finish " + this.text;
    else if (text) _text = text;
    this.spinner.succeed(log.successText(_text));
  }
  warn(text = true) {
    logSplit();

    let _text = this.text;

    if (text === true) _text = "tip  " + this.text;
    else if (text) _text = text;
    this.spinner.warn(log.warnText(_text));
  }
  fail(text = true) {
    logSplit();

    let _text = this.text;

    if (text === true) _text = "stop " + this.text;
    else if (text) _text = text;
    this.spinner.fail(log.errorText(_text));
  }
}

module.exports = {
  log,
  logSplit,
  towLogSplit,
  Spinner,
};
