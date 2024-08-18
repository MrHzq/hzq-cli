const { numberRule } = require("../../utils/inquirer");
const path = require("path");

let name, template, fullPath, githubRepoUrl;

// 初始化变量
const initVar = (answers) => {
  name = answers.name;

  template = answers.template;

  fullPath = path.resolve("./", name);

  githubRepoUrl = `https://github.com/MrHzq/${template}.git`;

  return { name, template, fullPath, githubRepoUrl };
};

const promptList = [
  {
    type: "input",
    message: "项目名称(eg: hzq-cli):",
    name: "name",
    default: "xx-cli",
    validate: numberRule,
  },
  {
    type: "list",
    message: "请选择模板：",
    name: "template",
    choices: ["cli-template-2024"],
    default: "cli-template-2024",
  },
];

module.exports = async (_, options) => {
  require("../projectTemplate/mainStepList")({ options, promptList, initVar });
};
