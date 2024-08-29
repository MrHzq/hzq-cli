const { execSync } = require("child_process");
const log = require("./log");

// 执行命令并获得返回值
const processRun = (cmd, config = {}) => {
  try {
    return execSync(cmd, { encoding: "utf8", ...config });
  } catch (error) {
    const tip = `执行 '${cmd}' 时出错: ${error.message}`;
    log.error(tip);
    return tip;
  }
};

// 进入某个文件 - 注释
const cdPathZS = (path) => `cd ${path}`;

// VScode 打开
const codeCmd = "open -a 'Visual Studio Code'";

// git 相关命令
const git = {
  run(cmd) {
    return processRun(this[cmd]());
  },
  // 暂存 - 注释
  add(file = ".") {
    return `git add ${file}`;
  },

  // 提交 - 注释
  commit(msg = "Initial commit") {
    return `git commit -m "${msg}"`;
  },

  userName() {
    return "git config --global user.name";
  },

  userEmail() {
    return "git config --global user.email";
  },

  // 获取 git 用户信息
  getUser() {
    // 获取用户名
    const userName = processRun(this.userName());

    // 获取用户邮箱
    const userEmail = processRun(this.userEmail());

    return { userName, userEmail };
  },

  // 获取 git origin
  remote() {
    return `git remote -v`;
  },
};

console.log("[ run ] >", git.run("remote"));

module.exports = {
  processRun,
  cdPathZS,
  git,
  codeCmd,
};
