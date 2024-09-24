const sharp = require("sharp");
const { createUniqueNameBy } = require("../utils/fs");
const { sleep, toPromise, joinBy } = require("../utils/common");

const imageInfo = async (p) => {
  const infoMap = {
    width: "宽度",
    height: "高度",
  };

  const metadata = await sharp(p).metadata();

  metadata.infoStr = joinBy(
    Object.entries(infoMap).map(([key, value]) => {
      return `${value}: ${metadata[key]}`;
    })
  );

  return metadata;
};

const compressImage = async ({ imagePath, outPath }) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!outPath) {
        outPath = createUniqueNameBy(imagePath, { suffix: "compress" });
      }

      // 获取原始图像信息
      const { width, height } = await imageInfo(imagePath);

      const newWidth = parseInt(width * 0.6);
      const newHeight = parseInt(height * 0.6);

      return sharp(imagePath, {
        animated: true,
        limitInputPixels: false,
      })
        .resize({ width: newWidth, height: newHeight }) // 根据需要调整分辨率
        .gif({
          // quality: 80,
          // palette: 64, // 减少颜色数量，可根据实际情况调整
        })
        .toFile(outPath, (error, info) => {
          if (error) {
            reject({ success: false, error });
          } else {
            sleep().then(() => resolve({ success: true, res: outPath, info }));
          }
        });
    } catch (error) {
      reject({ success: false, error });
    }
  });
};

module.exports = { imageInfo, compressImage };
