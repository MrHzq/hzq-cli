const ip = require("ip");
const axios = require("axios");
const cheerio = require("cheerio");
const { toPromise } = require("../utils/common");
const { createWriteStream } = require("fs-extra");
const { getFileName, getFullPathBy } = require("../utils/path");
const log = require("../utils/log");

const createIpPool = () => {
  const ipPool = [
    ip.address(),
    ip.cidrSubnet("192.168.1.100/32").toString(),
    ip.cidrSubnet("192.168.1.101/32").toString(),
    ip.cidrSubnet("192.168.1.102/32").toString(),
    ip.cidrSubnet("192.168.1.103/32").toString(),
  ];

  console.log("[ ipPool ] >", ipPool);

  return ipPool;
};

createIpPool();

const getHttpImage = (
  imageUrl = "https://netnewswire.com/images/nnw_icon_32.png",
  type = "base64"
) =>
  toPromise(async (resolve, reject) => {
    axios
      .get(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0", // 设置 User-Agent 为浏览器的类型
          "X-Forwarded-For": newIp, // 设置 X-Forwarded-For 为新 IP
        },
        responseType: "stream",
      })
      .then(({ data }) => {
        const filePath = getFullPathBy(getFileName(imageUrl).join(""));
        const writeStream = createWriteStream(filePath);
        data.pipe(writeStream);

        writeStream.on("finish", () => {
          log.succeed(`图片已保存在: ${filePath}`, true);
          resolve({ filePath });
        });
      })
      .catch(reject);
  });

const getWebInfo = (website = "https://www.baidu.com/") =>
  toPromise(async (resolve, reject) => {
    const res = { title: "", description: "", icon: "" };

    if (!website) return reject(`website 不能为空`);

    axios
      .get(website, {
        headers: {
          "User-Agent": "Mozilla/5.0", // 设置 User-Agent 为浏览器的类型
          "X-Forwarded-For": newIp, // 设置 X-Forwarded-For 为新 IP
        },
      })
      .then(async ({ data }) => {
        console.log("data", data.split("\n").slice(0, 50));

        const $ = cheerio.load(data);

        res.title =
          $('meta[property="og:title"]').attr("content") || $("title").text();

        res.description =
          $('meta[name="description"]').attr("content") ||
          $(`meta[property="og:description"]`).attr("content");

        res.icon =
          $('link[rel="icon"]').attr("href") ||
          $('link[rel="shortcut icon"]').attr("href");

        if (res.icon) {
          const { success, filePath } = await getHttpImage(res.icon);
          console.log(
            "%c [ success ]-「plugins/cheerio.js」",
            "font-size:13px; background:#11d554; color:#55ff98;",
            success
          );
          if (success) res.icon = filePath;
        }

        resolve({ res });
      })
      .catch(reject);
  });

module.exports = { getWebInfo };
