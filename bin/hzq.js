#! /usr/bin/env node

const fs = require("fs");
const program = require("commander");
const inquirer = require("inquirer");
const download = require("download-git-repo");
const chalk = require("chalk");
const ora = require("ora");
const pkg = require("../package.json");

program
  .version(pkg.version)
  .option("i, init", "初始化项目")
  .parse(process.argv);
const promptList = [
  {
    type: "input",
    message: "项目名称：",
    name: "name",
    default: "project",
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
];
if (program.init) {
  console.info("");
  inquirer.prompt(promptList).then((answers) => {
    let type = "";
    if (answers.tool !== "nuxt" && answers.type === "ts") type = "_ts";
    const url = `${answers.tool}_${answers.template}${type}`;

    const spinner = ora(
      "正在下载 " + url + " 模板，可能有点慢，请保持耐心~~"
    ).start();

    let _download = `MrHzq/${url}`;

    download(_download, answers.name, (err) => {
      if (!err) {
        spinner.clear();
        console.info("");
        console.info(
          chalk.green("-----------------------------------------------------")
        );
        console.info("");
        spinner.succeed(["模板下载完成，请继续进行以下操作："]);
        console.info("");
        console.info(chalk.cyan(` -  cd ${answers.name}`));
        console.info(chalk.cyan(` -  npm install`));
        let msg = "npm run dev";
        if (answers.tool === "cli3") msg = "npm run serve";
        console.info(chalk.cyan(` -  ${msg}`));
        console.info(
          chalk.green("-----------------------------------------------------")
        );
        fs.readFile(
          `${process.cwd()}/${answers.name}/package.json`,
          (err, data) => {
            if (err) throw err;
            let _data = JSON.parse(data.toString());
            _data.name = answers.name;
            _data.template = answers.template;
            let str = JSON.stringify(_data, null, 4);
            fs.writeFile(
              `${process.cwd()}/${answers.name}/package.json`,
              str,
              (err) => {
                if (err) throw err;
                process.exit();
              }
            );
          }
        );
      } else {
        // 可以输出一些项目失败的信息
        spinner.warn(["发生错误，请找黄智强"]);
        process.exit();
      }
    });
  });
}
