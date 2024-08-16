const inquirer = require("inquirer");
const { log, Spinner, logSplit } = require("../log");
const {
  getHBSContent,

  checkFileExist,
  writeFileSync,
  mkdirSync,

  runStep,
  getAlias,
  cmdListPush,
} = require("../utils");

let cliName;

let cmd, desc, alias, needInquirer, filePath;

// 初始化变量
const initVar = (answers) => {
  cmd = answers.cmd;
  desc = answers.desc;
  alias = answers.alias;
  needInquirer = answers.needInquirer;
  filePath = `lib/${cmd}`;
};

const addCommand = () => cmdListPush({ cmd, alias, desc });

const addFile = () => {
  if (checkFileExist(filePath)) return `${cmd} 文件已存在`;

  try {
    mkdirSync(filePath);

    const fileContent = getHBSContent(
      require(`./templates/${needInquirer ? "inquirer" : "base"}-content`),
      {
        cmd,
        desc,
      }
    );

    writeFileSync(filePath + "/index.js", fileContent);
    return true;
  } catch (error) {
    return error.message;
  }
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: addCommand,
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

module.exports = (_, options) => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "cmd",
        message: "命令名称（eg：addMsg、addPage）:",
        validate(value) {
          value = value.trim();
          if (value) {
            if (isNaN(Number(value))) return true;
            else return "此字段不能为数字";
          } else return "此字段必填";
        },
      },
      {
        type: "input",
        name: "desc",
        message: "命令描述（eg：add a new page）:",
        validate(value) {
          value = value.trim();
          if (value) {
            if (isNaN(Number(value))) return true;
            else return "此字段不能为数字";
          } else return "此字段必填";
        },
      },
      {
        type: "input",
        name: "alias",
        message: "命令简称（eg：am、ap）:",
        default: (answer) => getAlias(answer.cmd),
        validate(value) {
          value = value.trim();
          if (value) {
            if (isNaN(Number(value))) return true;
            else return "此字段不能为数字";
          }
        },
      },
      {
        type: "list",
        name: "needInquirer",
        message: "是否需要 inquirer:",
        choices: [
          { name: "否", value: false },
          { name: "是", value: true },
        ],
      },
    ])
    .then((answers) => {
      const { _description, _name } = options;

      cliName = _name;

      const mainSpinner = new Spinner(_description);

      mainSpinner.start();
      logSplit();

      initVar(answers);

      const runSuccess = runStep(mainStepList);

      if (runSuccess) {
        mainSpinner.succeed();

        logSplit();

        log.warn("next todo");
        runStep(todoStepList, "warn");
      } else {
        mainSpinner.fail();
      }
    });
};
