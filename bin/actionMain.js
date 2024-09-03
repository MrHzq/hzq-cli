const path = require("path");
const log = require("../utils/log");
const Spinner = require("../utils/spinner");
const runStep = require("../utils/runStep");
const { doFunPro } = require("../utils/common");
const { readConfig, writeConfig } = require("../config/handler");

let mainSpinner;

let config, currCmdConfigKey;

// 获取当前所需配置
const getConfig = () => {
  const allConfig = readConfig() || {};
  config = allConfig[currCmdConfigKey] || {};
};

// 设置当前所得配置
const setConfig = () => {
  const allConfig = readConfig() || {};
  writeConfig({ ...allConfig, [currCmdConfigKey]: config });
};

module.exports = async (_, options) => {
  let { _name, cmd, _description, args = [], parentCmd = "" } = options;

  currCmdConfigKey = cmd || _name;

  const {
    prompt,
    initVar,
    mainStepList = [],
    onSuccessStep,
    onBeforeTodo,
    onStartTodo,
    todoStepList = [],
  } = await require(path.join(
    __dirname,
    "../lib",
    parentCmd,
    currCmdConfigKey
  ))(_, options);

  getConfig();

  const answers = await doFunPro([prompt, {}], ...args, config);

  if (answers) {
    if (answers.config) {
      Object.assign(config, answers.config);
      setConfig();
    }

    Object.assign(answers, { config });

    initVar(answers, args);
  } else return;

  mainSpinner = new Spinner(_description);

  if (mainStepList.length > 1) mainSpinner.start();

  const runSuccess = await runStep(mainStepList, "fail", {
    mainSpinner,
    onSuccessStep,
  });

  if (runSuccess) {
    mainSpinner.succeed();

    const continueTodo = await doFunPro([onBeforeTodo, true]);

    if (continueTodo && todoStepList?.length) {
      await doFunPro([onStartTodo, true]);
      log.warn("next todo", true);
      runStep(todoStepList, "warn", { prefix: "todo" });
    }
  } else {
    mainSpinner.fail();
  }
};
