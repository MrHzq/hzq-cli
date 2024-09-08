const { processRun } = require("./process");
const log = require("./log");
const { sleep, formatScend } = require("./common");
const { format } = require("path");

const ffmpeg = {
  run(command, resolveRes) {
    return new Promise((resolve, reject) => {
      if (!["ffmpeg", "ffprobe"].includes(command)) {
        command = this.createCmd(command);
      }

      if (command.length < 100) log.succeed(command);

      try {
        const res = processRun(command, "get");
        if (res.startsWith("err:")) reject(res);
        else sleep(1000).then(() => resolve(res || resolveRes));
      } catch (error) {
        reject(error);
      }
    });
  },

  createCmd(command) {
    return `ffmpeg ${command}`;
  },

  async version() {
    const cmdStr = "-version";
    return await this.run(cmdStr);
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
      format: formatScend,
    },
  },

  async info(videoPath) {
    const cmdStr = `ffprobe -v error -select_streams v -show_entries stream=index,codec_name,codec_type,width,height,r_frame_rate,duration -of default=noprint_wrappers=1 ${videoPath}`;

    let res = await this.run(cmdStr);

    Object.entries(this.infoMap).forEach(([key, value]) => {
      if (typeof value === "object") {
        const [, _value] = res.split(`${key}=`);
        const newValue = value.format(_value);
        res = res.replace(key, value.text).replace(_value, newValue);
      } else res = res.replace(key, value);
    });

    return res;
  },

  to3D({ videoPath, outPath }) {
    const cmdStr = `-i ${videoPath} -i ${videoPath} -filter_complex "[0:v]scale=w=-1:ih[left];[1:v]scale=w=-1:ih[right];[left][right]hstack=inputs=2" ${outPath}`;
    return this.run(cmdStr, outPath);
  },
};

module.exports = ffmpeg;
