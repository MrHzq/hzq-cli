const checkFnAndGetFfmpeg = async (fn) => {
  const ffmpeg = require("./ffmpeg");
  const fluentFfmpeg = require("./fluentFfmpeg");

  return (await ffmpeg.checkFn(fn)) ? ffmpeg : fluentFfmpeg;
};

module.exports = { checkFnAndGetFfmpeg };
