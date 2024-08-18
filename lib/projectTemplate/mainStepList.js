const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt, numberRule, tfList } = require("../../utils/inquirer");
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

let mainSpinner, varObj;

const checkNameExist = async () => {
  if (checkFileExist(varObj.fullPath)) {
    mainSpinner.do("stop");

    const { force } = await prompt([
      {
        type: "list",
        message: `${varObj.name} 已存在，是否强制覆盖：`,
        name: "force",
        choices: tfList(),
      },
    ]);

    if (force) {
      removeDir(varObj.fullPath);

      return { failType: "warn", tip: "已强制覆盖" };
    } else return `${varObj.name} 已存在，不强制覆盖`;
  }
};

const downloadRepo = async () => {
  try {
    await git.clone(varObj.githubRepoUrl, `./${varObj.name}`);
  } catch (error) {
    return `下载 github 模板出错：${error.message}`;
  }
};

const changePackage = () => {
  const packagePath = path.join(varObj.fullPath, "package.json");

  if (checkFileExist(packagePath)) {
    const content = JSON.parse(readFileSync(packagePath));
    content.name = varObj.name;
    content.description = varObj.name;
    content.templateUrl = varObj.githubRepoUrl;
    writeFileSync(packagePath, JSON.stringify(content, null, 4));
  } else return "package.json 不存在";
};

const changeReadme = () => {
  const readmePath = path.join(varObj.fullPath, "README.md");

  if (checkFileExist(readmePath)) {
    writeFileSync(readmePath, `# ${varObj.name}`);
  } else return "package.json 不存在";
};

const deleteGitFile = () => removeDir(path.join(varObj.fullPath, ".git"));

// 主流程 - step 集合
const mainStepList = [
  {
    fun: checkNameExist,
    desc: () => `检查 ${varObj.name} 是否存在`,
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
    desc: () => `cd ${varObj.name}`,
  },
  {
    desc: () => `npm install`,
  },
];

const relationGit = async () => {
  mainSpinner.do("stop");

  const answers = await prompt([
    {
      type: "list",
      message: `是否关联远程仓库`,
      name: "isRelation",
      choices: tfList(),
    },
    {
      type: "input",
      message: `请输入远程仓库地址`,
      name: "origin",
      validate: (value) => numberRule(value, false),
      when: (answers) => answers.isRelation,
    },
  ]);

  if (answers.origin) {
    todoStepList.push(
      ...[
        {
          desc: () => `git init`,
        },
        {
          desc: () => `git remote add origin ${answers.origin}`,
        },
        {
          desc: () => `git remote -v`,
        },
        {
          desc: () => `git add . && git commit -m "Initial commit"`,
        },
        {
          desc: () => `git push -f origin main`,
        },
      ]
    );
  }
};

module.exports = async ({ options, promptList, initVar }) => {
  const answers = await prompt(promptList);

  const { _description } = options;

  varObj = initVar(answers);

  mainSpinner = new Spinner(_description);

  mainSpinner.start();

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();

    await relationGit();

    log.newLine();

    log.warn("next todo");
    runStep(todoStepList, "warn", { hideIndex: true });
  } else {
    mainSpinner.fail();
  }
};
