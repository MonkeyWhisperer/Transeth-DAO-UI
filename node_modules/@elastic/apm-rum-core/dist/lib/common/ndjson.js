"use strict";

exports.__esModule = true;
exports.default = void 0;

var NDJSON = function () {
  function NDJSON() {}

  NDJSON.stringify = function stringify(object) {
    return JSON.stringify(object) + '\n';
  };

  return NDJSON;
}();

var _default = NDJSON;
exports.default = _default;