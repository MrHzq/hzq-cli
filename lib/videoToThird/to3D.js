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
const path = require("path");
const { sleep } = require("../../utils/common");

const videoTo3D = ({ videoPath, outPath }) => {
  return new Promise((resolve, reject) => {
    try {
      ffmpeg()
        .input(videoPath)
        .input(videoPath)
        .complexFilter([
          // 对第一个视频，保持宽度不变，高度自动调整
          "[0:v]scale=w=-1:ih[left]",
          // 对第二个视频，同样保持宽度不变，高度自动调整
          "[1:v]scale=w=-1:ih[right]",
          "[left][right]hstack=inputs=2",
        ])
        .on("end", () => {
          sleep(1000).then(() => resolve(outPath));
        })
        .on("error", (err) => {
          log.error(`${path.basename(videoPath)}: ${err}`, true);

          if (!videoPath.includes("n3od")) {
            // 重命名视频文件
            const no3dPath = newFileName(videoPath, { suffix: "n3od" });
            renameSync(videoPath, no3dPath);

            // 修改文件的的时间为当前时间
            if (checkFileExist(no3dPath)) utimesSync(no3dPath);
          }

          // 删除已输出的文件
          if (checkFileExist(outPath)) removeSync(outPath);

          reject(err);
        })
        .save(outPath);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { videoTo3D };
