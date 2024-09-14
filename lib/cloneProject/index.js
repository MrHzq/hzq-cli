const { prompt, notNumberRule, tfList } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const path = require("path");
const { getRandomStr, getAliasHyphen } = require("../../utils/common");
const {
  removeSync,
  checkFileExist,
  readFileSync,
  writeFileSync,
} = require("../../utils/fs");
const log = require("../../utils/log");
const simpleGit = require("simple-git");
const sGit = simpleGit(({ method, stage, progress }) => {
  log.chalk(`git.${method} ${stage} stage ${progress}% complete`, "blue");
});

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname), _description } = options;

  let cliName, config;

  let name, template, fullPath, githubRepoUrl;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    name = answers.name;
    template = answers.template;
    tool = answers.tool;
    type = answers.type;
    fullPath = path.resolve("./", name);
    if (tool) {
      let githubRepoName = [tool, template];

      if (type === "ts") githubRepoName.push(type);

      githubRepoUrl = `https://github.com/MrHzq/${githubRepoName.join(
        "_"
      )}.git`;
    } else githubRepoUrl = `https://github.com/MrHzq/${template}.git`;
  };

  const checkNameExist = async (mainSpinner) => {
    if (checkFileExist(fullPath)) {
      mainSpinner.do("stop");

      const { force } = await prompt([
        {
          type: "list",
          message: `${name} 已存在，是否强制覆盖：`,
          name: "force",
          choices: tfList(),
        },
      ]);

      if (force) {
        removeSync(fullPath);

        return { success: true, tip: "已强制覆盖" };
      } else return `${name} 已存在，不强制覆盖`;
    }
  };

  const downloadRepo = async () => {
    try {
      log.succeed(`模板地址: ${githubRepoUrl}`);
      await sGit.clone(githubRepoUrl, `./${name}`);
    } catch (error) {
      return `下载 github 模板出错：${error.message}`;
    }
  };

  const changePackage = () => {
    const packagePath = path.join(fullPath, "package.json");

    if (checkFileExist(packagePath)) {
      const content = JSON.parse(readFileSync(packagePath));
      content.name = name;
      content.description = name;
      content.bin[getAliasHyphen(name)] = content.main;
      delete content.bin.clit;
      content.templateUrl = githubRepoUrl;
      writeFileSync(packagePath, JSON.stringify(content, null, 4));
    } else return "package.json 不存在";
  };

  const changeReadme = () => {
    const readmePath = path.join(fullPath, "README.md");

    if (checkFileExist(readmePath)) {
      writeFileSync(readmePath, `# ${name}`);
    } else return "package.json 不存在";
  };

  const deleteGitFile = () => removeSync(path.join(fullPath, ".git"));

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: checkNameExist,
      desc: () => `检查 ${name} 是否存在`,
    },
    {
      fun: downloadRepo,
      desc: () => "下载 github 模板",
    },
    {
      fun: changePackage,
      desc: () => "更改 package.json 文件",
    },

    {
      fun: changeReadme,
      desc: () => "更改 README.md 文件",
    },
    {
      fun: deleteGitFile,
      desc: () => "删除 .git 文件",
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    {
      desc: () => `cd ${name}`,
    },
    {
      desc: () => `pnpm i`,
    },
    {
      desc: () => `code .`,
    },
  ];

  return {
    async prompt(_config, ...args) {
      const [arg] = args;

      let answers = {};

      answers = await prompt([
        {
          type: "input",
          message: "项目名称(eg: vue-h5/hzq-cli):",
          name: "name",
          default: "xx-" + getRandomStr(),
          validate: notNumberRule,
        },
        {
          type: "list",
          message: "请选择项目模板:",
          name: "template",
          choices: ["cli-template-2024", "base", "mobile", "element", "vant"],
          default: "cli-template-2024",
        },
        {
          type: "list",
          message: "请选择构建工具:",
          name: "tool",
          choices: ["cli2", "cli3"],
          default: "cli2",
          when: (answers) => answers.template !== "cli-template-2024",
        },
        {
          type: "list",
          message: "请选择语言类型",
          name: "type",
          choices: ["js", "ts"],
          default: "js",
          when: (answers) => answers.template !== "cli-template-2024",
        },
      ]);

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
