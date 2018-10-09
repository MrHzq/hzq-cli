#! /usr/bin/env node

const fs = require('fs');
const program = require('commander');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const chalk = require('chalk');
const ora = require('ora');
program
    .version('2.0.1')
    .option('i, init', '初始化finlean项目')
    .parse(process.argv);
const promptList = [
    {
        type: 'input',
        message: '项目名称: ',
        name: 'name',
        default: 'finlean'
    },
    {
        type: 'list',
        message: '请选择项目模板: ',
        name: 'template',
        choices: ['base', 'pc', 'web'],
        default: 'base'
    }
];
if (program.init) {
    console.info('');
    inquirer.prompt(promptList).then(answers => {
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
