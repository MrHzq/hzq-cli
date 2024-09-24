const iconGen = require("icon-gen");
const { currCwdPath } = require("../utils/path");
const { sleep } = require("../utils/common");

const imageToIco = async ({ imagePath, icoSize }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const faviconOptions = {
        name: "favicon-",
      };
      if (icoSize) {
        faviconOptions.pngSizes = [icoSize];
        faviconOptions.icoSizes = [icoSize];
      }

      iconGen(imagePath, currCwdPath, {
        favicon: faviconOptions,
      })
        .then((results) => {
          sleep().then(() => resolve({ success: true, res: results }));
        })
        .catch((error) => {
          reject({ success: false, error });
        });
    } catch (error) {
      reject({ success: false, error });
    }
  });
};

module.exports = { imageToIco };
