const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const fluentFfmpeg = require("fluent-ffmpeg");
fluentFfmpeg.setFfmpegPath(ffmpegPath); // 设置二进制客户端路径

const log = require("../utils/log");
const path = require("path");
const { sleep } = require("../utils/common");

const videoTo3D = ({ videoPath, outPath }) => {
  return new Promise((resolve, reject) => {
    try {
      fluentFfmpeg()
        .input(videoPath)
        .input(videoPath)
        .complexFilter([
          // 对第一个视频，保持宽度不变，高度自动调整
          "[0:v]scale=w=-1:ih[left]",
          // 对第二个视频，同样保持宽度不变，高度自动调整
          "[1:v]scale=w=-1:ih[right]",
          "[left][right]hstack=inputs=2",
        ])
        .on("end", () =>
          sleep().then(() => resolve({ success: true, res: outPath }))
        )
        .on("error", (error) => {
          log.error(`${path.basename(videoPath)}: ${error}`, true);
          reject({ success: false, error });
        })
        .save(outPath);
    } catch (error) {
      reject({ success: false, error });
    }
  });
};

const videoToGif = ({ videoPath, gifFps, startTime, duration, outPath }) => {
  return new Promise((resolve, reject) => {
    try {
      fluentFfmpeg(videoPath)
        .fps(gifFps) // 设置输出 GIF 的帧率
        .outputOptions("-pix_fmt", "rgb24", "-vf", `scale=iw:ih`)
        .noAudio() // 禁用音频输出
        .setStartTime(startTime || 0) // 开始时间
        .setDuration(duration || 15) // 持续时间
        .output(outPath) // 输出路径
        .on("end", () => {
          sleep().then(() => resolve({ success: true, res: outPath }));
        })
        .on("error", (error) => {
          log.error(`${path.basename(videoPath)}: ${error}`, true);

          reject({ success: false, error });
        })
        .run();
    } catch (error) {
      reject({ success: false, error });
    }
  });
};

module.exports = { videoTo3D, videoToGif };
