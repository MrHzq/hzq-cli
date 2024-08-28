const { firstUpperCase } = require("./common");
const log = require("./log");
const Spinner = require("./spinner");

// 统一的运行流程方法
module.exports = async (stepList, globalFailType = "fail", config = {}) => {
  // fail | warn
  let finalType = globalFailType;
  let everySuccess = false;

  const stepListLen = stepList.length;

  for (let index = 0; index < stepListLen; index++) {
    const item = stepList[index];
    const { fun, desc, ignore } = item;

    if (item.failType) finalType = item.failType;

    if (ignore) continue;

    const finalDesc = typeof desc === "function" ? desc() : desc;

    const stepSpinner = new Spinner(
      (config.hideIndex ? "" : index + 1 + ". ") + finalDesc
    );

    let funRes = typeof fun === "function" ? await fun() : {};

    // 表明无错误，则是走【成功】逻辑
    if (funRes === undefined) funRes = { success: true };
    else if (typeof funRes === "string") {
      funRes = {
        success: false,
        tip: funRes,
      };
    }

    const { success, tip = "", stop } = funRes;

    if (funRes.failType) finalType = funRes.failType;

    if (success) {
      everySuccess = true;

      stepSpinner.succeed("", config.prefix);

      if (tip) {
        log.newLine();
        log.succeed(tip);
      }

      if (typeof funRes.onSuccess === "function") {
        funRes.onSuccess(item, funRes);
      }
    } else {
      stepSpinner[finalType]("", config.prefix);

      everySuccess = finalType === "warn";

      if (tip) {
        log.newLine();
        log[finalType](tip);
      }

      const cb = funRes[`on${firstUpperCase(finalType)}`];

      if (typeof cb === "function") cb(item, funRes);

      if (finalType === "fail") break;
    }

    if (stop) {
      log.fail("主动停止");
      break;
    }
  }

  return everySuccess;
};
