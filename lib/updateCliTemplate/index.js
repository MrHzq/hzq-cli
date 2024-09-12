const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { getDirRePath, pathEqCwd } = require("../../utils/path");
const { cd, git } = require("../../utils/process");
const { formatTime } = require("../../utils/common");
const {
  readdirSync,
  removeSync,
  copyDir,
  writeFileSync,
} = require("../../utils/fs");
const path = require("path");

const oneKeyHasMute = true; // 一个 key 是否存在多个

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname) } = options;

  let cliName, config, configType;

  let currPromptKey = "cliTemDir";

  let needUpdateDir, noUpdateFile, needUpdateLibFile, handleFile, inProject;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    needUpdateDir = ["bin", "config", "lib", "utils"];
    noUpdateFile = ["cmdList.json", "global.json", ".DS_Store"];
    needUpdateLibFile = [
      "addCmd",
      "deleteCmd",
      "ls",
      "mergeCmd",
      "renameCmd",
      "runCmd",
    ];
    handleFile = [];
    currProjectPath = getDirRePath(__dirname, "../../");
    inProject = pathEqCwd(config[currPromptKey]);
  };

  const runMain = () => {
    needUpdateDir.forEach((dir) => {
      const cpFile = path.join(currProjectPath, dir);

      readdirSync(cpFile).forEach((file) => {
        if (noUpdateFile.includes(file)) return;

        if (dir === "lib") {
          if (!needUpdateLibFile.includes(file)) return;
        }

        const s = path.join(cpFile, file);
        const t = path.join(
          config[currPromptKey],
          s.replace(currProjectPath, "")
        );
        removeSync(t);
        copyDir(s, t);
        handleFile.push(s.replace(currProjectPath, ""));
      });
    });
  };

  // 生成 cmdList.json
  const createCmdList = () => {
    const cmdList = [];

    needUpdateLibFile.forEach((cmd) => cmdList.push(CmdList.find(cmd)));

    const cmdListPath = path.join(config[currPromptKey], "bin/cmdList.json");

    writeFileSync(cmdListPath, JSON.stringify(cmdList, null, 2));

    handleFile.push("bin/cmdList.json");

    return {
      success: true,
      tip: `已处理文件: \n${handleFile
        .sort((a, b) => a.localeCompare(b))
        .join("\n")}`,
    };
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => "删除&拷贝",
    },
    {
      fun: createCmdList,
      desc: () => "生成 CmdList.json",
    },
    {
      fun: () => git.run("add"),
      desc: () => "暂存",
      failType: "warn",
      ignore: () => !inProject,
    },
    {
      fun: () =>
        git.run("commit", `feat: auto update from hzq-cli - ${formatTime()}`),
      desc: () => "提交",
      failType: "warn",
      ignore: () => !inProject,
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    {
      desc: () => cd.cd(config[currPromptKey]),
    },
    {
      desc: () => git.add(),
    },
    {
      desc: () =>
        git.commit(`feat: auto update from hzq-cli - ${formatTime()}`),
    },
  ];

  // 生成当前配置对应的 prompt
  const createConfigPromptList = (config) => {
    const promptList = [];

    const configKeys = Object.keys(config);
    const configLen = configKeys.length;

    let isChoices = Boolean(configLen);

    if (["reset", "add"].includes(configType)) isChoices = false;

    if (oneKeyHasMute && configType === "add" && configLen) {
      currPromptKey = "cliTemDir" + configLen;
    }

    if (!configLen) configType = "add";

    let cliTemDirPrompt = {
      type: "input",
      name: `config.${currPromptKey}`,
      message: "请输入项目目录:",
      validate: notNumberRule,
    };

    if (isChoices) {
      cliTemDirPrompt = {
        type: "list",
        name: "config.cliTemDir",
        message: "请选择项目目录:",
        choices: configKeys.map((key) => ({
          name: config[key],
          value: config[key],
        })),
      };
    }
    promptList.push(cliTemDirPrompt);

    return promptList;
  };

  return {
    // 第一个 _config 为配置项
    async prompt(_config, ...args) {
      configType = args[0];

      if (["reset", "add"].includes(configType)) args.shift(); // 若需要重置/新增，则将第一个参数删除掉

      // promptList 按情况使用
      const promptList = createConfigPromptList(_config, configType);

      const [arg] = args;

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
