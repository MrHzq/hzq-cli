const dayjs = require("dayjs");
const Handlebars = require("handlebars");

const toHBSTemp = (temp) => Handlebars.compile(temp);
const getHBSContent = (temp, config) => toHBSTemp(temp)(config);

// 格式化当前时间
const formatTime = (format = "YYYY-MM-DD HH:mm:ss") => dayjs().format(format);

// 格式化传入时间
const formatTimeBy = (time, format = "YYYY-MM-DD HH:mm:ss") =>
  dayjs(time).format(format);

const bitTransform = (bit) => {
  bit = Number(bit);
  if (isNaN(bit)) bit = 0;

  const kb = (bit / 1024).toFixed(4);
  const mb = (kb / 1024).toFixed(4);
  return { bit, kb, kbs: `${kb} KB`, mb, mbs: `${mb} MB` };
};

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
  if (result.length === 1) result = "";
  return result;
};

// 获取 横向命名的 简称：add-page->ap
const getAliasHyphen = (str) => {
  let result = "";
  str.split("-").forEach((item) => (result += item[0]));
  return result;
};

const doFun = (obj, ...args) => {
  obj = Array.isArray(obj) ? obj : [obj];
  const [fun] = obj;

  let res = fun;

  if (typeof fun === "function") res = fun(...args);
  else if (obj.length > 1) res = obj[1];

  return res;
};

const doFunPro = async (obj, ...args) => {
  obj = Array.isArray(obj) ? obj : [obj];
  const [fun] = obj;

  let res = fun;

  if (typeof fun === "function") res = await fun(...args);
  else if (obj.length > 1) res = obj[1];

  return res;
};

// 删除对象中的空值
const removeEmpty = (obj, otherEmptyAdjustList = []) => {
  Object.keys(obj).forEach((key) => {
    if ([null, undefined, "", ...otherEmptyAdjustList].includes(obj[key])) {
      delete obj[key];
    }
  });
  return obj;
};

// 格式化 cmdList 数据，用于 inquire 库
const formatCmdList = (list) => {
  return list.map((item) => {
    const { cmd, _description, alias } = item;
    return {
      name: `${cmd}: ${_description} ${alias ? `(${alias})` : ""}`,
      value: cmd,
    };
  });
};

// 获取已过滤过的 list
const getFilterList = (list, filterValue, filterType = "") => {
  const filterObj = removeEmpty(Object.assign({}, filterValue || {}));

  return (list || []).filter((item) => {
    const keys = Object.keys(filterObj);
    if (!keys.length) return true;

    return keys.some((key) => {
      const isEq = filterObj[key] === item[key];
      return filterType === "eq" ? isEq : !isEq;
    });
  });
};

module.exports = {
  toHBSTemp,
  getHBSContent,
  formatTime,
  formatTimeBy,
  bitTransform,
  getAllYears,
  isExistByRegTest,
  camelToHyphen,
  firstUpperCase,
  firstLowerCase,
  getAlias,
  getAliasHyphen,
  doFun,
  doFunPro,
  removeEmpty,
  formatCmdList,
  getFilterList,
};
