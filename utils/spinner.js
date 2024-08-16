const ora = require("ora");
const log = require("./log");

// 创建一个spinner实例：初始为【青色并加粗】
class Spinner {
  constructor(text) {
    this.spinner = ora(text);
    this.text = text;
  }

  do(fnName, ...args) {
    if (fnName && typeof this.spinner[fnName] === "function") {
      return this.spinner[fnName](...args);
    }
  }

  start(text, prefix = "start ") {
    log.newLine();

    text = text || prefix + this.text;

    this.do("start", text);

    log.newLine();
  }
  succeed(text, prefix = "finish ") {
    log.newLine();

    text = text || prefix + this.text;

    return this.do("succeed", log.successText(text));
  }
  warn(text, prefix = "warn ") {
    log.newLine();

    text = text || prefix + this.text;

    return this.do("warn", log.warnText(text));
  }
  fail(text, prefix = "fail ") {
    log.newLine();

    text = text || prefix + this.text;

    return this.do("fail", log.errorText(text));
  }
}

module.exports = Spinner;
