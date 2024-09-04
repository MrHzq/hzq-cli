const sharp = require("sharp");
const { writeFileSync, createNewNameBy } = require("../../utils/fs");

const compressGif = async (inputPath, outPath) => {
  const data = await sharp(inputPath, {
    animated: true,
    limitInputPixels: false,
  })
    .gif({
      // colours: 60,
    })
    .toBuffer();

  if (!outPath) outPath = createNewNameBy(inputPath, { suffix: "compress" });

  writeFileSync(outPath, data);

  return outPath;
};

module.exports = { compressGif };
