const fs = require("fs");
const axios = require("axios");
const path = require("path");
const log = require("../../utils/log");

const ipFilePath = path.resolve(__dirname, "./ip.txt");
const goodIpFilePath = path.resolve(__dirname, "./goodIp.txt");

async function testIp(ip) {
  try {
    const response = await axios.get("https://tieba.baidu.com/", {
      proxy: {
        host: ip.split(":")[0],
        port: ip.split(":")[1],
      },
      timeout: 5000,
    });
    if (response.status === 200 || response.status === 302) {
      return true;
    }
  } catch (error) {
    log.error(`出错了: ${error.message}`, true);
  }
  return false;
}

async function goodIp() {
  const proxyList = fs
    .readFileSync(ipFilePath, "utf-8")
    .split("\n")
    .filter(Boolean);

  const promiseArr = [];
  for (const proxy of proxyList) promiseArr.push(testIp(proxy));
  const resultArr = await Promise.all(promiseArr);
  log.newLine();
  const validProxies = resultArr.reduce((acc, curr, index) => {
    if (curr) {
      acc.push(proxyList[index]);
      log.succeed(`代理IP ${proxyList[index]} 可用`);
    } else {
      log.error(`代理IP ${proxyList[index]} 不可用`);
    }
    return acc;
  }, []);

  fs.writeFileSync(goodIpFilePath, validProxies.join("\n"));
  log.succeed(
    `可用代理 IP 已处理完毕, 可用数量为: ${validProxies.length}`,
    true
  );
}

module.exports = { goodIp };
