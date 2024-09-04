const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath); // 设置二进制客户端路径

const { checkFileExist, removeSync } = require("../../utils/fs");
const log = require("../../utils/log");
const path = require("path");
const { sleep } = require("../../utils/common");

const video2Gif = ({ videoPath, gifFps, startTime, duration, outPath }) => {
  return new Promise((resolve, reject) => {
    try {
      ffmpeg(videoPath)
        .fps(gifFps) // 设置输出 GIF 的帧率
        .outputOptions("-pix_fmt", "rgb24", "-vf", `scale=iw:ih`)
        .noAudio() // 禁用音频输出
        .setStartTime(startTime || 0) // 开始时间
        .setDuration(duration || 15) // 持续时间
        .output(outPath) // 输出路径
        .on("end", () => {
          sleep(1000).then(() => resolve(outPath));
        })
        .on("error", (err) => {
          log.error(`${path.basename(videoPath)}: ${err}`, true);

          // 删除已输出的文件
          if (checkFileExist(outPath)) removeSync(outPath);

          reject(err);
        })
        .run();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { video2Gif };
