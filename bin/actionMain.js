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

  const openDebug = false;

  const answers = await doFunPro([prompt, {}], config, ...args);

  if (openDebug) log.warn(answers);

  if (answers) {
    if (answers.config) {
      const isNeedUpdate = ["reset", "add"].includes(answers.configType);
      if (isNeedUpdate) {
        if (answers.configType === "add") Object.assign(config, answers.config);
        else config = answers.config;
        setConfig();
      }
    }

    Object.assign(answers, { config });

    initVar(answers, args);
  } else return;

  if (openDebug) return; // 中断逻辑，用于调试

  // console.time("本次执行耗时");

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
      await runStep(todoStepList, "warn", { prefix: "todo" });
    }
  } else {
    mainSpinner.fail();
  }

  log.newLine();
  // console.timeEnd("本次执行耗时");
};
