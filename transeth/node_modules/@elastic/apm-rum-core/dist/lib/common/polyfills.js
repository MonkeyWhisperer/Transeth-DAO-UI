"use strict";

exports.__esModule = true;
exports.Promise = void 0;

var _promisePolyfill = _interopRequireDefault(require("promise-polyfill"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var local = {};

if (_utils.isBrowser) {
  local = window;
} else if (typeof self !== 'undefined') {
  local = self;
}

var Promise = 'Promise' in local ? local.Promise : _promisePolyfill.default;
exports.Promise = Promise;