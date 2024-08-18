const dayjs = require("dayjs");
const Handlebars = require("handlebars");

const toHBSTemp = (temp) => Handlebars.compile(temp);
const getHBSContent = (temp, config) => toHBSTemp(temp)(config);

// 格式化时间
const formatTime = (format = "YYYY-MM-DD HH:mm:ss") => dayjs().format(format);

// 获取[开始年份到今年]的所有年数据
const getAllYears = (startYear = 2017) => {
  let currentYear = dayjs().year();
  let years = [];

  for (let year = startYear; year <= currentYear; year++) {
    years.push(year);
  }

  return years;
};

// 全字匹配，判断是否存在
const isExistByRegTest = (content, target) => {
  const regex = new RegExp(`\\b${target}\\b`); // 创建正则表达式对象，^表示匹配字符串的开头，$表示匹配字符串的结尾，从而实现完全匹配
  return regex.test(content); // 使用 test 方法进行正则匹配
};

// 将驼峰命名转换为横线连接
const camelToHyphen = (str) => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

// 首字母大写
const firstUpperCase = (word) => word[0].toLocaleUpperCase() + word.slice(1);

// 首字母小写
const firstLowerCase = (word) => word[0].toLocaleLowerCase() + word.slice(1);

// 获取 驼峰命名的 简称：addPage->ap
const getAlias = (str) => {
  let result = str[0];
  for (let char of str) {
    if (/[A-Z]/.test(char)) result += char.toLowerCase();
  }
  return result;
};

// 获取 横向命名的 简称：add-page->ap
const getAliasHyphen = (str) => {
  let result = "";
  str.split("-").forEach((item) => (result += item[0]));
  return result;
};

module.exports = {
  toHBSTemp,
  getHBSContent,
  formatTime,
  getAllYears,
  isExistByRegTest,
  camelToHyphen,
  firstUpperCase,
  firstLowerCase,
  getAlias,
  getAliasHyphen,
};
