const sharp = require("sharp");
const {
  createUniqueNameBy,
  writeFileSync,
  createNewName,
} = require("../utils/fs");
const { joinBy, toPromise } = require("../utils/common");

// 获取图片详情
const getImageInfo = async (p) => {
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

// 压缩图片
const compressImage = async ({ imagePath, outPath }) =>
  toPromise(async (resolve, reject) => {
    if (!outPath) {
      outPath = createUniqueNameBy(imagePath, { suffix: "compress" });
    }

    // 获取原始图像信息
    const { width, height } = await getImageInfo(imagePath);

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
        if (error) reject(error);
        else resolve({ res: outPath, info });
      })
      .catch(reject);
  });

// 图片转为 base64
const imageToBase64 = async ({ imagePath, outPath }) =>
  toPromise(async (resolve, reject) => {
    if (!outPath) {
      outPath = createNewName(imagePath, { ext: ".txt" });
    }

    sharp(imagePath)
      .toBuffer()
      .then((buffer) => {
        const prefix = "data:image/png;base64,";
        const base64String = prefix + buffer.toString("base64");
        writeFileSync(outPath, base64String);
        resolve({ res: outPath, base64String });
      })
      .catch(reject);
  });

module.exports = { getImageInfo, compressImage, imageToBase64 };
