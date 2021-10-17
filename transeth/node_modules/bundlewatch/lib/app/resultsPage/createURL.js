"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash.merge"));

var _main = _interopRequireDefault(require("jsonpack/main"));

var _shortenURL = _interopRequireDefault(require("./shortenURL"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createURL = async ({
  results,
  bundlewatchServiceHost,
  repoOwner,
  repoName,
  repoCurrentBranch,
  repoBranchBase,
  commitSha
}) => {
  const strippedResultsForURL = (0, _lodash.default)({}, results);
  strippedResultsForURL.fullResults.map(result => {
    const strippedResult = result;
    delete strippedResult.message;
    return strippedResult;
  });

  const packedJSON = _main.default.pack({
    details: {
      repoOwner,
      repoName,
      repoCurrentBranch,
      repoBranchBase,
      commitSha
    },
    results: strippedResultsForURL
  });

  const urlResultData = encodeURIComponent(packedJSON);
  const longURL = `${bundlewatchServiceHost}/results?d=${urlResultData}`;
  const shortURL = await (0, _shortenURL.default)(longURL);
  return shortURL;
};

var _default = createURL;
exports.default = _default;