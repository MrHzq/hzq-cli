const { execSync } = require("child_process");
const log = require("./log");

// 执行命令
const processRun = (cmd) => {
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (error) {
    const tip = `执行 '${cmd}' 时出错: ${error.message}`;
    log.error(tip);
    return tip;
  }
};

// 进入某个文件
const cdPath = (path) => `cd ${path}`;

// VScode 打开
const codeCmd = "open -a 'Visual Studio Code'";

// 获取 git 用户信息
const getGitUser = () => {
  try {
    // 获取用户名
    const userName = execSync("git config --global user.name", {
      encoding: "utf8",
    }).trim();

    // 获取用户邮箱
    const userEmail = execSync("git config --global user.email", {
      encoding: "utf8",
    }).trim();

    return { userName, userEmail };
  } catch (error) {
    const tip = `获取 Git 用户信息时出错: ${error.message}`;
    log.error(tip);
    return {};
  }
};

// 暂存
const gitAdd = () => `git add .`;

// 提交
const gitCommit = (msg = "Initial commit") => `git commit -m "${msg}"`;

module.exports = {
  processRun,
  cdPath,
  getGitUser,
  gitAdd,
  gitCommit,
  codeCmd,
};
