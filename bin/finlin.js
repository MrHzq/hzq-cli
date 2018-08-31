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
    .option('i, init', '初始化finlin项目')
    .parse(process.argv);
const nameQuestion = {
    type: 'input',
    message: `项目名称: `,
    name: 'name',
    default: 'finlin'
};
const versionQuestion = {
    type: 'input',
    message: `初始版本: `,
    name: 'version',
    default: '0.0.1'
};
if (program.init) {
    console.info('');
    inquirer.prompt([nameQuestion, versionQuestion]).then(function(answers) {
        const spinner = ora('正在从github下载fl').start();
        download('MrHzq/fl', answers.name, function(err) {
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
                console.info(chalk.cyan(` -  npm install / yarn`));
                console.info(chalk.cyan(` -  npm start / npm run dev`));
            } else {
                // 可以输出一些项目失败的信息
            }
        });
    });
}
