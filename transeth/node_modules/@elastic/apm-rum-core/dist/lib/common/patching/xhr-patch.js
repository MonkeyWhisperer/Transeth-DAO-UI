"use strict";

exports.__esModule = true;
exports.patchXMLHttpRequest = patchXMLHttpRequest;

var _patchUtils = require("./patch-utils");

var _constants = require("../constants");

function patchXMLHttpRequest(callback) {
  var XMLHttpRequestPrototype = XMLHttpRequest.prototype;

  if (!XMLHttpRequestPrototype || !XMLHttpRequestPrototype[_constants.ADD_EVENT_LISTENER_STR]) {
    return;
  }

  var READY_STATE_CHANGE = 'readystatechange';
  var LOAD = 'load';
  var ERROR = 'error';
  var TIMEOUT = 'timeout';
  var ABORT = 'abort';

  function invokeTask(task, status) {
    if (task.state !== _constants.INVOKE) {
      task.state = _constants.INVOKE;
      task.data.status = status;
      callback(_constants.INVOKE, task);
    }
  }

  function scheduleTask(task) {
    if (task.state === _constants.SCHEDULE) {
      return;
    }

    task.state = _constants.SCHEDULE;
    callback(_constants.SCHEDULE, task);
    var target = task.data.target;

    function addListener(name) {
      target[_constants.ADD_EVENT_LISTENER_STR](name, function (_ref) {
        var type = _ref.type;

        if (type === READY_STATE_CHANGE) {
          if (target.readyState === 4 && target.status !== 0) {
            invokeTask(task, 'success');
          }
        } else {
          var status = type === LOAD ? 'success' : type;
          invokeTask(task, status);
        }
      });
    }

    addListener(READY_STATE_CHANGE);
    addListener(LOAD);
    addListener(TIMEOUT);
    addListener(ERROR);
    addListener(ABORT);
  }

  var openNative = (0, _patchUtils.patchMethod)(XMLHttpRequestPrototype, 'open', function () {
    return function (self, args) {
      if (!self[_patchUtils.XHR_IGNORE]) {
        self[_patchUtils.XHR_METHOD] = args[0];
        self[_patchUtils.XHR_URL] = args[1];
        self[_patchUtils.XHR_SYNC] = args[2] === false;
      }

      return openNative.apply(self, args);
    };
  });
  var sendNative = (0, _patchUtils.patchMethod)(XMLHttpRequestPrototype, 'send', function () {
    return function (self, args) {
      if (self[_patchUtils.XHR_IGNORE]) {
        return sendNative.apply(self, args);
      }

      var task = {
        source: _constants.XMLHTTPREQUEST,
        state: '',
        type: 'macroTask',
        data: {
          target: self,
          method: self[_patchUtils.XHR_METHOD],
          sync: self[_patchUtils.XHR_SYNC],
          url: self[_patchUtils.XHR_URL],
          status: ''
        }
      };

      try {
        scheduleTask(task);
        return sendNative.apply(self, args);
      } catch (e) {
        invokeTask(task, ERROR);
        throw e;
      }
    };
  });
}