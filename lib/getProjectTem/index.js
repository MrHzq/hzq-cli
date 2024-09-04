const path = require("path");
const { notNumberRule } = require("../../utils/inquirer");

let name, tool, template, type, fullPath, githubRepoUrl;

// 初始化变量
const initVar = (answers) => {
  name = answers.name;

  tool = answers.tool;

  template = answers.template;

  fullPath = path.resolve("./", name);

  let githubRepoName = [tool, template];

  if (type === "ts") githubRepoName.push(type);

  githubRepoUrl = `https://github.com/MrHzq/${githubRepoName.join("_")}.git`;

  return { name, tool, template, type, fullPath, githubRepoUrl };
};

const promptList = [
  {
    type: "input",
    message: "项目名称(eg: vue-h5):",
    name: "name",
    default: "xx-project",
    validate: notNumberRule,
  },
  {
    type: "list",
    message: "请选择构建工具:",
    name: "tool",
    choices: ["cli2", "cli3"],
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
    message: "请选择语言类型",
    name: "type",
    choices: ["js", "ts"],
    default: "js",
  },
];

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname) } = options;

  require("./mainStepList")({ options, promptList, initVar });
};
