const { prompt, notNumberRule } = require("../../../utils/inquirer");
const CmdList = require("../../../bin/handleCmdList");
const { getAlias } = require("../../../utils/common");
const { getDirRePath } = require("../../../utils/path");
const path = require("path");
const { renameSync } = require("../../../utils/fs");
const log = require("../../../utils/log");

module.exports = async (_, options = {}) => {
  let cliName, config;

  let oldCmd, newCmd, newDesc, newAlias, currLibPath, oldFilePath, newFilePath;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    oldCmd = answers.oldCmd;
    newCmd = answers.newCmd;
    newDesc = answers.newDesc;
    newAlias = answers.newAlias;

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
    {
      desc: () => `也可直接运行 ${cliName} ${newAlias} 命令`,
    },
  ];

  return {
    async prompt(...args) {
      const config = args.pop(); // 最后一个为配置项

      const [arg] = args;

      let answers = {};

      answers = await prompt([
        {
          type: "list",
          name: "oldCmd",
          message: "请选择要更名的命令:",
          choices: CmdList.getFormatList(),
        },
        {
          type: "input",
          name: "newCmd",
          message: "新命令名称（eg：addMsg|addPage）:",
        },
        {
          type: "input",
          name: "newDesc",
          message: "新命令描述（eg：新增页面）:",
        },
        {
          type: "input",
          name: "newAlias",
          message: "新命令简称（eg：am|ap）:",
          default: (answer) => getAlias(answer.newCmd),
          validate: (answer) => notNumberRule(answer, false),
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
