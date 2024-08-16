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
  removeDir,
} = require("../utils");

const path = require("path");
const simpleGit = require("simple-git");
const git = simpleGit(({ method, stage, progress }) => {
  console.log(`git.${method} ${stage} stage ${progress}% complete`);
});

let mainSpinner;

let userInfo, name, template, fullPath, githubRepoUrl;

// 初始化变量
const initVar = (answers) => {
  userInfo = getGitUser();
  name = answers.name;
  template = answers.template;

  fullPath = path.resolve("./", name);

  githubRepoUrl = `https://github.com/MrHzq/${template}.git`;
};

const checkNameExist = async () => {
  if (checkFileExist(fullPath)) {
    mainSpinner.stop();
    const { force } = await inquirer.prompt([
      {
        type: "input",
        message: `${name} 已存在，是否强制覆盖(Y/N)：`,
        name: "force",
      },
    ]);

    if (force.toLowerCase() === "y") {
      removeDir(fullPath);

      log.warn("已强制覆盖");
      return true;
    } else {
      return `${name} 已存在，不强制覆盖`;
    }
  } else return true;
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
  const packagePath = path.join(fullPath, "package.json");

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
    fun: changePackageName,
    desc: () => "更改 package.json 名称",
  },
  {
    fun: deleteGitFile,
    desc: () => "删除原来的 .git 文件",
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
        message: "项目名称(eg: hzq-cli)：",
        name: "name",
        default: "xx-cli",
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
        message: "请选择模板：",
        name: "template",
        choices: ["cli-template-2024"],
        default: "cli-template-2024",
      },
    ])
    .then(async (answers) => {
      const { _description } = options;

      mainSpinner = new Spinner(_description);

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
