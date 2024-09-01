module.exports = async (_, options = {}) => {
  const { prompt, notNumberRule, tfList } = require("../../utils/inquirer");
  const { getDirRePath } = require("../../utils/path");
  const path = require("path");
  const { getHBSContent, getAlias } = require("../../utils/common");
  const {
    checkFileExist,
    writeFileSync,
    readFileSync,
    mkdirSync,
  } = require("../../utils/fs");

  const CmdList = require("../../bin/handleCmdList");

  let cliName,
    cmd,
    desc,
    alias,
    needInquirer,
    needConfig,
    needTodo,
    currLibPath,
    newFilePath;

  // 初始化变量
  const initVar = (answers) => {
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

      const temPath = `./templates/content.hbs`;

      const templateContent = readFileSync(getDirRePath(__dirname, temPath));

      const fileContent = getHBSContent(templateContent, {
        cmd,
        desc,
        needInquirer,
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

  return {
    async prompt(...args) {
      const config = args.pop();

      const answers = await prompt([
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
          name: "needInquirer",
          message: "是否需要 inquirer:",
          choices: tfList(),
        },
        {
          type: "list",
          name: "needConfig",
          message: "是否需要配置:",
          choices: tfList(),
        },
        {
          type: "list",
          name: "needTodo",
          message: "是否需要 todo:",
          choices: tfList(),
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
