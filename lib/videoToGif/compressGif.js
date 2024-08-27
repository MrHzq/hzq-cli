const sharp = require("sharp");
const fs = require("fs-extra");

async function compressGif(filePath, outputPath) {
  const data = await sharp(filePath, {
    animated: true,
    limitInputPixels: false,
  })
    .gif({
      colours: 60,
    })
    .toBuffer();

  // 写入Buffer到文件
  fs.writeFileSync(outputPath, data);
}

module.exports = { compressGif };
