const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { getCwdRePath } = require("../../utils/path");
const {
  checkFileExist,
  readFileSync,
  writeFileSync,
} = require("../../utils/fs");
const { processRun, codeCmd } = require("../../utils/process");

let mainSpinner, flag, changeKey, settingsPath;

// 初始化变量
const initVar = (answer) => {
  flag = answer.flag;
  changeKey = "editor.formatOnSave";
  settingsFile = `.vscode/settings.json`;
  settingsPath = getCwdRePath(settingsFile);
};

const change = () => {
  if (checkFileExist(settingsPath)) {
    let content = readFileSync(settingsPath);
    content = content ? JSON.parse(content) : {};
    content[changeKey] =
      flag !== undefined ? ["1", "true"].includes(flag) : !content[changeKey];
    writeFileSync(settingsPath, JSON.stringify(content, null, 2));

    return { success: true, tip: `已更改为 ${content[changeKey]}` };
  } else return `${settingsFile} 不存在`;
};

const vscodeOpen = () => {
  processRun(`${codeCmd} ${settingsFile}`);
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: change,
    desc: () => "更改配置",
  },
  {
    fun: vscodeOpen,
    desc: () => "vscode 打开",
  },
];

// todo 流程 - step 集合
const todoStepList = [
  {
    desc: () => `快捷键 cmd+s 保存 ${settingsFile} 才会生效`,
  },
  {
    desc: () => `快捷键 cmd+w 关闭 ${settingsFile}`,
  },
];

module.exports = async (_, options) => {
  const { _description, args } = options;

  initVar({ flag: args?.[0] });

  mainSpinner = new Spinner(_description);

  if (mainStepList.length === 1) {
    await mainStepList[0].fun();
    return mainSpinner.succeed();
  }

  mainSpinner.start();

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();

    log.newLine();

    log.warn("next todo");
    runStep(todoStepList, "warn", { prefix: "todo" });
  } else {
    mainSpinner.fail();
  }
};