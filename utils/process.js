const { execSync } = require("child_process");
const log = require("./log");
const { someIncludes, splitBy } = require("./common");
const { currCwdPath } = require("./path");

// 执行命令并获得返回值
const processRun = (cmd, type = "run", _config = {}) => {
  try {
    const config = {};
    if (type === "run") config.stdio = "inherit";
    else config.encoding = "utf8";

    const execSyncConfig = { ...config, ..._config };

    return execSync(cmd, execSyncConfig);
  } catch (error) {
    const tip = `执行 '${cmd}' 时出错:\n-- ${error.message}`;
    // log.error(tip);
    return `err: ${tip}`;
  }
};

// 中断执行
const processExit = process.exit;

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

  editor: "cursor",
  editorMap: {
    cursor: "Cursor",
    vscode: "Visual Studio Code",
  },

  prompt: {
    type: "list",
    name: "editor",
    message: "请选择编辑器:",
    choices: ["vscode", "cursor"],
  },

  setEditor(editor) {
    this.editor = editor;
  },

  getEditorApp() {
    return this.editorMap[this.editor];
  },

  open(path) {
    return `open -a '${this.getEditorApp()}' ${path}`;
  },
};

// git 操作
const git = {
  type: "get",
  run(cmd, ...args) {
    const cmdStr = this[cmd](...args);
    const runRes = processRun(cmdStr, this.type);
    return runRes;
  },
  // 暂存 - 注释
  add(file = ".") {
    return `git add ${file}`;
  },

  // 提交 - 注释
  commit(msg = "Initial commit") {
    return `git commit -m "${msg}"`;
  },

  runCommit(msg) {
    try {
      const isStaged = someIncludes(splitBy(git.run("status")), currCwdPath);

      if (isStaged) git.run("commit", msg);
      else return "暂无变更";
    } catch (error) {
      return msg;
    }
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

  status() {
    return "git status --porcelain";
  },

  // 获取 git 用户信息
  getUser() {
    // 获取用户名
    const userName = this.run("userName")?.trim();

    // 获取用户邮箱
    const userEmail = this.run("userEmail")?.trim();

    return { userName, userEmail };
  },
};

module.exports = {
  processRun,
  processExit,
  cd,
  code,
  git,
};
