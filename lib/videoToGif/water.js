const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");

const sourceDirectory = "./image";
const outputDirectory = "./webp_images";

const water = (sourceDirectory, outputDirectory) => {
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  fs.readdir(sourceDirectory, (err, files) => {
    if (err) {
      console.error("Error reading the directory:", err);
      return;
    }

    files.forEach((file) => {
      const extname = path.extname(file).toLowerCase();
      const filename = path.basename(file, extname);

      const allowedFormats = [
        ".jpg",
        ".jpeg",
        ".png",
        ".tif",
        ".tiff",
        ".bmp",
        ".gif",
      ];

      if (allowedFormats.includes(extname)) {
        const inputFile = path.join(sourceDirectory, file);
        const outputFile = path.join(outputDirectory, `${filename}.webp`);

        const watermarkSvg = `
            <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
                <text x="10" y="40" font-family="Arial" font-size="30" fill="pink" stroke="black" stroke-width="2">Moment</text>
            </svg>
        `;

        sharp(inputFile)
          .webp()
          .composite([
            {
              input: Buffer.from(watermarkSvg),
              gravity: "southeast",
            },
          ])
          .toFile(outputFile, (err, info) => {
            if (err) {
              console.error(`Failed to convert and watermark ${file}:`, err);
            } else {
              console.log(`Converted and watermarked ${file} to WebP format.`);
            }
          });
      }
    });
  });
};
