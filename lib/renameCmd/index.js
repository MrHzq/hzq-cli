const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { renameSync } = require("../../utils/fs");
const CmdList = require("../../bin/handleCmdList");
const { getDirRePath } = require("../../utils/path");
const { prompt } = require("../../utils/inquirer");
const path = require("path");
const { getAlias } = require("../../utils/common");
const log = require("../../utils/log");

let mainSpinner;

let oldCmd, newCmd, newDesc, newAlias, currLibPath, oldFilePath, newFilePath;

// 初始化变量
const initVar = (answers) => {
  oldCmd = answers.oldCmd;

  newCmd = answers.newCmd;
  newDesc = answers.newDesc;
  newAlias = getAlias(newCmd);

  currLibPath = getDirRePath(__dirname, "../");

  oldFilePath = path.join(currLibPath, oldCmd);
  newFilePath = path.join(currLibPath, newCmd);
};

// 更改文件
const changeFileName = () => {
  if (newCmd) {
    renameSync(oldFilePath, newFilePath);
    return {
      success: true,
      tip: `已改为 ${newCmd}`,
    };
  } else {
    return {
      failType: "warn",
      tip: "无须更改",
    };
  }
};

// 更改命令
const changeCmdName = () => {
  const newCmdObj = { cmd: newCmd, alias: newAlias, _description: newDesc };
  CmdList.replace(newCmdObj, oldCmd);
  return {
    success: true,
    onSuccess() {
      log.newLine();
      Object.entries(newCmdObj).forEach(([key, value]) => {
        if (value) log.success(`${key} 已改为 ${value}`);
      });
    },
  };
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: changeFileName,
    desc: () => "更改文件",
  },
  {
    fun: changeCmdName,
    desc: () => "更改命令",
  },
];

// todo 流程 - step 集合
const todoStepList = [
  {
    desc: () => `可运行 ${cliName} 查询当前命令`,
  },
];

const getRunCmdList = (selfCmd) => {
  return CmdList.getFormatList().filter((item) => item.value !== selfCmd) || [];
};

module.exports = async (_, options) => {
  const { _description, _name, args } = options;

  const [arg] = args || [];

  let answers = {};

  answers = await prompt([
    {
      type: "list",
      name: "oldCmd",
      message: "请选择要更名的命令:",
      choices: getRunCmdList(_name),
    },
    {
      type: "input",
      name: "newCmd",
      message: "请输入新的命令名称:",
    },
    {
      type: "input",
      name: "newDesc",
      message: "请输入新的命令描述:",
    },
  ]);

  initVar(answers);

  mainSpinner = new Spinner(_description);

  if (mainStepList.length === 1 && !todoStepList?.length) {
    await mainStepList[0].fun();
    return mainSpinner.succeed();
  }

  mainSpinner.start();

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();
  } else {
    mainSpinner.fail();
  }
};
