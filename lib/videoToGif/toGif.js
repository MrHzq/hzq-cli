const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");

const video2Gif = async ({ videoPath, gifPath, width, fps }) => {
  ffmpeg.setFfmpegPath(ffmpegPath); // 设置二进制客户端路径
  await ffmpeg(videoPath) // 读入路径
    .outputOptions("-pix_fmt", "rgb24") // 设置像素格式为rgb24
    .output(gifPath) // 输出路径
    .withFPS(fps) // 设置输出GIF的帧率
    .size(`${width}x?`) // 设置输出GIF的宽度，高度等比缩放
    .noAudio() // 禁用音频输出
    .setStartTime("00:00:10") // 开始时间
    .setDuration(15) // 持续时间
    .videoFilters({
      filter: "crop",
      options: {
        out_w: `iw/1.5`, // 裁剪到原始宽度
        out_h: "ih", // 高度保持不变
        x: "(iw-out_w)/2", // 从中心开始裁剪
        y: 0, // y坐标保持在顶部
      },
    })
    .on("end", () => {
      console.log("转换完成！");
    })
    .on("error", (err) => console.error(err))
    .run();
};

module.exports = { video2Gif };
