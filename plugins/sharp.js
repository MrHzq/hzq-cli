const sharp = require("sharp");
const { createUniqueNameBy } = require("../utils/fs");
const { sleep } = require("../utils/common");

const compressGif = async ({ gifPath, outPath }) => {
  return new Promise((resolve, reject) => {
    try {
      if (!outPath) {
        outPath = createUniqueNameBy(gifPath, { suffix: "compress" });
      }

      // 获取原始图像信息
      sharp(gifPath)
        .metadata()
        .then((metadata) => {
          const { width, height } = metadata;

          const newWidth = parseInt(width * 0.6);
          const newHeight = parseInt(height * 0.6);

          return sharp(gifPath, {
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
                sleep().then(() =>
                  resolve({ success: true, res: outPath, info })
                );
              }
            });
        });
    } catch (error) {
      reject({ success: false, error });
    }
  });
};

module.exports = { compressGif };
