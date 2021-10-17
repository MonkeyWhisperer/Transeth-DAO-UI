"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class ValidationError {
  constructor(message) {
    this.message = message;
    this.type = 'ValidationError';
  }

}

var _default = ValidationError;
exports.default = _default;