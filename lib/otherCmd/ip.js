const os = require("os");
const log = require("../../utils/log");

const fun = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === "IPv4" && !interface.internal) {
        log.success(interface.address);
      }
    }
  }
};

module.exports = {
  fun,
  desc: "打印当前 ip",
};
