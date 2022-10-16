"use strict";

exports.__esModule = true;
exports.state = exports.__DEV__ = void 0;

var __DEV__ = process.env.NODE_ENV !== 'production';

exports.__DEV__ = __DEV__;
var state = {
  bootstrapTime: null,
  lastHiddenStart: Number.MIN_SAFE_INTEGER
};
exports.state = state;