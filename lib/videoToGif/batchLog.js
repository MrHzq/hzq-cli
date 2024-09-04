const log = require("../../utils/log");

module.exports = {
  batchLog: (totalList, successList, failList) => {
    const totalLen = totalList.length;
    const totalTip = `总共 ${totalLen} 个`;

    const successLen = successList.length;
    const successTip = `成功 ${successLen} 个`;

    const failLen = failList ? failList.length : totalLen - successLen;
    const failTip = `失败 ${failLen} 个`;

    const successRate = `成功率：${((100 * successLen) / totalLen).toFixed(
      2
    )}%`;

    return [
      totalTip,
      successLen ? log.successText(successTip) : log.warnText(successTip),
      failLen ? log.errorText(failTip) : "",
      successRate,
    ]
      .filter(Boolean)
      .join("，");
  },
};
