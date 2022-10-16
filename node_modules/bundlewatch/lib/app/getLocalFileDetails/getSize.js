"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _gzipSize = _interopRequireDefault(require("gzip-size"));

var _logger = _interopRequireDefault(require("../../logger"));

var _ValidationError = _interopRequireDefault(require("../errors/ValidationError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getBrotliSize = data => {
  let brotli;

  try {
    brotli = require('brotli-size'); // eslint-disable-line global-require
  } catch (e) {
    throw new _ValidationError.default(`'brotli-size' package has not been installed, please install package to use this compression type`);
  }

  return brotli.sync(data);
};

const getSize = ({
  filePath,
  compression
}) => {
  let data;

  try {
    data = _fs.default.readFileSync(filePath);
  } catch (error) {
    _logger.default.error(`Could not read file: ${filePath}}`, error);

    return null;
  }

  let size;

  switch (compression) {
    case 'gzip':
      size = _gzipSize.default.sync(data);
      break;

    case 'brotli':
      size = getBrotliSize(data);
      break;

    case 'none':
    default:
      size = Buffer.byteLength(data);
  }

  return size;
};

var _default = getSize;
exports.default = _default;