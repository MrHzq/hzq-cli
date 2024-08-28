const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");

const video2Gif = ({
  videoPath,
  gifWidth,
  gifFps,
  startTime,
  duration,
  gifOutPath,
}) => {
  return new Promise((resolve, reject) => {
    ffmpeg.setFfmpegPath(ffmpegPath); // 设置二进制客户端路径
    ffmpeg(videoPath) // 视频路径
      .size(`${gifWidth}x?`) // 设置输出 GIF 的宽度，高度会等比缩放
      .fps(gifFps) // 设置输出 GIF 的帧率
      .outputOptions("-pix_fmt", "rgb24") // 设置像素格式为rgb24
      .noAudio() // 禁用音频输出
      .setStartTime(startTime || 0) // 开始时间
      .setDuration(duration || 15) // 持续时间
      .videoFilters({
        filter: "crop",
        options: {
          out_w: `iw/1.5`, // 裁剪到原始宽度
          out_h: "ih", // 高度保持不变
          x: "(iw-out_w)/2", // 从中心开始裁剪
          y: 0, // y坐标保持在顶部
        },
      })
      .output(gifOutPath) // 输出路径
      .on("end", () => {
        resolve(gifOutPath);
      })
      .on("error", (err) => {
        reject(err);
      })
      .run();
  });
};

module.exports = { video2Gif };
