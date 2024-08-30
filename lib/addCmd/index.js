const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const CmdList = require("../../bin/handleCmdList");
const { prompt, notNumberRule, tfList } = require("../../utils/inquirer");
const { getHBSContent, getAlias } = require("../../utils/common");
const {
  checkFileExist,
  mkdirSync,
  writeFileSync,
  readFileSync,
} = require("../../utils/fs");
const path = require("path");
const { getDirRePath } = require("../../utils/path");

let mainSpinner, cliName;

let cmd,
  desc,
  alias,
  needInquirer,
  needConfig,
  needTodo,
  currLibPath,
  newAddFilePath;

// 初始化变量
const initVar = (answers) => {
  cmd = answers.cmd.trim();
  desc = answers.desc.trim();
  alias = answers.alias;
  needInquirer = answers.needInquirer;
  needConfig = answers.needConfig;
  needTodo = answers.needTodo;
  currLibPath = getDirRePath(__dirname, "../");
  newAddFilePath = path.join(currLibPath, cmd);
};

const addFile = () => {
  if (checkFileExist(newAddFilePath)) return `${cmd} 文件已存在`;

  try {
    mkdirSync(newAddFilePath);

    const temPath = `./templates/content.hbs`;

    const templateContent = readFileSync(getDirRePath(__dirname, temPath));

    const fileContent = getHBSContent(templateContent, {
      cmd,
      desc,
      needInquirer,
      needConfig,
      needTodo,
    });

    writeFileSync(newAddFilePath + "/index.js", fileContent);
  } catch (error) {
    return error.message;
  }
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: addFile,
    desc: () => `新增文件 ${newAddFilePath}`,
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

module.exports = async (_, options) => {
  const { _description } = options;

  cliName = CmdList.getCliName();

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
      default: (answers) => getAlias(answers.cmd),
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

  initVar(answers);

  mainSpinner = new Spinner(_description);

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
