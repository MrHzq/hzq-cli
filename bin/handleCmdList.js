const {
  removeEmpty,
  getFilterList,
  formatCmdList,
} = require("../utils/common");
const { writeFileSync } = require("../utils/fs");
const { getDirRePath } = require("../utils/path");

class handleCmdList {
  constructor() {
    this.fileName = "cmdList.json";
    this.list = require("./" + this.fileName);
    this.path = getDirRePath(__dirname, this.fileName);
  }

  // 获取 cmdList.json 原始数据
  getListOrigin() {
    return JSON.stringify(this.list, null, 2);
  }

  // 获取 cmdList.json 数据
  getList() {
    return this.list;
  }

  // 获取格式化 && 过滤了的 cmdList.json 数据,filterType:'eq'
  getFormatListFilter(filterValue, filterType = "") {
    return getFilterList(this.getFormatList(), filterValue, filterType);
  }

  // 获取格式化 cmdList.json 数据
  getFormatList() {
    return formatCmdList(this.list);
  }

  // 获取当前项目可执行的父级命令
  getCliName() {
    return Object.keys(require("../package.json").bin).join(" | ");
  }

  // 写入 cmdList.json 数据
  write() {
    writeFileSync(this.path, JSON.stringify(this.list, null, 2));
  }

  // 新增
  add(item) {
    this.list.push(item); // 新增数据
    this.write();
  }

  // 查找：返回 index
  findIndex(cmd) {
    return this.list.findIndex((item) => [item.cmd, item.alias].includes(cmd));
  }

  // 查找：item
  find(cmd) {
    return this.list.find((item) => [item.cmd, item.alias].includes(cmd));
  }

  // 删除某个命令
  delete(value) {
    let index;

    if (typeof value !== "number") index = this.findIndex(value);

    if (index !== -1) {
      this.list.splice(index, 1); // 删除数据
      this.write();
    }
  }

  // 替换某个命令
  replace(newItem, value) {
    let index;

    if (typeof value !== "number") index = this.findIndex(value);

    if (index !== -1) {
      Object.assign(this.list[index], removeEmpty(newItem));
      this.write();
    }
  }
}

module.exports = new handleCmdList();
