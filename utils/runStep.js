const { firstUpperCase } = require("./common");
const Spinner = require("./spinner");

// 统一的运行流程方法
module.export = async (list, globalFailType = "fail", config = {}) => {
  let everySuccess = false;

  for (let index = 0; index < list.length; index++) {
    const item = list[index];
    const { fun, desc, ignore, failType } = item;

    if (ignore) continue;

    const finalDesc = typeof desc === "function" ? desc() : desc;

    const stepSpinner = new Spinner(
      (config.hideIndex ? "" : index + 1 + "、") + finalDesc
    );

    let funRes = typeof fun === "function" ? await fun() : {};

    // 表明无错误，则是走【成功】逻辑
    if (funRes === undefined) funRes = { success: true };

    const { success, tip } = funRes;

    if (success) {
      everySuccess = true;

      stepSpinner.succeed(tip);

      if (typeof config.onSuccess === "function") {
        config.onSuccess(item, funRes);
      }
    } else {
      everySuccess = failType === "warn";

      stepSpinner[failType]();
      if (tip) log.error(tip);

      const finalType = failType || globalFailType;

      const cb = config[`on${firstUpperCase(finalType)}`];

      if (typeof cb === "function") cb(item, funRes);

      if (finalType === "fail") break;
    }
  }

  return everySuccess;
};
