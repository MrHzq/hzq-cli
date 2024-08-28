const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");

const videoTo3D = ({ videoPath, outPath }) => {
  return new Promise((resolve, reject) => {
    ffmpeg.setFfmpegPath(ffmpegPath); // 设置二进制客户端路径

    ffmpeg()
      .input(videoPath)
      .input(videoPath)
      .complexFilter([
        "[0:v]scale=iw/2:-1[left]", // 保持宽高比进行缩放，高度自动计算
        "[1:v]scale=iw/2:-1[right]",
        "[left][right]hstack=inputs=2",
      ])
      .on("end", () => {
        resolve(outPath);
      })
      .on("error", (err) => {
        reject(err);
      })
      .save(outPath);
  });
};

module.exports = { videoTo3D };
