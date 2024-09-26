const runStep = require("../../utils/runStep");
const Spinner = require("../../utils/spinner");
const { runMain } = require("./get89IP");
const { goodIp } = require("./goodIp");

const main = async () => {
  console.time("本次执行耗时");
  const mainSpinner = new Spinner("生成 IP 池");

  mainSpinner.start();

  await runStep([
    {
      fun: runMain,
      desc: () => `get89IP`,
    },
    {
      fun: goodIp,
      desc: () => `goodIp`,
      delay: 5,
    },
  ]);

  mainSpinner.succeed();

  console.timeEnd("本次执行耗时");
};

main();
