const { prompt } = require("inquirer");

const requireRule = (value) => {
  let res = true;
  if (typeof value === "string") {
    if (!value.trim()) res = "此字段必填";
  } else if (Array.isArray(value)) {
    if (!value.length) res = "此字段必填";
  } else {
    if (!value) res = "此字段必填";
  }

  return res;
};

const notNumberRule = (value, isReq = true) => {
  if (isReq) {
    const err = requireRule(value);
    if (typeof err === "string") return err;
  }

  value = value.trim();
  if (value && !isNaN(Number(value))) return "此字段不能为数字";

  return true;
};

const isNumberRule = (value, isReq = true) => {
  if (isReq) {
    const err = requireRule(value);
    if (typeof err === "string") return err;
  }

  value = value.trim();
  if (value && isNaN(Number(value))) return "此字段只能为数字";

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
