const { prompt, notNumberRule, requireRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const { getDirName, getCmdName } = require("../../utils/path");
const ExcelJS = require("exceljs");
const { writeFileSync } = require("../../utils/fs");
const path = require("path");
const { awaitList, addUpperCase } = require("../../utils/common");
const { getWebInfo } = require("../../plugins/cheerio");
const { getFileList } = require("../../utils/fs");
const Spinner = require("../../utils/spinner");

module.exports = async (_, options = {}) => {
  const {
    _name = getDirName(__dirname),
    _cmdName = getCmdName(),
    _description,
  } = options;

  let cliName, config, configType;

  let excelPath, worksheetName, headers, rows, headerRowJson;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    excelPath = answers.excelPath;
    worksheetName = ""; // sheet name
    headers = []; // 表格头数组
    rows = []; // 表格行数组
    headerRowJson = []; // 表格数据 JSON: [{ headers[0]: rows[0] }]
  };

  // 读取表格
  const readExcelFile = async () => {
    try {
      const workbook = new ExcelJS.Workbook();

      await workbook.xlsx.readFile(excelPath);

      const worksheet = workbook.getWorksheet(1); // 获取第一个工作表

      worksheetName = worksheet.name;

      // 遍历表头
      headers = worksheet.getRow(1).values;

      // 遍历数据行
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // 跳过表头行
          const rowData = row.values;
          if (rowData[1]) {
            rows.push(rowData);
            const rowObj = {};
            headers.forEach((h, index) => (rowObj[h] = rowData[index]));
            headerRowJson.push(rowObj);
          }
        }
      });
    } catch (err) {
      console.error(`读取 Excel 文件时发生错误: ${err}`);
    }
  };

  // 自定义处理逻辑
  const customHandle = async () => {
    // console.log("worksheetName", worksheetName);
    // console.log("headers", headers);
    // console.log("rows", rows);
    console.log("headerRowJson", headerRowJson);

    // ---------------------- 以下是 自定义 逻辑 - code start ----------------------
    const categories = []; // 分类数据
    const websites = []; // 网址数据

    // 网站数据
    await awaitList(
      headerRowJson,
      async (row) => {
        const category_name = row["分类"];
        let category_id = "";
        let category_icon_url = "";

        category_name.split("/").forEach((nameItem) => {
          const findItem = categories.find(({ name }) => nameItem === name);

          if (findItem) category_id = findItem.id;
          else {
            category_id = categories.length + 1;
            category_icon_url = "toolbox";

            categories.push({
              name: nameItem,
              id: category_id,
              icon_url: category_icon_url,
            });
          }
        });

        const webSiteItem = {
          name: row["名称"],
          url: row["网址"].hyperlink,
          description: row["作用"],
          category_id,
          category_name,
          icon_url: "",
        };

        const { success, res } = await getWebInfo(webSiteItem.url);

        if (success) Object.assign(webSiteItem, res);

        websites.push(webSiteItem);
      },
      1000
    );

    console.log('[ websites ] >', websites)

    // const savePath = process.env.handleExcelSavePath;

    // if (savePath) {
    //   const r = { categories, websites };
    //   Object.keys(r).forEach((key) => {
    //     writeFileSync(
    //       path.resolve(savePath, `${key}.json`),
    //       JSON.stringify(r[key], null, 2)
    //     );
    //   });
    // }
    // ---------------------- 以上是 自定义 逻辑 - code end ------------------------
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: readExcelFile,
      desc: () => "读取表格",
    },
    {
      fun: customHandle,
      desc: () => "自定义处理",
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => "todo...",
    // },
  ];

  return {
    // 第一个 _config 为配置项
    async prompt(_config, ...args) {
      const promptList = [
        //...configPromptList
      ];

      let [arg] = args;

      const needList = arg === "ls";

      if (needList) arg = "";

      let answers = {};

      let firstPrompt = {
        type: "input",
        name: "excelPath",
        message: "请输入表格路径:",
        validate: notNumberRule,
      };

      if (arg) {
        answers.excelPath = arg;
      } else {
        const defaultFilterList = addUpperCase([".xlsx"]);
        const defaultIgnoreList = [];

        const choices = getFileList(
          defaultFilterList.join("||"),
          defaultIgnoreList.join("||"),
          "-mtimeMs"
        );

        if (needList && choices.length) {
          promptList.push({
            type: "list",
            name: "excelPath",
            message: `请选择文件(共有 ${choices.length} 个):`,
            choices,
            validate: requireRule,
          });
        } else promptList.push(firstPrompt);

        answers = await prompt(promptList);
      }

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
