const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt } = require("../../utils/inquirer");
const { code } = require("../../utils/process");
const { getCwdRePath } = require("../../utils/path");
const {
  checkFileExist,
  readFileSync,
  writeFileSync,
} = require("../../utils/fs");

let mainSpinner;

let editor, changeToValue, changeKey, settingsPath;

// 初始化变量
const initVar = (answers) => {
  editor = answers.editor;
  code.setEditor(editor);
  changeToValue = answers.changeToValue;

  changeKey = "editor.formatOnSave";
  settingsFile = `.vscode/settings.json`;
  settingsPath = getCwdRePath(settingsFile);
};

const changeSettings = () => {
  if (checkFileExist(settingsPath)) {
    let content = readFileSync(settingsPath);
    content = content ? JSON.parse(content) : {};
    content[changeKey] =
      changeToValue !== undefined
        ? ["1", "true"].includes(changeToValue)
        : !content[changeKey];
    writeFileSync(settingsPath, JSON.stringify(content, null, 2));

    return { success: true, tip: `已更改为 ${content[changeKey]}` };
  } else return `${settingsFile} 不存在`;
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: changeSettings,
    desc: () => "更改配置",
  },
  {
    fun: () => code.run("open", settingsFile),
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

module.exports = async (_, options = {}) => {
  const { _name, _description, args } = options;

  const [arg] = args || [];

  let answers = {};

  answers = await prompt([code.prompt]);

  initVar({ ...answers, changeToValue: arg });

  mainSpinner = new Spinner(_description);

  if (mainStepList.length === 1 && !todoStepList?.length) {
    await mainStepList[0].fun();
    return mainSpinner.succeed();
  }

  mainSpinner.start();

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();

    log.warn("next todo", true);
    runStep(todoStepList, "warn", { prefix: "todo" });
  } else {
    mainSpinner.fail();
  }
};
