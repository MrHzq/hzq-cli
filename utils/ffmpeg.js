const { processRun } = require("./process");
const log = require("./log");
const { sleep } = require("./common");
const { format } = require("path");

const ffmpeg = {
  run(command) {
    return new Promise((resolve, reject) => {
      if (command.length < 100) log.succeed(command);
      try {
        const res = processRun(command, "get");
        if (res.startsWith("err:")) reject(res);
        else sleep(1000).then(() => resolve(res));
      } catch (error) {
        reject(error);
      }
    });
  },

  createCmd(command) {
    return `ffmpeg ${command}`;
  },

  version() {
    const versionCommand = this.createCmd("-version");
    return this.run(versionCommand);
  },

  infoMap: {
    index: "索引编号",
    codec_name: "编解码器名称",
    codec_type: "类型",
    width: "宽度",
    height: "高度",
    r_frame_rate: "帧率",
    duration: {
      text: "时长",
      format(val) {
        val = Number(val);
        // 转为小时:分钟:秒
        const hours = Math.floor(val / 3600);
        const minutes = Math.floor((val % 3600) / 60);
        const seconds = Math.floor(val % 60);
        // 补零
        const hoursStr = hours.toString().padStart(2, "0");
        const minutesStr = minutes.toString().padStart(2, "0");
        const secondsStr = seconds.toString().padStart(2, "0");
        return `${hoursStr}:${minutesStr}:${secondsStr}`;
      },
    },
  },

  async info(videoPath) {
    const infoCommand = `ffprobe -v error -select_streams v -show_entries stream=index,codec_name,codec_type,width,height,r_frame_rate,duration -of default=noprint_wrappers=1 ${videoPath}`;

    let res = await this.run(infoCommand);

    Object.entries(this.infoMap).forEach(([key, value]) => {
      if (typeof value === "object") {
        const [, _value] = res.split(`${key}=`);
        const newValue = value.format(_value);
        res = res.replace(key, value.text).replace(_value, newValue);
      } else res = res.replace(key, value);
    });

    return res;
  },
};

module.exports = ffmpeg;
