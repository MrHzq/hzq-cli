const { isExistByRegTest } = require("./common");
const { readFileSync, writeFileSync } = require("./fs");

const twoSpaceString = `  `; // 2 个开始空格
const enterString = `\n`; // 换行符
const newLine = enterString + twoSpaceString; // 新的一行

// 对内容的处理：分割 + 拼接
const splitAndJoin = (p, sp, getAddContent) => {
  const content = readFileSync(p);

  if (content) {
    const splitList = content.split(sp);

    if (splitList.length) {
      const { error, addContent, addToBefore } = getAddContent(content);

      if (addContent) {
        if (addToBefore) splitList[0] += addContent;
        else splitList[1] = addContent + splitList[1];

        writeFileSync(p, splitList.join(sp));
      } else return error;
    } else return `未找到匹配的 ${sp} 部分`;
  } else return `${p} 的内容为空`;
};

// 往 TS 文件内容新增 enum 值
const addValueToEnum = (p, enumName, valueList, addContent) => {
  const content = readFileSync(p);

  if (content) {
    // 正则表达式匹配 export enum XX {...} 部分
    const enumRegex = new RegExp(
      `export\\s+enum\\s+${enumName}\\s*{([^}]*)}`,
      ""
    );

    const match = content.match(enumRegex);

    if (match) {
      const enumContent = match[1];

      const hasExistList = [];

      const [key, value, comment] = valueList;

      const keyExist = isExistByRegTest(enumContent, key);
      const valueExist = isExistByRegTest(enumContent, value);

      if (keyExist) hasExistList.push(`key：${key} 重复`);
      if (valueExist) hasExistList.push(`value：${value} 重复`);

      if (hasExistList.length) return hasExistList.join(enterString);

      const addEnumContent =
        addContent || `,${newLine}${key} = ${value} // ${comment}${enterString}`;

      const newEnumContent = enumContent + addEnumContent;

      const newContent = content.replace(
        match[0],
        `export enum ${enumName} {${newEnumContent}}`
      );

      writeFileSync(p, newContent);
    } else return `未找到匹配的 export enum ${enumName} {...} 部分`;
  } else return `${p} 的内容为空`;
};

// 往 TS 文件内容新增 type 值
const addValueToType = (p, typeName, typeKey) => {
  return splitAndJoin(p, `export type ${typeName} =`, (content) => {
    if (isExistByRegTest(content, typeKey)) {
      return { error: `${typeKey} 重复` };
    }

    return { addContent: newLine + `| ` + typeKey };
  });
};

module.exports = {
  enterString,
  splitAndJoin,
  addValueToEnum,
  addValueToType,
};
