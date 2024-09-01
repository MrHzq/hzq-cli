const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { getDirRePath, pathEqCwd } = require("../../utils/path");
const { cd, git } = require("../../utils/process");
const { formatTime } = require("../../utils/common");
const { readdirSync, removeDir, copyDir } = require("../../utils/fs");
const path = require("path");

module.exports = async (_, options = {}) => {
  let cliName, config;

  let needUpdateDir, noUpdateFile, needUpdateLibFile, handleFile, inProject;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    needUpdateDir = ["bin", "config", "lib", "utils"];
    noUpdateFile = [
      "cmdList.json",
      "content-v1.hbs",
      "global.json",
      ".DS_Store",
    ];
    needUpdateLibFile = [
      "addCmd",
      "deleteCmd",
      // "mergeCmd",
      "renameCmd",
      "runCmd",
    ];
    handleFile = [];
    currProjectPath = getDirRePath(__dirname, "../../");
    inProject = pathEqCwd(config.cliTemDir);
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
        const t = path.join(config.cliTemDir, s.replace(currProjectPath, ""));
        removeDir(t);
        copyDir(s, t);
        handleFile.push(s.replace(currProjectPath, ""));
      });
    });

    return {
      success: true,
      tip: `已处理文件: \n${handleFile.join("\n")}`,
    };
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => "删除&拷贝",
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
      desc: () => cd.cd(config.cliTemDir),
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

    const configLen = Object.keys(config).length;

    const cliTemDirPrompt = configLen
      ? {
          type: "list",
          name: "config.cliTemDir",
          message: "请选择项目目录:",
          choices: Object.keys(config).map((key) => ({
            name: config[key],
            value: config[key],
          })),
        }
      : {
          type: "input",
          name: "config.cliTemDir",
          message: "请输入项目目录:",
          validate: notNumberRule,
        };

    promptList.push(cliTemDirPrompt);

    return promptList;
  };

  return {
    async prompt(...args) {
      const config = args.pop(); // 最后一个为配置项

      const reset = args[0] === "reset";

      if (reset) args.shift(); // 若需要重置，则将第一个参数删除掉

      const promptList = createConfigPromptList(reset ? {} : config);
      // promptList 按情况使用

      const [arg] = args;
      const answers = await prompt(promptList);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
