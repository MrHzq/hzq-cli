const { prompt } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { getCwdRePath } = require("../../utils/path");
const { code } = require("../../utils/process");
const {
  checkFileExist,
  writeFileSync,
  readFileSync,
} = require("../../utils/fs");

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname), _description } = options;

  let cliName, config;
  let changeToValue, changeKey, settingsPath;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    code.setEditor(config.editor);

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

    const configKeys = Object.keys(config);
    const configLen = configKeys.length;

    if (!configLen) configType = "add";

    const editorPrompt = {
      ...code.prompt,
      name: "config.editor",
      message: "请选择默认编辑器:",
    };

    if (["reset", "add"].includes(configType)) {
      promptList.push(editorPrompt);
    }

    return promptList;
  };

  return {
    async prompt(_config, ...args) {
      configType = args[0];

      if (["reset", "add"].includes(configType)) args.shift(); // 若需要重置/新增，则将第一个参数删除掉

      // promptList 按情况使用
      const promptList = createConfigPromptList(_config, configType);

      const [arg] = args;
      changeToValue = arg;

      let answers = {};

      answers = await prompt(promptList);

      answers.configType = configType;

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
