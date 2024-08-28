const path = require("path");

const { readFileSync, writeFileSync } = require("../utils/fs");
const { getDirRePath } = require("../utils/path");

class handleCmdList {
  constructor() {
    this.fileName = "cmdList.json";
    this.path = getDirRePath(__dirname, this.fileName);
    this.list = this.getList();
  }

  // 获取当前项目可执行的父级命令
  getCliName() {
    return Object.keys(require("../package.json").bin).join(" | ");
  }

  // 获取 cmdList.json 原始数据
  getListOrigin() {
    const list = readFileSync(this.path);
    return list ? list : "[]";
  }

  // 获取 cmdList.json 数据
  getList() {
    return JSON.parse(this.getListOrigin());
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
}

module.exports = new handleCmdList();
