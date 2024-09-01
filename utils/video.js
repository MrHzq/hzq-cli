const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath(ffmpegPath); // 设置二进制客户端路径

module.exports = async ({ videoPath, outPath }) => {
  return new Promise((resolve, reject) => {
    // ffmpeg()
    //   .input(videoPath)
    //   .on("end", () => {
    //     console.log("end");
    //     resolve(outPath);
    //   })
    //   .on("error", (err) => {
    //     console.log("error", err);
    //     reject(err);
    //   })
    //   .on("codecData", function (data) {
    //     console.log(
    //       "Input is " + data.audio + " audio " + "with " + data.video + " video"
    //     );
    //   })
    ffmpeg.ffprobe(videoPath, function (err, data) {
      console.log(
        "%c [ err ]-「utils/video.js」",
        "font-size:13px; background:#c53b46; color:#ff7f8a;",
        err
      );
      console.log("metadata:");
      console.dir(data);
    });

    // .save(outPath);
  });
};
