"use strict";

exports.__esModule = true;
exports.createTracer = createTracer;
exports.default = void 0;

var _index = require("./index");

exports.init = _index.init;
exports.apm = _index.apm;
exports.apmBase = _index.apmBase;
exports.ApmBase = _index.ApmBase;

var _tracer = require("opentracing/lib/tracer");

var _apmRumCore = require("@elastic/apm-rum-core");

function createTracer(apmBase) {
  if (apmBase._disable) {
    return new _tracer.Tracer();
  }

  return (0, _apmRumCore.createTracer)(apmBase.serviceFactory);
}

if (typeof window !== 'undefined' && window.elasticApm) {
  window.elasticApm.createTracer = createTracer.bind(window.elasticApm, window.elasticApm);
}

var _default = createTracer;
exports.default = _default;