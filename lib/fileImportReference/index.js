const CmdList = require("../../bin/handleCmdList");
const { spaceStr } = require("../../utils/common");
const { checkFileExist, reReaddirSync } = require("../../utils/fs");
const log = require("../../utils/log");
const { getDirName, getCmdName, getFileName } = require("../../utils/path");

module.exports = async (_, options = {}) => {
  const {
    _name = getDirName(__dirname),
    _cmdName = getCmdName(),
    _description,
  } = options;

  let cliName, config, configType;

  let findKey, searchDirectory;

  // 初始化变量
  const initVar = (answers, args) => {
    config = answers.config;

    cliName = CmdList.getCliName();

    [findKey, searchDirectory = "./src"] = args;
  };

  // 获取引用的变量名
  const extractImportedName = (str) => {
    const regex = /import\s+(?:(\{[\w,\s]+\})|([\w]+))\s+from/;
    const match = str.match(regex);
    if (match) {
      if (match[1]) {
        return match[1].replace(/\{|\}/g, "").trim().split(",")[0];
      } else if (match[2]) {
        return match[2];
      }
    }
    return null;
  };

  // 是否有引用关系：boolean
  const hasReference = (c, word) => {
    const noCommentAndHasWord =
      !c.startsWith("//") && isFullWord(c, `/${word}`);

    const isReference = [
      isFullWord(c, "import"),
      isFullWord(c, "from"),
      isFullWord(c, "require"),
      c.includes("./"),
      c.includes("../"),
    ].some(Boolean);

    return noCommentAndHasWord && isReference;
  };

  // 全字匹配正则
  const fullWordMatchReg = (word, flags = "") => {
    return new RegExp(`\\.?${word}(?!\\w)`, flags); // new RegExp(`\\b${word}\\b`, flags);
  };

  // 全字匹配，判断是否存在
  const isFullWord = (content, target) => {
    const regex = fullWordMatchReg(target); // 创建正则表达式对象，^表示匹配字符串的开头，$表示匹配字符串的结尾，从而实现完全匹配
    return regex.test(content); // 使用 test 方法进行正则匹配
  };

  const runMain = async () => {
    // 运行命令...

    if (!findKey) return `查找内容不能为空!!`;

    if (!checkFileExist(searchDirectory)) {
      return `${searchDirectory} 文件不存在`;
    }

    const [targetName] = getFileName(findKey);

    const referencedFiles = []; // 匹配到的文件引用关系
    let matchResultCount = 0; // 匹配到的结果数量
    const forEachFiles = []; // 遍历过的文件

    // 获取到所有的文件路径
    reReaddirSync({
      dir: searchDirectory,
      cb({ filePath, fullFilePath, fileContent, fileContentFormat }) {
        forEachFiles.push(filePath);
        if (isFullWord(fileContent, `/${targetName}`)) {
          const referencedFileItem = {
            filePath,
            match: [],
          };

          fileContentFormat.forEach((lineContent, index) => {
            if (hasReference(lineContent, targetName)) {
              ++matchResultCount;

              const lineNumber = index + 1;
              const codePath = fullFilePath + "#" + lineNumber;
              const matchContent = lineContent.trim();
              const importedName = extractImportedName(matchContent);
              const importedNameNum =
                lineContent.match(fullWordMatchReg(importedName, "g"))
                  ?.length || 0;

              const contentImportedNameNum =
                fileContent.match(fullWordMatchReg(importedName, "g"))
                  ?.length || 0;

              const isUse =
                contentImportedNameNum === 0 ||
                contentImportedNameNum > importedNameNum;

              const styleContent =
                matchContent
                  .replace(
                    `/${targetName}`,
                    log.chalkText(`/${targetName}`, "green")
                  )
                  .replace(importedName, log.chalkText(importedName, "blue")) +
                (isUse ? "" : log.chalkText(" // 引用后从未使用", "red"));

              const currResult = {
                lineNumber,
                codePath,
                matchContent,
                styleContent,
                targetName,
                importedName,
                importedNameNum,
              };

              referencedFileItem.match.push(currResult);
            }
          });

          if (referencedFileItem.match.length) {
            referencedFiles.push(referencedFileItem);
          }
        }
      },
    });

    return {
      success: true,
      onSuccess() {
        log.infoWithNewLine(
          `搜索内容：${log.chalkText(
            findKey,
            "blue"
          )}，文件范围：${searchDirectory}`,
          true
        );

        log.succeed(
          `查找成功：${referencedFiles.length} 个文件 - ${matchResultCount} 个结果`,
          true
        );

        referencedFiles.forEach((item) => {
          log.infoWithNewLine(
            log.chalkText(item.match[0].codePath, "yellow.underline"),
            true
          ); // 加 #num 的作用是支持直接跳转到对应文件的行数

          const baseSpace = 2; // 默认 2 个空格
          const maxLineLen = 4; // 行数的长度最多为 4 个

          item.match.forEach((m) => {
            log.info(
              `${log.chalkText(
                spaceStr(baseSpace) + `${m.lineNumber}:`,
                "blue"
              )}`,
              `${spaceStr(
                baseSpace + (maxLineLen - String(m.lineNumber).length)
              )}${m.styleContent}`
            );
          });
        });

        log.succeed(`共遍历了 ${forEachFiles.length} 个文件`, true);
      },
    };
  };

  // 主流程 - step 集合
  const mainStepList = [
    {
      fun: runMain,
      desc: () => _description,
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
    forceLoading: true,
    showRunTime: true,
    hideSucceed: true,
  };
};
