# hzq-cli 脚手架工具集合

## 使用

1. 全局下载安装：**npm i -g hzq-cli**
1. 查看版本号：**hzq -V**
1. 使用：**hzq**

## 现有工具

```json
[
  {
    "cmd": "addCmd",
    "alias": "ac",
    "_description": "新增一个命令"
  },
  {
    "cmd": "changeFormatOnSave",
    "alias": "cfos",
    "_description": "更改当前项目的 formatOnSave 配置"
  },
  {
    "cmd": "deleteCmd",
    "alias": "dc",
    "_description": "删除一个命令"
  },
  {
    "cmd": "deleteFile",
    "alias": "df",
    "_description": "删除文件"
  },
  {
    "cmd": "fileDetail",
    "alias": "fd",
    "_description": "查看文件详情"
  },
  {
    "cmd": "fileFilter",
    "alias": "ff",
    "_description": "文件查找并展示列表"
  },
  {
    "cmd": "getCliTem",
    "alias": "gct",
    "_description": "拉取 cli 模板"
  },
  {
    "cmd": "getProjectTem",
    "alias": "gpt",
    "_description": "拉取项目模板"
  },
  {
    "cmd": "mergeCmd",
    "alias": "mc",
    "_description": "将某些 cmd 合并到一个大类里面"
  },
  {
    "cmd": "renameCmd",
    "alias": "rec",
    "_description": "更改命令名称"
  },
  {
    "cmd": "replaceFileName",
    "alias": "rfn",
    "_description": "替换部分文件名"
  },
  {
    "cmd": "replaceLang",
    "alias": "rl",
    "_description": "语言包替换"
  },
  {
    "cmd": "runCmd",
    "alias": "rc",
    "_description": "展示当前命令并选择命令运行"
  },
  {
    "cmd": "toolCmd",
    "alias": "tc",
    "_description": "小工具命令:code/npm/ip...",
    "children": [
      {
        "cmd": "code",
        "alias": "",
        "_description": "code 相关命令"
      },
      {
        "cmd": "ip",
        "alias": "",
        "_description": "查询当前 ip"
      },
      {
        "cmd": "npm",
        "alias": "",
        "_description": "npm 相关命令"
      }
    ]
  },
  {
    "cmd": "updateCliTemplate",
    "alias": "uct",
    "_description": "更新其他 *-cli 代码"
  },
  {
    "cmd": "updateReadme",
    "alias": "ur",
    "_description": "更新当前项目的 README.md"
  },
  {
    "cmd": "videoInfo",
    "alias": "vi",
    "_description": "查看视频详情"
  },
  {
    "cmd": "videoToGif",
    "alias": "vtg",
    "_description": "视频转为 gif"
  },
  {
    "cmd": "videoToThird",
    "alias": "vt3",
    "_description": "视频转为 3D 视频"
  },
  {
    "cmd": "zshrcAlias",
    "alias": "za",
    "_description": "查看 .zshrc 里面的 alias"
  }
]
```

## 工具使用

`hzq [alias]` 即可唤起/使用对应工具

## 例子

```js
> hzq rc

welcome use hzq-cli ~

? 请选择要运行的命令: (Use arrow keys)
❯ addCmd: 新增一个命令
  deleteCmd: 删除一个命令
  projectTemplate: 拉取项目模板
  cliTemplate: 拉取 cli 模板
  deleteFile: 删除文件
  otherCmd: 常用命令
  zshrcAlias: 查看 .zshrc 里面的 alias
```

```js
> hzq ff

welcome use hzq-cli ~
 
? 请输入查找关键词: .mp3
 
查找目录：/Users/Downloads
 
未找到包含 .mp3 的文件
```
