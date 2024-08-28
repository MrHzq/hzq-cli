const Spinner = require("../../utils/spinner");
const runStep = require("../../utils/runStep");
const path = require("path");
const CmdList = require("../../bin/handleCmdList");
const { getHBSContent } = require("../../utils/common");
const { readFileSync, writeFileSync } = require("../../utils/fs");

let mainSpinner;

// 初始化变量
const initVar = () => {};

const step1 = () => {
  const list = CmdList.getListOrigin();

  const templateContent = readFileSync(
    path.join(__dirname, "./templates/readme.hbs")
  );

  const fileContent = getHBSContent(templateContent, {
    cmdList: list,
  });

  writeFileSync(
    path.join(__dirname, "../../README.md"),
    fileContent.replace(/&quot;/g, '"')
  );
};

// 主流程 - step 集合
const mainStepList = [
  {
    fun: step1,
    desc: () => "step1",
  },
];

module.exports = async (_, options) => {
  const { _description, parent } = options;

  initVar();

  mainSpinner = new Spinner(_description);

  if (mainStepList.length === 1) {
    await mainStepList[0].fun();
    return mainSpinner.succeed();
  }

  mainSpinner.start();

  const runSuccess = await runStep(mainStepList);

  if (runSuccess) {
    mainSpinner.succeed();
  } else {
    mainSpinner.fail();
  }
};
