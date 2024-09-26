const { firstUpperCase, doFun, doProFun, sleep } = require("./common");
const log = require("./log");
const Spinner = require("./spinner");

// 统一的运行流程方法
module.exports = async (stepList, globalFailType = "fail", config = {}) => {
  let finalType = globalFailType; // fail | warn
  let everySuccess = false;

  const stepListLen = stepList.length;

  for (let index = 0; index < stepListLen; index++) {
    const item = stepList[index];
    const { fun, desc, ignore, delay = 0 } = item;

    await sleep(delay * 1000); // 延迟执行时间

    if (doFun(ignore)) continue;

    if (item.failType) finalType = item.failType;

    const stepSpinner = new Spinner(
      (config.hideIndex ? "" : index + 1 + ". ") + doFun(desc)
    );

    let funRes = await doProFun([fun, {}], config);

    // 表明无错误，则是走【成功】逻辑
    if ([undefined, null, "", " "].includes(funRes)) funRes = { success: true };
    else if (typeof funRes === "string") {
      funRes = {
        success: false,
        tip: funRes,
      };
    }

    const { success, tip, stop } = funRes;

    if (funRes.failType) finalType = funRes.failType;

    if (success) {
      everySuccess = true;

      if (stepListLen > 1) stepSpinner.succeed("", config.prefix);

      if (tip) log.succeed(tip, true);

      doFun(funRes.onSuccess, item, funRes);
      doFun(config.onSuccessStep, item, funRes);
    } else {
      stepSpinner[finalType]("", config.prefix);

      everySuccess = finalType === "warn";

      if (tip) log[finalType](tip, true);

      const funKey = `on${firstUpperCase(finalType)}`;
      doFun(funRes[funKey], item, funRes);
      doFun(config[funKey + "Step"], item, funRes);

      if (finalType === "fail") break;
    }

    if (stop) {
      log.fail("主动停止");
      break;
    }
  }

  return everySuccess;
};
