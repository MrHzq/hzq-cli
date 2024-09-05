const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const path = require("path");
const {
  checkFileExist,
  mkdirSync,
  readFileSync,
  writeFileSync,
  moveSync,
  readdirSync,
} = require("../../utils/fs");
const { getDirRePath, getDirName } = require("../../utils/path");
const { getHBSContent, getAlias } = require("../../utils/common");

module.exports = async (_, options = {}) => {
  const { _name = getDirName(__dirname) } = options;

  let cliName, config;

  let mergeCmdList, newCmd, newDesc, newAlias, currLibPath, newFilePath;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    mergeCmdList = answers.mergeCmdList;

    newCmd = answers.newCmd;
    newDesc = answers.newDesc;
    newAlias = getAlias(newCmd);

    currLibPath = getDirRePath(__dirname, "../");

    newFilePath = path.join(currLibPath, newCmd);
  };

  // 新增文件
  const addFile = () => {
    if (checkFileExist(newFilePath)) return `${newCmd} 文件已存在`;

    try {
      mkdirSync(newFilePath);

      const temPath = `./templates/content.hbs`;

      const templateContent = readFileSync(getDirRePath(__dirname, temPath));

      const fileContent = getHBSContent(templateContent, {
        needInquirer: true,
      });

      writeFileSync(newFilePath + "/index.js", fileContent);
    } catch (error) {
      return error.message;
    }
  };

  // 移动文件夹
  const moveDir = () => {
    mergeCmdList.forEach((fileName) => {
      moveSync(
        path.join(currLibPath, fileName),
        path.join(newFilePath, fileName)
      );
    });
  };

  // 更改 require 路径
  const changeRequirePath = () => {
    mergeCmdList.forEach((parentFileName) => {
      const parentFilePath = path.join(newFilePath, parentFileName);

      const childFileList = readdirSync(parentFilePath);

      childFileList.forEach((childFileName) => {
        if (!childFileName.includes(".js")) return;

        const childFilePath = path.join(parentFilePath, childFileName);

        let fileContent = readFileSync(childFilePath);

        // 正则表达式匹配 require 语句中的路径
        const requireRegex = /require\(["'](.*?)["']\)/g;
        let match;
        while ((match = requireRegex.exec(fileContent)) !== null) {
          const originalPath = match[1];
          if (originalPath && originalPath.startsWith("../")) {
            const newPath = `../${originalPath}`;

            fileContent = fileContent.replace(
              `require("${originalPath}")`,
              `require("${newPath}")`
            );
          }
        }

        writeFileSync(childFilePath, fileContent);
      });
    });
  };

  //  更改 cmdList.json
  const changeCmdList = () => {
    const newCmdItem = {
      cmd: newCmd,
      alias: newAlias,
      _description: newDesc,
      children: mergeCmdList.map((cmd) => {
        const oldCmdList = CmdList.find(cmd);
        CmdList.delete(cmd);
        return oldCmdList;
      }),
    };

    CmdList.add(newCmdItem);
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: addFile,
      desc: () => `新增文件 ${newCmd}`,
      failType: "warn",
    },
    {
      fun: moveDir,
      desc: () => `移动文件夹 ${mergeCmdList}`,
    },
    {
      fun: changeRequirePath,
      desc: () => `更改 require 路径`,
    },
    {
      fun: changeCmdList,
      desc: () => `更改 cmdList.json`,
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    {
      desc: () => `可运行 ${cliName} 查询新增的 ${newCmd} 命令`,
    },
    {
      desc: () => `也可直接运行 ${cliName} ${newAlias} 命令`,
    },
  ];

  const getCmdList = (selfCmd) => CmdList.getFormatListFilter({ cmd: selfCmd });

  return {
    async prompt(_config, ...args) {
      const [arg] = args;

      let answers = {};

      answers = await prompt([
        {
          type: "checkbox",
          name: "mergeCmdList",
          message: "请选择要合并的命令（可多选）:",
          choices: getCmdList(_name),
        },
        {
          type: "input",
          name: "newCmd",
          message: "合并后的命令名称（eg：addMsg|addPage）:",
          default: "baseCmd",
          validate: notNumberRule,
        },
        {
          type: "input",
          name: "newDesc",
          message: "合并后的命令描述（eg：新增页面）:",
          default: "基础命令的操作：增删改查",
          validate: notNumberRule,
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
