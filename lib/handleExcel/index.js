const { prompt, notNumberRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const { getDirName, getCmdName } = require("../../utils/path");
const ExcelJS = require("exceljs");
const { writeFileSync } = require("../../utils/fs");
const path = require("path");

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

  const customHandle = async () => {
    // console.log("worksheetName", worksheetName);
    // console.log("headers", headers);
    // console.log("rows", rows);
    // console.log("headerRowJson", headerRowJson);

    // do anything

    const categories = [];

    const websites = headerRowJson.map((item) => {
      const category_name = item["分类"];
      let category_id = "";
      let category_icon_url = "";

      category_name.split("/").forEach((n) => {
        const findItem = categories.find(({ name }) => n === name);

        if (findItem) category_id = findItem.id;
        else {
          category_id = categories.length + 1;
          category_icon_url = "toolbox";

          categories.push({
            name: n,
            id: category_id,
            icon_url: category_icon_url,
          });
        }
      });

      const rItem = {
        name: item["名称"],
        url: item["网址"].text,
        description: item["作用"],
        category_id,
        category_name,
      };

      return rItem;
    });

    const movePath =
      "/Users/hzq/code/github/ThinNav/frontend/navigation/src/api/localData";

    const r = { categories, websites };
    Object.keys(r).forEach((key) => {
      writeFileSync(
        path.resolve(movePath, `${key}.json`),
        JSON.stringify(r[key], null, 2)
      );
    });
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
      const [arg] = args;

      //

      let answers = {};

      if (arg) {
        answers.excelPath = arg;
      } else {
        answers = await prompt([
          {
            type: "input",
            name: "excelPath",
            message: "请输入表格路径:",
            validate: notNumberRule,
          },
        ]);
      }

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
