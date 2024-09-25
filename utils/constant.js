const addUpperCase = (l) => l.forEach((i) => list.push(i.toLocaleUpperCase()));

const IMAGE_TYPE_LIST = addUpperCase([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".webp",
]);

const VIDEO_TYPE_LIST = addUpperCase([".mp4", ".avi", ".mov"]);

const DOCUMENT_TYPE_LIST = addUpperCase([
  ".txt",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
]);

const ARCHIVE_TYPE_LIST = addUpperCase([".zip", ".rar"]);

module.exports = {
  IMAGE_TYPE_LIST,
  VIDEO_TYPE_LIST,
  DOCUMENT_TYPE_LIST,
  ARCHIVE_TYPE_LIST,
};
