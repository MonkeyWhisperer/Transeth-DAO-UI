"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.STATUSES = void 0;

var _bytes = _interopRequireDefault(require("bytes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const STATUSES = {
  PASS: 'pass',
  WARN: 'warn',
  FAIL: 'fail',
  REMOVED: 'removed'
};
exports.STATUSES = STATUSES;

const getCompressionText = compression => {
  return compression === 'none' ? '(no compression)' : `(${compression})`;
};

const analyzeFiles = ({
  currentBranchFileDetails,
  baseBranchFileDetails,
  baseBranchName
}) => {
  const uniqueFilePaths = new Set([...Object.keys(currentBranchFileDetails), ...Object.keys(baseBranchFileDetails)]);
  const results = [];
  uniqueFilePaths.forEach(filePath => {
    const currentBranchFile = currentBranchFileDetails[filePath];
    const baseBranchFile = baseBranchFileDetails[filePath];

    if (!currentBranchFile) {
      // baseBranchFile must exist
      results.push({
        filePath,
        message: `${filePath}: File removed (${(0, _bytes.default)(baseBranchFile.size)} smaller than ${baseBranchName}) ${getCompressionText(baseBranchFile.compression)}`,
        status: STATUSES.REMOVED,
        size: 0,
        baseBranchSize: baseBranchFile.size,
        maxSize: 0
      });
      return;
    }

    if (currentBranchFile.error) {
      results.push({
        filePath,
        error: currentBranchFile.error,
        status: 'fail'
      });
      return;
    }

    const {
      size,
      maxSize,
      compression
    } = currentBranchFile;
    let status;
    let message = `${(0, _bytes.default)(size)} `;
    const prettySize = maxSize === Infinity ? 'Infinity' : (0, _bytes.default)(maxSize);

    if (size > maxSize) {
      status = STATUSES.FAIL;
      message += `> ${prettySize} `;
    } else {
      status = STATUSES.PASS;
      message += `< ${prettySize} `;

      if (baseBranchFile) {
        const diff = size - baseBranchFile.size;

        if (diff < 0) {
          message += `(${(0, _bytes.default)(Math.abs(diff))} smaller than ${baseBranchName}) `;
        } else if (diff > 0) {
          message += `(${(0, _bytes.default)(diff)} larger than ${baseBranchName}) `; // TODO: add in threshold for STATUSES.WARN
          // STATUSES.WARN
        } else {
          message += `(no difference) `;
        }
      }
    }

    message += `${getCompressionText(compression)}`;
    results.push({
      filePath,
      message,
      status,
      size,
      baseBranchSize: baseBranchFile ? baseBranchFile.size : 0,
      maxSize
    });
  });
  return results;
};

var _default = analyzeFiles;
exports.default = _default;