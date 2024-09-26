const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const { sleep } = require("../../utils/common");
const log = require("../../utils/log");
const { removeSync, writeFileSync } = require("../../utils/fs");

const ipFilePath = path.resolve(__dirname, "./ip.txt");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
};

// 爬取建立免费代理IP池的脚本
async function get89IP(filePath, page = 5) {
  for (let i = 1; i <= page; i++) {
    // 循环采集前X页的数据
    const url = `https://www.89ip.cn/index_${i}.html`;
    try {
      const response = await axios.get(url, { headers });
      log.succeed(url, true);
      const $ = cheerio.load(response.data);
      const trs = $("table tbody tr");
      trs.each((index, element) => {
        const ip = $(element).find("td:nth-child(1)").text().trim();
        const port = $(element).find("td:nth-child(2)").text().trim();
        const proxyIP = `${ip}:${port}`;
        fs.appendFileSync(filePath, proxyIP + "\n");
      });
      log.succeed(`第 ${i} 页采集完成`, true);
    } catch (error) {
      log.error(`出错了: ${error.message}`, true);
    }
    await sleep(1000);
  }
}

const clearIp = () => {
  removeSync(ipFilePath);
  writeFileSync(ipFilePath, "");
};

async function runMain() {
  try {
    clearIp();
    await get89IP(ipFilePath);
    log.succeed("采集完成", true);
  } catch (error) {
    log.error(`采集出错了: ${error.message}`, true);
  }
}

module.exports = { runMain };
