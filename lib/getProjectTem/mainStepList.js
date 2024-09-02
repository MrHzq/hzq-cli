const log = require("../../utils/log");
const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const { prompt, tfList } = require("../../utils/inquirer");
const { gitAddZS, gitCommitZS } = require("../../utils/process");
const {
  checkFileExist,
  writeFileSync,
  removeSync,
  readFileSync,
} = require("../../utils/fs");

const path = require("path");

const simpleGit = require("simple-git");
const { getAliasHyphen } = require("../../utils/common");
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
      removeSync(varObj.fullPath);

      return { success: true, tip: "已强制覆盖" };
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
    content.bin[getAliasHyphen(varObj.name)] = content.main;
    delete content.bin.clit;
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

const deleteGitFile = () => removeSync(path.join(varObj.fullPath, ".git"));

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
];

const relationGit = async () => {
  mainSpinner.do("stop");

  const answers = await prompt([
    {
      type: "list",
      message: `显示[关联远程仓库]步骤`,
      name: "isRelation",
      choices: tfList(),
    },
  ]);

  if (answers.isRelation) {
    todoStepList.push(
      ...[
        {
          desc: () => `git init`,
        },
        {
          desc: () => `git remote add origin [url]`,
        },
        {
          desc: () => `git remote -v`,
        },
        {
          desc: () => `${gitAddZS()} && ${gitCommitZS("Initial commit")}`,
        },
        {
          desc: () => `git push -f origin main`,
        },
      ]
    );
  }

  todoStepList.push(
    ...[
      {
        desc: () => `npm install`,
      },
      {
        desc: () => `npm link`,
      },
      {
        desc: () => getAliasHyphen(varObj.name),
      },
      {
        desc: () => `code .`,
      },
    ]
  );
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

    log.warn("next todo", true);
    runStep(todoStepList, "warn", { prefix: "todo" });
  } else {
    mainSpinner.fail();
  }
};
