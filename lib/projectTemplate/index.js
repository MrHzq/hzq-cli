const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt, numberRule } = require("../../utils/inquirer");
const {
  checkFileExist,
  writeFileSync,
  removeDir,
  readFileSync,
} = require("../../utils/fs");

const path = require("path");

const simpleGit = require("simple-git");
const git = simpleGit(({ method, stage, progress }) => {
  log.chalk(`git.${method} ${stage} stage ${progress}% complete`, "blue");
});

let mainSpinner;

let name, tool, template, type, fullPath, githubRepoUrl;

// 初始化变量
const initVar = (answers) => {
  name = answers.name;

  tool = answers.tool;

  template = answers.template;

  if (tool !== "nuxt" && type === "ts") type = "_ts";
  else type = "";

  fullPath = path.resolve("./", name);

  githubRepoUrl = `https://github.com/MrHzq/${tool}_${template}${type}.git`;
};

const checkNameExist = async () => {
  if (checkFileExist(fullPath)) {
    mainSpinner.do("stop");

    const { force } = await prompt([
      {
        type: "list",
        message: `${name} 已存在，是否强制覆盖：`,
        name: "force",
        choices: [
          { name: "否", value: false },
          { name: "是", value: true },
        ],
      },
    ]);

    if (force) {
      removeDir(fullPath);

      log.warn("已强制覆盖");
    } else return `${name} 已存在，不强制覆盖`;
  }
};

const downloadRepo = async () => {
  try {
    await git.clone(githubRepoUrl, `./${name}`);
  } catch (error) {
    return `下载 github 模板出错：${error.message}`;
  }
};

const changePackage = () => {
  const packagePath = path.join(fullPath, "package.json");

  if (checkFileExist(packagePath)) {
    const json = JSON.parse(readFileSync(packagePath));
    json.name = name;
    json.description = name;
    json.templateUrl = githubRepoUrl;
    writeFileSync(packagePath, JSON.stringify(json, null, 4));
  } else return "package.json 不存在";
};

const deleteGitFile = () => removeDir(path.join(fullPath, ".git"));

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
    desc: () => `npm install`,
  },
];

module.exports = async (_, options) => {
  const answers = await prompt([
    {
      type: "input",
      message: "项目名称(eg: vue-h5):",
      name: "name",
      default: "xx-project",
      validate: numberRule,
    },
    {
      type: "list",
      message: "请选择构建工具:",
      name: "tool",
      choices: ["cli2", "cli3", "nuxt"],
      default: "cli2",
    },
    {
      type: "list",
      message: "请选择项目模板:",
      name: "template",
      choices: ["base", "mobile", "element", "vant"],
      default: "base",
    },
    {
      type: "list",
      message: "请选择语言类型(nuxt 只有 js)",
      name: "type",
      choices: ["js", "ts"],
      default: "js",
    },
  ]);

  const { _description } = options;

  mainSpinner = new Spinner(_description);

  mainSpinner.start();

  initVar(answers);

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();

    log.newLine();

    log.warn("next todo");
    runStep(todoStepList, "warn", { hideIndex: true });
  } else {
    mainSpinner.fail();
  }
};
