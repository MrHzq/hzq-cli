const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const CmdList = require("../../bin/handleCmdList");
const { prompt, numberRule, tfList } = require("../../utils/inquirer");
const { getHBSContent, getAlias } = require("../../utils/common");
const { checkFileExist, mkdirSync, writeFileSync } = require("../../utils/fs");
const path = require("path");

let mainSpinner, cliName;

let cmd, desc, alias, needInquirer, needTodo, filePath;

// 初始化变量
const initVar = (answers) => {
  cmd = answers.cmd;
  desc = answers.desc;
  alias = answers.alias;
  needInquirer = answers.needInquirer;
  needTodo = answers.needTodo;
  filePath = path.join(path.dirname(__dirname), cmd);
};

const addFile = () => {
  if (checkFileExist(filePath)) return `${cmd} 文件已存在`;

  try {
    mkdirSync(filePath);

    const hbsPath = require(`./templates/${
      needInquirer ? "inquirer" : "base"
    }-content`);

    const fileContent = getHBSContent(hbsPath, { cmd, desc, todo: needTodo });

    writeFileSync(filePath + "/index.js", fileContent);
  } catch (error) {
    return error.message;
  }
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: () => CmdList.add({ cmd, alias, desc }),
    desc: () => `新增命令 ${cmd}`,
  },
  {
    fun: addFile,
    desc: () => `新增文件 ${filePath}`,
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
  const { _description, parent } = options;

  cliName = parent._name;

  const answers = await prompt([
    {
      type: "input",
      name: "cmd",
      message: "命令名称（eg：addMsg|addPage）:",
      validate: numberRule,
    },
    {
      type: "input",
      name: "desc",
      message: "命令描述（eg：新增页面）:",
      validate: numberRule,
    },
    {
      type: "input",
      name: "alias",
      message: "命令简称（eg：am|ap）:",
      default: (answers) => getAlias(answers.cmd),
      validate: numberRule,
    },
    {
      type: "list",
      name: "needInquirer",
      message: "是否需要 inquirer:",
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

    log.newLine();

    log.warn("next todo");
    runStep(todoStepList, "warn", { prefix: "todo" });
  } else {
    mainSpinner.fail();
  }
};
