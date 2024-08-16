const { execSync } = require("child_process");
const log = require("./log");

// 执行命令
exports.runCmd = (cmd) => {
  try {
    execSync(cmd, { stdio: "inherit" });
    return true;
  } catch (error) {
    const tip = `执行 '${cmd}' 时出错: ${error.message}`;
    log.error(tip);
    return tip;
  }
};

// 获取 git 用户信息
exports.getGitUser = () => {
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
    log.error(`获取 Git 用户信息时出错: ${error.message}`);
    return {};
  }
};
