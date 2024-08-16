const { prompt } = require("inquirer");

const requireRule = (value) => {
  value = value.trim();
  if (!value) return "此字段必填";
  return true;
};

const numberRule = (value) => {
  const err = requireRule(value);
  if (typeof err === "string") return err;

  value = value.trim();
  if (!isNaN(Number(value))) return "此字段不能为数字";

  return true;
};

module.exports = {
  prompt,
  requireRule,
  numberRule,
};
