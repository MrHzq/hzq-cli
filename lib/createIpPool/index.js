const { prompt, notNumberRule, requireRule } = require("../../utils/inquirer");
const CmdList = require("../../bin/handleCmdList");
const log = require("../../utils/log");
const {
  getDirName,
  getCmdName,
  getFullPathBy,
  pathJoin,
} = require("../../utils/path");
const {
  getValueByPath,
  isNumber,
  stringArrayReplaceAll,
  testIp,
  sleep,
} = require("../../utils/common");
const axios = require("axios");
const { writeFileSync, removeSync } = require("../../utils/fs");

// ip 池的倍数
const BEI = 50;

module.exports = async (_, options = {}) => {
  const {
    _name = getDirName(__dirname),
    _cmdName = getCmdName(),
    _description,
  } = options;

  let cliName, config, configType;
  let ipNum, freeIpList, goodIpList, badIpList, outPutDir;

  // 初始化变量
  const initVar = (answers) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    ipNum = Number(answers.ipNum);

    freeIpList = [];
    goodIpList = [];
    badIpList = [];

    outPutDir = config.outPutDir.startsWith(".")
      ? getFullPathBy(config.outPutDir)
      : config.outPutDir;
  };

  // 爬取免费代理 IP 池
  const getFreeIpList = async () => {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    };

    // 生成免费的 ip 接口: https://www.89ip.cn/api.html
    // http://api.89ip.cn/tqdl.html?api=1&num=10&port=&address=&isp=
    const url = `http://api.89ip.cn/tqdl.html?api=1&num=${ipNum}&port=&address=&isp=`;
    try {
      const response = await axios.get(url, { headers });

      log.succeed(url, true);

      freeIpList = stringArrayReplaceAll(
        response.data.split("</script>").at(-1).split("<br>").slice(0, -1)
      );

      if (freeIpList.length) {
        const freeIpFileFullPath = pathJoin(outPutDir, "freeIp.txt");

        removeSync(freeIpFileFullPath);

        writeFileSync(freeIpFileFullPath, freeIpList.join("\n"));
      }
    } catch (error) {
      return `出错了: ${error.message}`, true;
    }
  };

  // 获取可用的 IP 池
  const getGoodIpList = async () => {
    for (const ip of freeIpList) {
      const { success, res } = await testIp(ip);
      if (success) goodIpList.push(res);
      else badIpList.push(res);
      await sleep();
    }

    return {
      success: goodIpList.length,
      onFinal(isSuccess) {
        log[isSuccess ? "success" : "error"](
          `可用数量为: ${goodIpList.length}`,
          true
        );
      },
    };
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: getFreeIpList,
      desc: () => `爬取免费代理 IP 池`,
    },
    {
      fun: getGoodIpList,
      desc: () => `获取可用的 IP 池`,
    },
  ];

  // todo 流程 - step 集合
  const todoStepList = [
    // {
    //   desc: () => "todo...",
    // },
  ];

  // 生成当前配置对应的 prompt
  const createConfigPromptList = (_config) => {
    const promptList = [];

    const configKeys = Object.keys(_config);
    const configLen = configKeys.length;

    if (!configLen) configType = "add";
    const createPromptName = (key) => {
      return ["config", key].filter(Boolean).join(".");
    };

    const outPutDirPrompt = {
      type: "input",
      name: createPromptName("outPutDir"), // config.??.outPutDir
      message: "请输入 IP.txt 存放的文件夹:",
      validate: notNumberRule,
    };

    if (["reset", "add"].includes(configType)) {
      promptList.push(outPutDirPrompt);
    } else {
      if (!getValueByPath({ config: _config }, outPutDirPrompt.name)) {
        promptList.push(outPutDirPrompt);
        configType = "add";
      }
    }

    return promptList;
  };

  return {
    // 第一个 _config 为配置项
    async prompt(_config, ...args) {
      configType = args.at(-1);

      if (["reset", "add"].includes(configType)) args.pop(); // 若需要重置/新增，则将最后一个参数删除掉

      // configPromptList 按情况使用
      const configPromptList = createConfigPromptList(_config, configType);

      const promptList = [...configPromptList];

      let [arg] = args;

      if (arg && isNumber(arg)) ipNum = Number(arg);

      let answers = {};

      let firstPrompt = {
        type: "input",
        name: "ipNum",
        message: `请输入生成的 ip 数量(1 ~ 500):`,
        validate: requireRule,
        default: 5,
      };

      if (!ipNum) promptList.push(firstPrompt);

      answers = await prompt(promptList);

      answers.configType = configType;

      return answers;
    },
    initVar,
    mainStepList,
    todoStepList,
  };
};
