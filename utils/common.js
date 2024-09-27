const { default: axios } = require("axios");
const dayjs = require("dayjs");
const Handlebars = require("handlebars");
const { succeed } = require("./log");

const toHBSTemp = (temp) => Handlebars.compile(temp);
const getHBSContent = (temp, config) => toHBSTemp(temp)(config);

// 获取当前时间戳
const getTime = () => new Date().getTime() / 1000;

// 格式化当前时间
const formatTime = (format = "YYYY-MM-DD HH:mm:ss") => dayjs().format(format);

// 格式化传入时间
const formatTimeBy = (time, format = "YYYY-MM-DD HH:mm:ss") =>
  dayjs(time).format(format);

// 秒转为 00:00:00
const formatScend = (scend) => {
  scend = Number(scend);
  // 转为小时:分钟:秒
  const hours = Math.floor(scend / 3600);
  const minutes = Math.floor((scend % 3600) / 60);
  const seconds = Math.floor(scend % 60);
  // 补零
  const hoursStr = hours.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toString().padStart(2, "0");
  return `${hoursStr}:${minutesStr}:${secondsStr}`;
};

// 将字节转为 kb、mb
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
const isFullWord = (content, target) => {
  const regex = new RegExp(`\\b${target}\\b`); // 创建正则表达式对象，^表示匹配字符串的开头，$表示匹配字符串的结尾，从而实现完全匹配
  return regex.test(content); // 使用 test 方法进行正则匹配
};

// 检查某个依赖是否被使用了
const checkDependencyUsed = (dependency, fileContent) => {
  const regexStaticImport = new RegExp(
    `require\\(['"\`]${dependency}['"\`]|from ['"\`]${dependency}['"\`]`,
    "i"
  );
  const regexDynamicImport = new RegExp(
    `import\\(['"\`]${dependency}['"\`]\\)`,
    "i"
  );

  return [
    regexStaticImport.test(fileContent),
    regexDynamicImport.test(fileContent),
  ].some(Boolean);
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

const doProFun = async (obj, ...args) => {
  obj = Array.isArray(obj) ? obj : [obj];
  const [fun] = obj;

  let res = fun;

  if (typeof fun === "function") res = await fun(...args);
  else if (obj.length > 1) res = obj[1];

  return res;
};

// 常用的空值
const getEmptyValue = (otherEmptyList = []) => [
  undefined,
  null,
  "",
  " ",
  ...otherEmptyList,
];

// 删除对象中的空值
const removeEmpty = (obj, otherEmptyList = []) => {
  Object.keys(obj).forEach((key) => {
    if (getEmptyValue(otherEmptyList).includes(obj[key])) {
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
      origin: item,
    };
  });
};

// 是否为空值
const isEmptyVal = (val) => {
  if (val) {
    if (typeof val === "object") return Object.keys(val).length === 0;
    else if (Array.isArray(val)) return val.length === 0;
    else return false;
  } else return true;
};

// 是否为数字
const isNumber = (val) => !isNaN(Number(val));

// 获取已过滤过的 list
const getFilterList = (
  list = [],
  { filterValue, notFilterValue, filterType, notFilterType }
) => {
  const getFlag = (item, obj, type) => {
    let flag = true;

    const objList = Object.entries(obj);

    if (objList.length) {
      flag = objList.some(([key, value]) => {
        const itemValue = item[key]?.toLocaleLowerCase();

        const objValue = value?.toLocaleLowerCase();

        if (itemValue && objValue) {
          if (type === "eq") return objValue === itemValue;
          else return itemValue.includes(objValue); // 模糊匹配
        } else return false;
      });
    }
    return flag;
  };

  const filterObj = removeEmpty(Object.assign({}, filterValue || {}));
  const notFilterObj = removeEmpty(Object.assign({}, notFilterValue || {}));

  if (isEmptyVal(filterObj) && isEmptyVal(notFilterObj)) return list;

  return list.filter((item) => {
    let flag = true;

    if (flag) flag = getFlag(item, filterObj, filterType);

    if (flag) flag = !getFlag(item, notFilterObj, notFilterType);

    return flag;
  });
};

// 睡眠
const sleep = (time = 1000) => {
  if (time < 1000) time *= 1000;
  return new Promise((r) => setTimeout(r, time));
};

// 生成随机字符串
const getRandomStr = (len = 8) => Math.random().toString(36).substring(2, len);

// 创建长度为 n 的空字符串
const spaceStr = (length) => new Array(length).join(" ");

// 使用 \n split 字符串
const splitBy = (string, sp = "\n") => string.split(sp).filter(Boolean);

// 使用 \n join 数组
const joinBy = (list, sp = "\n") => list.filter(Boolean).join(sp);

// 使用文件名正序
const sortBy = (list, key) => {
  return list.sort((a, b) =>
    (key ? a[key] : a).localeCompare(key ? b[key] : b)
  );
};
// 判断数组里面的值是否 includes 关键值
const someIncludes = (list, value, key) => {
  return list.some((i) => ((key ? i[key] : i) ?? "").includes(value));
};

const toPromise = (fn, resolveRes, rejectRes) => {
  return new Promise(async (resolve) => {
    const runResolve = (res) => {
      if (isEmptyVal(res)) res = { res: "" || resolveRes };
      else if (typeof res !== "object") res = { res: res || resolveRes };
      sleep().then(() => resolve({ success: true, ...res }));
    };

    const runReject = (error) => {
      console.log("[ toPromise error ] >", error?.message);
      resolve({ success: false, error, res: rejectRes });
    };

    try {
      doProFun(fn, runResolve, runReject);
    } catch (error) {
      runReject(error);
    }
  });
};

// 获取对象的值，key 可为 xx.yy.zz
const getValueByPath = (obj, path) => {
  const keys = path.split(".");

  let value = obj;
  for (const key of keys) {
    if (value) value = value[key];
    else return undefined;
  }

  return value;
};

const isChinese = (str) => {
  const chineseRegex = /[\u4e00-\u9fa5]/;
  for (let char of str) if (chineseRegex.test(char)) return true;
  return false;
};

const stringArrayReplaceAll = (l, k = "\n", r = "") => {
  return l.map((i) => i.replaceAll(k, r));
};

const testIp = async (ip, testUrl = "https://tieba.baidu.com/") =>
  toPromise(async (resolve, reject) => {
    axios
      .get(testUrl, {
        proxy: {
          host: ip.split(":")[0],
          port: ip.split(":")[1],
        },
        timeout: 5000,
      })
      .then((res) => {
        if (res.status === 200 || res.status === 302) {
          resolve({ res });
        } else reject({ res });
      })
      .catch(reject);
  });

module.exports = {
  toHBSTemp,
  getHBSContent,
  getTime,
  formatTime,
  formatTimeBy,
  formatScend,
  bitTransform,
  getAllYears,
  isFullWord,
  checkDependencyUsed,
  camelToHyphen,
  firstUpperCase,
  firstLowerCase,
  getAlias,
  getAliasHyphen,
  doFun,
  doProFun,
  getEmptyValue,
  removeEmpty,
  formatCmdList,
  isEmptyVal,
  isNumber,
  getFilterList,
  sleep,
  getRandomStr,
  spaceStr,
  splitBy,
  joinBy,
  sortBy,
  someIncludes,
  toPromise,
  getValueByPath,
  isChinese,
  stringArrayReplaceAll,
  testIp,
};
