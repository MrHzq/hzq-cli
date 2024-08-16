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

  start(text, prefix = "start") {
    log.newLine();

    text = text || prefix + " " + this.text;

    this.do("start", text);

    log.newLine();
  }

  print(fnName, text, prefix) {
    log.newLine();

    text = text || prefix + " " + this.text;

    return this.do(fnName, log[`${fnName}Text`](text));
  }

  succeed(text, prefix) {
    const type = "succeed";
    return this.print(type, text, prefix || type);
  }

  warn(text, prefix) {
    const type = "warn";
    return this.print(type, text, prefix || type);
  }

  fail(text, prefix) {
    const type = "fail";
    return this.print(type, text, prefix || type);
  }
}

module.exports = Spinner;
