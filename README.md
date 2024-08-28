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
    "cmd": "deleteCmd",
    "alias": "dc",
    "_description": "删除一个命令"
  },
  {
    "cmd": "projectTemplate",
    "alias": "pt",
    "_description": "拉取项目模板"
  },
  {
    "cmd": "cliTemplate",
    "alias": "ct",
    "_description": "拉取 cli 模板"
  },
  {
    "cmd": "deleteFile",
    "alias": "df",
    "_description": "删除文件"
  },
  {
    "cmd": "commonCmd",
    "alias": "cc",
    "_description": "常用命令"
  },
  {
    "cmd": "runCmd",
    "alias": "rc",
    "_description": "展示当前命令并选择命令运行"
  },
  {
    "cmd": "zshrcAlias",
    "alias": "za",
    "_description": "查看 .zshrc 里面的 alias"
  },
  {
    "cmd": "updateCliTemplate",
    "alias": "uct",
    "_description": "更新其他 *-cli 代码"
  },
  {
    "cmd": "videoToGif",
    "alias": "vtg",
    "_description": "视频转为 gif"
  },
  {
    "cmd": "fileFilter",
    "alias": "ff",
    "_description": "文件查找并展示列表"
  },
  {
    "cmd": "fileDetail",
    "alias": "fd",
    "_description": "查看文件详情"
  },
  {
    "cmd": "replaceLang",
    "alias": "rl",
    "_description": "语言包替换"
  },
  {
    "cmd": "updateMd",
    "alias": "um",
    "_description": "更新 README.md"
  },
  {
    "cmd": "videoTo3D",
    "alias": "vt3d",
    "_description": "视频转为 3D 视频"
  },
  {
    "cmd": "changeFormatOnSave",
    "alias": "cfos",
    "_description": "更改当前项目的 formatOnSave 配置"
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
  commonCmd: 常用命令
  zshrcAlias: 查看 .zshrc 里面的 alias
```

```js
> hzq ff

welcome use hzq-cli ~
 
? 请输入查找关键词: .mp3
 
查找目录：/Users/Downloads
 
未找到包含 .mp3 的文件
```
