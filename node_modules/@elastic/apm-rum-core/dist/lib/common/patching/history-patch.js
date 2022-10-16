"use strict";

exports.__esModule = true;
exports.patchHistory = patchHistory;

var _constants = require("../constants");

function patchHistory(callback) {
  if (!window.history) {
    return;
  }

  var nativePushState = history.pushState;

  if (typeof nativePushState === 'function') {
    history.pushState = function (state, title, url) {
      var task = {
        source: _constants.HISTORY,
        data: {
          state: state,
          title: title,
          url: url
        }
      };
      callback(_constants.INVOKE, task);
      nativePushState.apply(this, arguments);
    };
  }
}