#! /usr/bin/env node

const fs = require('fs')
const program = require('commander')
const inquirer = require('inquirer')
const download = require('download-git-repo')
const chalk = require('chalk')
const ora = require('ora')
const pkg = require('./package')

program
    .version(pkg.version)
    .option('i, init', '初始化项目')
    .parse(process.argv)
const promptList = [
    {
        type: 'input',
        message: '项目名称: ',
        name: 'name',
        default: 'project'
    },
    {
        type: 'list',
        message: '请选择项目类型： ',
        name: 'template',
        choices: [
            'cli2_base',
            'cli2_element',
            'cli2_mobile',
            'cli2_vant',
            'cli2_base_ts',
            'cli2_element_ts',
            'cli2_mobile_ts',
            'cli2_vant_ts',
            'cli3_base',
            'cli3_element',
            'cli3_mobile',
            'cli3_vant',
            'cli3_base_ts',
            'cli3_element_ts',
            'cli3_mobile_ts',
            'cli3_vant_ts',
            'nuxt_base',
            'nuxt_element',
            'nuxt_mobile',
            'nuxt_vant'
            // 'cli2_ts',
            // 'cli3_base',
            // 'cli3_ts',
            // 'cli2_base_decorator',
            // 'nuxt'
        ],
        default: 'cli2_base_pc'
    }
]
if (program.init) {
    console.info('')
    inquirer.prompt(promptList).then(answers => {
        const spinner = ora('正在下载' + answers.template + '模板').start()
        // let _download = 'MrHzq/template_' + answers.template
        let _download = 'MrHzq/' + answers.template
        download(_download, answers.name, err => {
            if (!err) {
                spinner.clear()
                console.info('')
                console.info(
                    chalk.green(
                        '-----------------------------------------------------'
                    )
                )
                console.info('')
                spinner.succeed(['项目创建成功,请继续进行以下操作:'])
                console.info('')
                console.info(chalk.cyan(` -  cd ${answers.name}`))
                console.info(chalk.cyan(` -  npm install`))
                console.info(chalk.cyan(` -  npm run dev`))
                console.info(
                    chalk.green(
                        '-----------------------------------------------------'
                    )
                )
                fs.readFile(
                    `${process.cwd()}/${answers.name}/package.json`,
                    (err, data) => {
                        if (err) throw err
                        let _data = JSON.parse(data.toString())
                        _data.name = answers.name
                        _data.template = answers.template
                        let str = JSON.stringify(_data, null, 4)
                        fs.writeFile(
                            `${process.cwd()}/${answers.name}/package.json`,
                            str,
                            err => {
                                if (err) throw err
                                process.exit()
                            }
                        )
                    }
                )
            } else {
                // 可以输出一些项目失败的信息
                spinner.warn(['发生错误，请找黄智强'])
                process.exit()
            }
        })
    })
}
