"use strict";

exports.__esModule = true;
exports.apmSymbol = apmSymbol;
exports.patchMethod = patchMethod;
exports.XHR_METHOD = exports.XHR_URL = exports.XHR_SYNC = exports.XHR_IGNORE = exports.globalState = void 0;
var globalState = {
  fetchInProgress: false
};
exports.globalState = globalState;

function apmSymbol(name) {
  return '__apm_symbol__' + name;
}

function isPropertyWritable(propertyDesc) {
  if (!propertyDesc) {
    return true;
  }

  if (propertyDesc.writable === false) {
    return false;
  }

  return !(typeof propertyDesc.get === 'function' && typeof propertyDesc.set === 'undefined');
}

function attachOriginToPatched(patched, original) {
  patched[apmSymbol('OriginalDelegate')] = original;
}

function patchMethod(target, name, patchFn) {
  var proto = target;

  while (proto && !proto.hasOwnProperty(name)) {
    proto = Object.getPrototypeOf(proto);
  }

  if (!proto && target[name]) {
    proto = target;
  }

  var delegateName = apmSymbol(name);
  var delegate;

  if (proto && !(delegate = proto[delegateName])) {
    delegate = proto[delegateName] = proto[name];
    var desc = proto && Object.getOwnPropertyDescriptor(proto, name);

    if (isPropertyWritable(desc)) {
      var patchDelegate = patchFn(delegate, delegateName, name);

      proto[name] = function () {
        return patchDelegate(this, arguments);
      };

      attachOriginToPatched(proto[name], delegate);
    }
  }

  return delegate;
}

var XHR_IGNORE = apmSymbol('xhrIgnore');
exports.XHR_IGNORE = XHR_IGNORE;
var XHR_SYNC = apmSymbol('xhrSync');
exports.XHR_SYNC = XHR_SYNC;
var XHR_URL = apmSymbol('xhrURL');
exports.XHR_URL = XHR_URL;
var XHR_METHOD = apmSymbol('xhrMethod');
exports.XHR_METHOD = XHR_METHOD;