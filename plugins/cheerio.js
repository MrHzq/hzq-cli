const axios = require("axios");
const cheerio = require("cheerio");
const log = require("../utils/log");
const { toPromise, isEmptyVal } = require("../utils/common");
const { getFileName, getFullPathBy, pathJoin } = require("../utils/path");
const {
  createWriteStream,
  readFileSyncFormat,
  removeSync,
} = require("../utils/fs");
const path = require("path");
const { imageToBase64 } = require("./sharp");

const mock = true;
const mockImageUrl = "https://netnewswire.com/images/nnw_icon_32.png";
const mockWebsite = "https://ai-emoji.bettergogo.com/";

// 下载网络链接的图片
// type = base64 | local
const downHttpImage = (imageUrl, type = "base64") =>
  toPromise(async (resolve, reject) => {
    if (isEmptyVal(imageUrl)) {
      if (mock) imageUrl = mockImageUrl;
      else return reject(`imageUrl 不能为空`);
    }
    const newIp = "";

    const freeIpList = readFileSyncFormat(
      path.resolve(__dirname, "../tempDir/freeIp.txt")
    );

    axios
      .get(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0", // 设置 User-Agent 为浏览器的类型
          // "X-Forwarded-For": newIp, // 设置 X-Forwarded-For 为新 IP
        },
        responseType: "stream",
      })
      .then(({ data }) => {
        const imagePath = getFullPathBy(getFileName(imageUrl).join(""));
        const writeStream = createWriteStream(imagePath);
        data.pipe(writeStream);

        writeStream.on("finish", async () => {
          const resolveRes = {};

          if (type === "base64") {
            const { base64 } = await imageToBase64({
              imagePath,
              noNeedOutPath: true,
            });
            resolveRes.base64 = base64;
            removeSync(imagePath);
          } else {
            log.succeed(`图片已保存在: ${imagePath}`, true);
            resolveRes.imagePath = imagePath;
          }
          resolve(resolveRes);
        });
      })
      .catch(reject);
  });

// 获取网址信息: { title,description,icon }
const getWebInfo = (website) =>
  toPromise(async (resolve, reject) => {
    if (isEmptyVal(website)) {
      if (mock) website = mockWebsite;
      else return reject(`website 不能为空`);
    }

    axios
      .get(website, {
        headers: {
          "User-Agent": "Mozilla/5.0", // 设置 User-Agent 为浏览器的类型
          // "X-Forwarded-For": newIp, // 设置 X-Forwarded-For 为新 IP
        },
      })
      .then(async ({ data }) => {
        const $ = cheerio.load(data);

        let title =
          $('meta[property="og:title"]').attr("content") || $("title").text();

        let description =
          $('meta[name="description"]').attr("content") ||
          $(`meta[property="og:description"]`).attr("content");

        let icon =
          $('link[rel="icon"]').attr("href") ||
          $('link[rel="shortcut icon"]').attr("href");

        if (icon) {
          if (icon.includes("http") || icon.includes("https")) {
          } else {
            console.log("[ icon ] >", icon);
            icon = pathJoin(website, icon);
          }

          const { success, base64 } = await downHttpImage(icon);
          if (success) icon = base64;
        }

        const resolveRes = {
          title,
          description,
          icon,
        };

        console.log("[ resolveRes ] >", resolveRes);

        // console.log("data", data.split("\n").slice(0, 50));

        resolve({ res: resolveRes });
      })
      .catch(reject);
  });

module.exports = { getWebInfo };
