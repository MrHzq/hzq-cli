const path = require("path");
const { prompt, notNumberRule, tfList } = require("../../../utils/inquirer");
const CmdList = require("../../../bin/handleCmdList");
const { getDirRePath } = require("../../../utils/path");
const { getHBSContent, getAlias } = require("../../../utils/common");
const {
  checkFileExist,
  writeFileSync,
  readFileSync,
  mkdirSync,
} = require("../../../utils/fs");

module.exports = async (_, options = {}) => {
  let cliName, config;

  let cmd,
    desc,
    alias,
    needInquirer,
    needConfig,
    needTodo,
    currLibPath,
    newFilePath;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    cmd = answers.cmd.trim();
    desc = answers.desc.trim();
    alias = answers.alias;
    needInquirer = answers.needInquirer;
    needConfig = answers.needConfig;
    needTodo = answers.needTodo;
    currLibPath = getDirRePath(__dirname, "../");

    newFilePath = path.join(currLibPath, cmd);
  };

  const addFile = () => {
    if (checkFileExist(newFilePath)) return `${cmd} 文件已存在`;

    try {
      mkdirSync(newFilePath);

      const temPath = `./templates/content-${config.version}.hbs`;

      const templateContent = readFileSync(getDirRePath(__dirname, temPath));

      const fileContent = getHBSContent(templateContent, {
        cmd,
        desc,
        needInquirer: needInquirer || needConfig,
        needConfig,
        needTodo,
      });

      writeFileSync(newFilePath + "/index.js", fileContent);
    } catch (error) {
      return error.message;
    }
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: addFile,
      desc: () => `新增文件 ${newFilePath}`,
    },
    {
      fun: () => CmdList.add({ cmd, alias, _description: desc }),
      desc: () => `新增命令 ${cmd}`,
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    {
      desc: () => `可运行 ${cliName} 查询新增的 ${cmd} 命令`,
    },
    {
      desc: () => `也可直接运行 ${cliName} ${alias} 命令`,
    },
  ];

  // 生成当前配置对应的 prompt
  const createConfigPromptList = (config) => {
    const promptList = [];

    const versionPrompt = {
      type: "list",
      name: "config.version",
      message: "请输入生成模板版本:",
      choices: ["v1", "v2"],
    };

    if (!config.version) promptList.push(versionPrompt);

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

      let answers = {};

      answers = await prompt([
        ...promptList,
        {
          type: "input",
          name: "cmd",
          message: "命令名称（eg：addMsg|addPage）:",
          validate: notNumberRule,
        },
        {
          type: "input",
          name: "desc",
          message: "命令描述（eg：新增页面）:",
          validate: notNumberRule,
        },
        {
          type: "input",
          name: "alias",
          message: "命令简称（eg：am|ap）:",
          default: (answer) => getAlias(answer.cmd),
          validate: (answer) => notNumberRule(answer, false),
        },
        {
          type: "list",
          name: "needConfig",
          message: "是否需要配置:",
          choices: tfList(),
        },
        {
          type: "list",
          name: "needInquirer",
          message: "是否需要 inquirer:",
          choices: tfList(true),
          when: (answer) => !answer.needConfig,
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
