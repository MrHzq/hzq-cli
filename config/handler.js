const path = require("path");
const { readFileSync, writeFileSync } = require("../utils/fs");

const fileName = "global.json";

// 读取配置
const readConfig = () => {
  const configPath = path.join(__dirname, fileName);
  try {
    const configData = JSON.parse(readFileSync(configPath));
    return configData;
  } catch (err) {
    return null;
  }
};

// 写入配置
const writeConfig = (config) => {
  const configPath = path.join(__dirname, fileName);
  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (err) {
    console.error(`写入配置文件时出错: ${err.message}`);
  }
};

module.exports = {
  readConfig,
  writeConfig,
};
