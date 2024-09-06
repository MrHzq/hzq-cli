const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const { processRun } = require("../../utils/process");
const path = require("path");

module.exports = async (_, options = {}) => {
  // const { _name = getDirName(__dirname) } = options;

  let cliName, config, configType;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();
  };

  const runMain = async () => {
    // 运行命令...

    const ffmpegInstaller = require("ffmpeg-static");
    const command = `${ffmpegInstaller} -version`;

    processRun(command);

    // 【将图片转为带有静音音频的视频】，生成时由于没有进度条，所以要等一段时间
    const inputPath =
      "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png";
    const videoTime = 10;
    const outputVideoName =
      "/Users/zyb/Github/MrHzq/hzq-cli/lib/runFfmpeg/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ";

    const thisCommand = `${ffmpegInstaller} -loop 1 -i  "${inputPath}" -t ${videoTime} -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -vf scale=1280:720 -c:v libx264 -pix_fmt yuv420p -y -c:a aac -shortest "${outputVideoName}.mp4"`;

    processRun(thisCommand);
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => "运行",
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => "todo...",
    // },
  ];

  return {
    initVar,
    mainStepList,
    todoStepList,
  };
};
