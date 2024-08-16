const dayjs = require("dayjs");
const Handlebars = require("handlebars");

exports.toHBSTemp = (temp) => Handlebars.compile(temp);
exports.getHBSContent = (temp, config) => toHBSTemp(temp)(config);

// 格式化时间
exports.formatTime = (format = "YYYY-MM-DD HH:mm:ss") => dayjs().format(format);

// 全字匹配，判断是否存在
exports.isExistByRegTest = (content, target) => {
  const regex = new RegExp(`\\b${target}\\b`); // 创建正则表达式对象，^表示匹配字符串的开头，$表示匹配字符串的结尾，从而实现完全匹配
  return regex.test(content); // 使用 test 方法进行正则匹配
};

// 将驼峰命名转换为横线连接
exports.camelToHyphen = (str) => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

// 首字母大写
exports.firstUpperCase = (word) => word[0].toLocaleUpperCase() + word.slice(1);

// 首字母小写
exports.firstLowerCase = (word) => word[0].toLocaleLowerCase() + word.slice(1);

// 获取 驼峰命名的 简称：addPage->ap
exports.getAlias = (str) => {
  let result = str[0];
  for (let char of str) {
    if (/[A-Z]/.test(char)) result += char.toLowerCase();
  }
  return result;
};
