const log = require("../utils/log");
const Spinner = require("../utils/spinner");
const runStep = require("../utils/runStep");
const { doFunPro } = require("../utils/common");
const { readConfig, writeConfig } = require("../config/handler");

let mainSpinner;

let config, configKey;

// 获取当前所需配置
const getConfig = () => {
  const allConfig = readConfig() || {};
  config = allConfig[configKey] || {};
};

// 设置当前所得配置
const setConfig = () => {
  const allConfig = readConfig() || {};
  writeConfig({ ...allConfig, [configKey]: config });
};

module.exports = async (_, options) => {
  let { _name, cmd, _description, args = [] } = options;

  configKey = cmd || _name;

  const {
    prompt,
    initVar,
    mainStepList = [],
    todoStepList = [],
  } = await require(`../lib/${configKey}`)(_, options);

  getConfig();

  const answers = await doFunPro([prompt, {}], ...args, config);

  if (answers) {
    if (answers.config) {
      Object.assign(config, answers.config);
      setConfig();
    }

    Object.assign(answers, { config });

    initVar(answers);
  }

  mainSpinner = new Spinner(_description);

  if (mainStepList.length > 1) mainSpinner.start();

  const runSuccess = await runStep(mainStepList, "fail", { mainSpinner });

  if (runSuccess) {
    mainSpinner.succeed();

    if (todoStepList?.length) {
      log.warn("next todo", true);
      runStep(todoStepList, "warn", { prefix: "todo" });
    }
  } else {
    mainSpinner.fail();
  }
};
