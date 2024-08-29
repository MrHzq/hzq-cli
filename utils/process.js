const { execSync } = require("child_process");
const log = require("./log");

// 执行命令并获得返回值
const processRun = (cmd, type = "run", _config = {}) => {
  try {
    const config = {};
    if (type === "run") config.stdio = "inherit";
    else config.encoding = "utf8";
    return execSync(cmd, { ...config, ..._config });
  } catch (error) {
    const tip = `执行 '${cmd}' 时出错: ${error.message}`;
    log.error(tip);
    return tip;
  }
};

// cd 操作
const cd = {
  run(cmd, ...args) {
    return processRun(this[cmd](...args));
  },
  cd(path) {
    return `cd ${path}`;
  },
};

// 编辑器 操作
const code = {
  run(cmd, ...args) {
    return processRun(this[cmd](...args));
  },
  appName() {
    const editor = "Cursor";
    return editor;
  },
  open(path) {
    return `open -a '${this.appName()}' ${path}`;
  },
};

// git 操作
const git = {
  type: "run",
  run(cmd, ...args) {
    const res = processRun(this[cmd](...args), this.type);
    this.type = "run";
    return res;
  },
  // 暂存 - 注释
  add(file = ".") {
    return `git add ${file}`;
  },

  // 提交 - 注释
  commit(msg = "Initial commit") {
    return `git commit -m "${msg}"`;
  },

  // 获取 git origin
  remote() {
    return `git remote -v`;
  },

  userName() {
    return "git config --global user.name";
  },

  userEmail() {
    return "git config --global user.email";
  },

  // 获取 git 用户信息
  getUser() {
    this.type = "get";

    // 获取用户名
    const userName = this.run(this.userName());

    // 获取用户邮箱
    const userEmail = this.run(this.userEmail());

    return { userName, userEmail };
  },
};

module.exports = {
  processRun,
  cd,
  code,
  git,
};
