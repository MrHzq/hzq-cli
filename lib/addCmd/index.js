const path = require("path");
const { prompt, notNumberRule, tfList } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const { getDirRePath, getDirName, getCmdName } = require("../../utils/path");
const { getHBSContent, getAlias } = require("../../utils/common");
const {
  checkFileExist,
  writeFileSync,
  readFileSync,
  mkdirSync,
} = require("../../utils/fs");

module.exports = async (_, options = {}) => {
  const {
    _name = getDirName(__dirname),
    _cmdName = getCmdName(),
    _description,
  } = options;

  let cliName, config;

  let cmd,
    desc,
    alias,
    needInquirer,
    needConfig,
    needMuteConfig,
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
    needMuteConfig = answers.needMuteConfig;
    currLibPath = getDirRePath(__dirname, "../");

    newFilePath = path.join(currLibPath, cmd);
  };

  const runMain = async () => {
    if (checkFileExist(newFilePath)) return `${cmd} 文件已存在`;

    try {
      mkdirSync(newFilePath);

      const temPath = `./templates/content.hbs`;

      const templateContent = readFileSync(getDirRePath(__dirname, temPath));

      const fileContent = getHBSContent(templateContent, {
        cmd,
        desc,
        needInquirer: needInquirer || needConfig,
        needConfig,
        needMuteConfig,
      });

      writeFileSync(newFilePath + "/index.js", fileContent);
    } catch (error) {
      return error.message;
    }
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
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
    async prompt(_config, ...args) {
      const [arg] = args;

      let answers = {};

      answers = await prompt([
        {
          type: "input",
          name: "cmd",
          message: "命令名称（eg：addMsg|addPage）:",
          validate: (answer) => {
            const valRes1 = notNumberRule(answer);

            if (typeof valRes1 === "string") return valRes1;

            if (CmdList.checkCmdExist(answer)) return `${answer} 已存在`;

            return true;
          },
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
          default: (answer) => {
            const newAlias = getAlias(answer.cmd);
            if (CmdList.checkAliasExist(newAlias)) return "";
            else return newAlias;
          },
          validate: (answer) => {
            const valRes1 = notNumberRule(answer, false);

            if (typeof valRes1 === "string") return valRes1;

            if (CmdList.checkAliasExist(answer)) return `${answer} 已存在`;

            return true;
          },
        },
        {
          type: "list",
          name: "needConfig",
          message: "是否需要配置:",
          choices: tfList(),
        },
        {
          type: "list",
          name: "needMuteConfig",
          message: "是否存在一个 key 有多个的情况:",
          choices: tfList(),
          when: (answer) => answer.needConfig,
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
