const { processRun, processExit } = require("../utils/process");
const log = require("../utils/log");
const { sleep, formatScend } = require("../utils/common");

const ffmpeg = {
  run(command, resolveRes, rejectRes) {
    return new Promise((resolve, reject) => {
      if (!new RegExp("ffprobe|ffmpeg").test(command)) {
        command = this.createCmd(command);
      }

      // if (command.length < 100) log.succeed(command);

      try {
        const res = processRun(command, "get");
        if (res.startsWith("err:")) {
          reject({
            success: false,
            res: res || resolveRes,
          });
        } else {
          sleep().then(() =>
            resolve({
              success: true,
              res: res || resolveRes,
            })
          );
        }
      } catch (error) {
        reject({ success: false, error });
      }
    });
  },

  createCmd(command) {
    return `ffmpeg ${command}`;
  },

  logInstallInfo({ needExit, prefix }) {
    const info = `${prefix ?? "请"}安装 ffmpeg: https://evermeet.cx/ffmpeg/`;

    if (needExit) {
      log.warn(info, [true, true]);
      processExit();
    }
  },

  async version() {
    const cmdStr = "-version";
    return await this.run(cmdStr);
  },

  async isExist() {
    const { res } = await this.version();
    return res.includes("ffmpeg version");
  },

  async checkFn(fnName) {
    const mustNeedFfmpegFn = [this.videoInfo.name];
    const flag = mustNeedFfmpegFn.includes(fnName);

    if (flag) {
      if (!(await this.isExist())) {
        this.logInstallInfo({
          needExit: true,
          prefix: `命令 ${fnName} 需要`,
        });
      }
    } else return this[fnName];

    return true;
  },

  async videoInfo({ videoPath }) {
    const infoMap = {
      // index: "索引编号",
      codec_name: "编解码器名称",
      codec_type: "类型",
      width: "宽度",
      height: "高度",
      r_frame_rate: "帧率",
      duration: {
        text: "时长",
        format: formatScend,
      },
    };

    const cmdStr = `ffprobe -v error -select_streams v -show_entries stream=${Object.keys(
      infoMap
    ).join(",")} -of default=noprint_wrappers=1 ${videoPath}`;

    const { success, res } = await this.run(cmdStr);

    const resList = res
      .split("\n")
      .filter(Boolean)
      .map((item) => {
        let [key, value] = item.split(`=`);

        let _value = infoMap[key] || key;

        if (typeof _value === "object") {
          value = _value.format(value);
          _value = _value.text;
        }

        return [_value, value].join(`=`);
      });

    return { success, res: resList.join("\n") };
  },

  async videoTo3D({ videoPath, outPath }) {
    const cmdStr = `-i ${videoPath} -i ${videoPath} -filter_complex "[0:v]scale=w=-1:ih[left];[1:v]scale=w=-1:ih[right];[left][right]hstack=inputs=2" ${outPath}`;
    return await this.run(cmdStr, outPath);
  },
};

module.exports = ffmpeg;
