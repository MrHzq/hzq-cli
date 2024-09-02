const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath); // 设置二进制客户端路径

const {
  removeSync,
  renameSync,
  newFileName,
  checkFileExist,
  utimesSync,
} = require("../../utils/fs");
const log = require("../../utils/log");

const videoTo3D = ({ videoPath, outPath }) => {
  return new Promise((resolve, reject) => {
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
        log.error(`${videoPath}: ${err}`, true);

        // 重命名视频文件
        const no3dPath = newFileName(videoPath, { suffix: "n3od" });
        renameSync(videoPath, no3dPath);

        // 修改文件的的时间为当前时间
        if (checkFileExist(no3dPath)) utimesSync(no3dPath);

        // 删除已输出的文件
        if (checkFileExist(outPath)) removeSync(outPath);

        reject(err);
      })
      .save(outPath);
  });
};

module.exports = { videoTo3D };
