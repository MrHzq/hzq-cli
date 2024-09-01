module.exports = async (_, options = {}) => {
  const { prompt } = require("../../utils/inquirer");
  const { getCwdRePath } = require("../../utils/path");
  const { code } = require("../../utils/process");
  const {
    checkFileExist,
    writeFileSync,
    readFileSync,
  } = require("../../utils/fs");

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

  // 生成当前配置对应的 prompt
  const createConfigPromptList = (config) => {
    const promptList = [];

    const editorPrompt = {
      ...code.prompt,
      name: "config.editor",
      message: "请选择默认编辑器:",
    };

    if (!config.editor) promptList.push(editorPrompt);

    return promptList.length ? promptList : null;
  };

  return {
    async prompt(...args) {
      const config = args.pop();

      const reset = args[0] === "reset";

      const promptList = createConfigPromptList(reset ? {} : config);

      const answers = promptList ? await prompt(promptList) : {};

      answers.changeToValue = args[0];

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
