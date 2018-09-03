#! /usr/bin/env node

const path = require('path');
const fs = require('fs');

const program = require('commander');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const chalk = require('chalk');
const ora = require('ora');
program
    .version('0.1.0')
    .option('i, init', '初始化finlean项目')
    .parse(process.argv);
const nameQuestion = {
    type: 'input',
    message: '项目名称: ',
    name: 'name',
    default: 'finlean'
};
const versionQuestion = {
    type: 'input',
    message: '项目版本(web/pc): ',
    name: 'version',
    default: 'pc'
};
if (program.init) {
    console.info('');
    inquirer.prompt([nameQuestion, versionQuestion]).then(answers => {
        const spinner = ora('正在下载模板').start();
        let _download = 'MrHzq/finlean_' + answers.version;
        download(_download, answers.name, err => {
            if (!err) {
                spinner.clear();
                console.info('');
                console.info(
                    chalk.green(
                        '-----------------------------------------------------'
                    )
                );
                console.info('');
                spinner.succeed(['项目创建成功,请继续进行以下操作:']);
                console.info('');
                console.info(chalk.cyan(` -  cd ${answers.name}`));
                console.info(chalk.cyan(` -  npm install`));
                console.info(chalk.cyan(` -  npm start / npm run dev`));
            } else {
                spinner.succeed(['项目创建失败,请重新创建']);
                console.info('项目创建失败,请重新创建');
                // 可以输出一些项目失败的信息
            }
        });
    });
}
