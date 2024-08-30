const { firstUpperCase, doFun, doFunPro } = require("./common");
const log = require("./log");
const Spinner = require("./spinner");

// 统一的运行流程方法
module.exports = async (stepList, globalFailType = "fail", config = {}) => {
  let finalType = globalFailType; // fail | warn
  let everySuccess = false;

  const stepListLen = stepList.length;

  for (let index = 0; index < stepListLen; index++) {
    const item = stepList[index];
    const { fun, desc, ignore } = item;

    if (doFun(ignore)) continue;

    if (item.failType) finalType = item.failType;

    const stepSpinner = new Spinner(
      (config.hideIndex ? "" : index + 1 + ". ") + doFun(desc)
    );

    let funRes = await doFunPro([fun, {}]);

    // 表明无错误，则是走【成功】逻辑
    if ([undefined, null].includes(funRes)) funRes = { success: true };
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

      stepSpinner.succeed("", config.prefix);

      if (tip) log.succeed(tip, true);

      doFun(funRes.onSuccess, item, funRes);
    } else {
      stepSpinner[finalType]("", config.prefix);

      everySuccess = finalType === "warn";

      if (tip) log[finalType](tip, true);

      doFun(funRes[`on${firstUpperCase(finalType)}`], item, funRes);

      if (finalType === "fail") break;
    }

    if (stop) {
      log.fail("主动停止");
      break;
    }
  }

  return everySuccess;
};
