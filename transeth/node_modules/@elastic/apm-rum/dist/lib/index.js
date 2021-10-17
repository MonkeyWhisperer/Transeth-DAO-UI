"use strict";

exports.__esModule = true;
exports.apm = exports.apmBase = exports.init = exports.default = void 0;

var _apmRumCore = require("@elastic/apm-rum-core");

var _apmBase = _interopRequireDefault(require("./apm-base"));

exports.ApmBase = _apmBase.default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getApmBase() {
  if (_apmRumCore.isBrowser && window.elasticApm) {
    return window.elasticApm;
  }

  var enabled = (0, _apmRumCore.bootstrap)();
  var serviceFactory = (0, _apmRumCore.createServiceFactory)();
  var apmBase = new _apmBase.default(serviceFactory, !enabled);

  if (_apmRumCore.isBrowser) {
    window.elasticApm = apmBase;
  }

  return apmBase;
}

var apmBase = getApmBase();
exports.apm = exports.apmBase = apmBase;
var init = apmBase.init.bind(apmBase);
exports.init = init;
var _default = init;
exports.default = _default;