"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logger = _interopRequireDefault(require("../../../logger"));

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class bundlewatchService {
  constructor({
    repoOwner,
    repoName,
    repoBranchBase,
    repoCurrentBranch,
    commitSha,
    bundlewatchServiceHost,
    githubAccessToken
  }) {
    this.repoOwner = repoOwner;
    this.repoName = repoName;
    this.repoBranchBase = repoBranchBase;
    this.repoCurrentBranch = repoCurrentBranch;
    this.commitSha = commitSha;
    this.bundlewatchServiceHost = bundlewatchServiceHost;
    this.githubAccessToken = githubAccessToken;
  }

  get bundlewatchServiceStoreUrl() {
    return `${this.bundlewatchServiceHost}/store`;
  }

  get enabled() {
    if (this.githubAccessToken && this.repoOwner && this.repoName && this.bundlewatchServiceHost) {
      return true;
    }

    return false;
  }

  getFileDetailsForBaseBranch() {
    if (!this.enabled || !this.repoBranchBase) {
      return Promise.resolve({});
    }

    _logger.default.info(`Retrieving comparison`);

    return _axios.default.post(`${this.bundlewatchServiceStoreUrl}/lookup`, {
      repoOwner: this.repoOwner,
      repoName: this.repoName,
      repoBranch: this.repoBranchBase,
      githubAccessToken: this.githubAccessToken,
      commitSha: this.commitSha
    }, {
      timeout: 10000
    }).then(response => {
      return response.data.fileDetailsByPath;
    }).catch(error => {
      _logger.default.debug(error);

      _logger.default.error(`Unable to fetch fileDetails for baseBranch=${this.repoBranchBase} from ${this.bundlewatchServiceStoreUrl} code=${error.code || error.message}`);

      return {};
    });
  }

  saveFileDetailsForCurrentBranch({
    fileDetailsByPath,
    trackBranches
  }) {
    if (!this.enabled || !this.repoCurrentBranch) {
      return Promise.resolve();
    }

    if (this.repoBranchBase && this.repoCurrentBranch !== this.repoBranchBase) {
      _logger.default.info(`${this.repoBranchBase} !== ${this.repoCurrentBranch}, no results saved`);
    }

    if (!trackBranches.includes(this.repoCurrentBranch)) {
      _logger.default.info(`${this.repoCurrentBranch} is not a branch to track, no results saved`);

      return Promise.resolve();
    }

    _logger.default.info(`Saving results`);

    return _axios.default.post(`${this.bundlewatchServiceStoreUrl}`, {
      repoOwner: this.repoOwner,
      repoName: this.repoName,
      repoBranch: this.repoCurrentBranch,
      githubAccessToken: this.githubAccessToken,
      commitSha: this.commitSha,
      fileDetailsByPath
    }, {
      timeout: 10000
    }).catch(error => {
      _logger.default.debug(error);

      _logger.default.error(`Unable to save fileDetails for currentBranch=${this.repoCurrentBranch} code=${error.code || error.message}`);
    });
  }

}

var _default = bundlewatchService;
exports.default = _default;