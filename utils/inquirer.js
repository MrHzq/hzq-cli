const { prompt } = require("inquirer");

const requireRule = (value) => {
  value = value.trim();
  if (!value) return "此字段必填";
  return true;
};

const notNumberRule = (value, isReq = true) => {
  if (isReq) {
    const err = requireRule(value);
    if (typeof err === "string") return err;
  }

  value = value.trim();
  if (!isNaN(Number(value))) return "此字段不能为数字";

  return true;
};

const isNumberRule = (value, isReq = true) => {
  if (isReq) {
    const err = requireRule(value);
    if (typeof err === "string") return err;
  }

  value = value.trim();
  if (isNaN(Number(value))) return "此字段只能为数字";

  return true;
};

const tfList = (isReverse = false) => {
  const list = [
    { name: "否", value: false },
    { name: "是", value: true },
  ];

  return isReverse ? list.reverse() : list;
};

module.exports = {
  prompt,
  requireRule,
  notNumberRule,
  isNumberRule,
  tfList,
};
