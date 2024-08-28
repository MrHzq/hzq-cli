#! /usr/bin/env node

// 上述为 Node.js 脚本文件的行首注释，告知使用 node 来解析和执行后续的脚本内容

// 引入 commander 模块，官方使用文档：https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md
const { program } = require("commander");
const log = require("../utils/log");

const { name, version } = require("../package.json");

log.newLine();
log.success(`welcome use ${name} ~`);
log.newLine();

program.version(version);

const cmdList = require("./cmdList.json");

cmdList
  .sort((a, b) => a.cmd.localeCompare(b.cmd))
  .forEach((item) => {
    const { cmd, alias, _description } = item;
    // 定义命令与参数，类似 hzq addMsg 等等
    program
      .command(cmd)
      .alias(alias)
      .description(_description)
      .action((_, options) => {
        require(`../lib/${cmd}`)(_, options);
      });
  });

program.parse(process.argv); // 解析用户输入的命令和参数，第一个参数是要解析的字符串数组，第二个参数是解析选项
