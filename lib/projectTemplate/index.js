const inquirer = require("inquirer");
const { log, Spinner, logSplit } = require("../log");
const {
  getHBSContent,

  isExistByRegTest,

  checkFileExist,
  writeFileSync,
  mkdirSync,

  splitContentAndJoin,

  runStep,
  getGitUser,
  readFileSync,
} = require("../utils");

const simpleGit = require("simple-git");
const path = require("path");

const git = simpleGit();

let userInfo, name, tool, template, type, githubRepoUrl;

// 初始化变量
const initVar = (answers) => {
  userInfo = getGitUser();
  name = answers.name;
  tool = answers.tool;
  template = answers.template;

  if (tool !== "nuxt" && type === "ts") type = "_ts";
  else type = "";

  githubRepoUrl = `https://github.com/MrHzq/${tool}_${template}${type}.git`;
};

const downloadRepo = async () => {
  try {
    await git.clone(githubRepoUrl, `./${name}`);
    return true;
  } catch (error) {
    return `下载 github 模板出错：${error.message}`;
  }
};

const changePackageName = () => {
  const packagePath = path.resolve("./", name, "package.json");

  if (checkFileExist(packagePath)) {
    const json = JSON.parse(readFileSync(packagePath));
    json.name = name;
    json.templateUrl = githubRepoUrl;
    writeFileSync(packagePath, JSON.stringify(json, null, 4));
    return true;
  } else {
    return "package.json 不存在";
  }
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: downloadRepo,
    desc: () => "下载 github 模板",
  },
  {
    fun: changePackageName,
    desc: () => "更改 package.json 名称",
  },
];

// todo 流程 - step 集合
const todoStepList = [
  {
    desc: () => `cd ${name}`,
  },
  {
    desc: () => `npm install`,
  },
];

module.exports = (_, options) => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "项目名称：",
        name: "name",
        default: "project",
        validate(value) {
          value = value.trim();
          if (value) {
            if (isNaN(Number(value))) return true;
            else return "此字段不能为数字";
          } else return "此字段必填";
        },
      },
      {
        type: "list",
        message: "请选择构建工具：",
        name: "tool",
        choices: ["cli2", "cli3", "nuxt"],
        default: "cli2",
      },
      {
        type: "list",
        message: "请选择项目模板：",
        name: "template",
        choices: ["base", "mobile", "element", "vant"],
        default: "base",
      },
      {
        type: "list",
        message: "请选择语言类型（nuxt只有js）：",
        name: "type",
        choices: ["js", "ts"],
        default: "js",
      },
    ])
    .then(async (answers) => {
      const { _description } = options;

      const mainSpinner = new Spinner(_description);

      mainSpinner.start();
      logSplit();

      initVar(answers);

      const runSuccess = await runStep(mainStepList);

      if (runSuccess) {
        mainSpinner.succeed();

        logSplit();

        log.warn("next todo");
        runStep(todoStepList, "warn", { hideIndex: true });
      } else {
        mainSpinner.fail();
      }
    });
};
