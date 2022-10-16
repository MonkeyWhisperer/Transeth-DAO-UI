"use strict";

exports.__esModule = true;
exports.truncate = truncate;
exports.truncateModel = truncateModel;
exports.RESPONSE_MODEL = exports.METADATA_MODEL = exports.ERROR_MODEL = exports.TRANSACTION_MODEL = exports.SPAN_MODEL = void 0;

var _constants = require("./constants");

var METADATA_MODEL = {
  service: {
    name: [_constants.KEYWORD_LIMIT, true],
    version: true,
    agent: {
      version: [_constants.KEYWORD_LIMIT, true]
    },
    environment: true
  },
  labels: {
    '*': true
  }
};
exports.METADATA_MODEL = METADATA_MODEL;
var RESPONSE_MODEL = {
  '*': true,
  headers: {
    '*': true
  }
};
exports.RESPONSE_MODEL = RESPONSE_MODEL;
var DESTINATION_MODEL = {
  address: [_constants.KEYWORD_LIMIT],
  service: {
    '*': [_constants.KEYWORD_LIMIT, true]
  }
};
var CONTEXT_MODEL = {
  user: {
    id: true,
    email: true,
    username: true
  },
  tags: {
    '*': true
  },
  http: {
    response: RESPONSE_MODEL
  },
  destination: DESTINATION_MODEL,
  response: RESPONSE_MODEL
};
var SPAN_MODEL = {
  name: [_constants.KEYWORD_LIMIT, true],
  type: [_constants.KEYWORD_LIMIT, true],
  id: [_constants.KEYWORD_LIMIT, true],
  trace_id: [_constants.KEYWORD_LIMIT, true],
  parent_id: [_constants.KEYWORD_LIMIT, true],
  transaction_id: [_constants.KEYWORD_LIMIT, true],
  subtype: true,
  action: true,
  context: CONTEXT_MODEL
};
exports.SPAN_MODEL = SPAN_MODEL;
var TRANSACTION_MODEL = {
  name: true,
  parent_id: true,
  type: [_constants.KEYWORD_LIMIT, true],
  id: [_constants.KEYWORD_LIMIT, true],
  trace_id: [_constants.KEYWORD_LIMIT, true],
  span_count: {
    started: [_constants.KEYWORD_LIMIT, true]
  },
  context: CONTEXT_MODEL
};
exports.TRANSACTION_MODEL = TRANSACTION_MODEL;
var ERROR_MODEL = {
  id: [_constants.KEYWORD_LIMIT, true],
  trace_id: true,
  transaction_id: true,
  parent_id: true,
  culprit: true,
  exception: {
    type: true
  },
  transaction: {
    type: true
  },
  context: CONTEXT_MODEL
};
exports.ERROR_MODEL = ERROR_MODEL;

function truncate(value, limit, required, placeholder) {
  if (limit === void 0) {
    limit = _constants.KEYWORD_LIMIT;
  }

  if (required === void 0) {
    required = false;
  }

  if (placeholder === void 0) {
    placeholder = 'N/A';
  }

  if (required && isEmpty(value)) {
    value = placeholder;
  }

  if (typeof value === 'string') {
    return value.substring(0, limit);
  }

  return value;
}

function isEmpty(value) {
  return value == null || value === '' || typeof value === 'undefined';
}

function replaceValue(target, key, currModel) {
  var value = truncate(target[key], currModel[0], currModel[1]);

  if (isEmpty(value)) {
    delete target[key];
    return;
  }

  target[key] = value;
}

function truncateModel(model, target, childTarget) {
  if (model === void 0) {
    model = {};
  }

  if (childTarget === void 0) {
    childTarget = target;
  }

  var keys = Object.keys(model);
  var emptyArr = [];

  var _loop = function _loop(i) {
    var currKey = keys[i];
    var currModel = model[currKey] === true ? emptyArr : model[currKey];

    if (!Array.isArray(currModel)) {
      truncateModel(currModel, target, childTarget[currKey]);
    } else {
      if (currKey === '*') {
        Object.keys(childTarget).forEach(function (key) {
          return replaceValue(childTarget, key, currModel);
        });
      } else {
        replaceValue(childTarget, currKey, currModel);
      }
    }
  };

  for (var i = 0; i < keys.length; i++) {
    _loop(i);
  }

  return target;
}