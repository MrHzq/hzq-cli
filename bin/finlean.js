#! /usr/bin/env node

const path = require('path');
const fs = require('fs');

const program = require('commander');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const chalk = require('chalk');
const ora = require('ora');
program
    .version('1.0.6')
    .option('i, init', '初始化finlean项目')
    .parse(process.argv);
const nameQuestion = {
    type: 'input',
    message: '项目名称: ',
    name: 'name',
    default: 'finlean'
};
const templateQuestion = {
    type: 'input',
    message: '项目模板(web/pc): ',
    name: 'template',
    default: 'pc'
};
if (program.init) {
    console.info('');
    inquirer.prompt([nameQuestion, templateQuestion]).then(answers => {
        const spinner = ora('正在下载模板').start();
        let _download = 'MrHzq/finlean_' + answers.template;
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
                console.info(chalk.cyan(` -  npm run dev`));
                console.info(
                    chalk.green(
                        '-----------------------------------------------------'
                    )
                );
                fs.readFile(
                    `${process.cwd()}/${answers.name}/package.json`,
                    (err, data) => {
                        if (err) throw err;
                        let _data = JSON.parse(data.toString());
                        _data.name = answers.name;
                        _data.template = answers.template;
                        // _data.port = answers.port;
                        // _data.template = answers.template ? 'pug' : 'html';
                        // _data.rem = answers.rem;
                        let str = JSON.stringify(_data, null, 4);
                        fs.writeFile(
                            `${process.cwd()}/${answers.name}/package.json`,
                            str,
                            err => {
                                if (err) throw err;
                                process.exit();
                            }
                        );
                    }
                );
            } else {
                // 可以输出一些项目失败的信息
                spinner.warn(['发生错误，请找黄智强']);
                process.exit();
            }
        });
    });
}
