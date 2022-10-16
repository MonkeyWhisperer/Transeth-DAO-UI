// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/@aragon/provided-connector/dist/provided-connector.esm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserRejectedRequestError = exports.ProvidedConnector = exports.NoEthereumProviderError = void 0;

var _abstractConnector = require("@web3-react/abstract-connector");

var _tinyWarning = _interopRequireDefault(require("tiny-warning"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
} // A type of promise-like that resolves synchronously and supports only one observer


var _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = /*#__PURE__*/Symbol("Symbol.iterator")) : "@@iterator"; // Asynchronously iterate through an object's values


var _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = /*#__PURE__*/Symbol("Symbol.asyncIterator")) : "@@asyncIterator"; // Asynchronously iterate on a value using it's async iterator if present, or its synchronous iterator if missing


function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
} // Asynchronously await a promise and pass the result to a finally continuation


function parseSendReturn(sendReturn) {
  return sendReturn.hasOwnProperty('result') ? sendReturn.result : sendReturn;
}

var NoEthereumProviderError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(NoEthereumProviderError, _Error);

  function NoEthereumProviderError() {
    var _this;

    _this = _Error.call(this) || this;
    _this.name = _this.constructor.name;
    _this.message = 'No Ethereum provider was passed to the constructor or found on window.ethereum.';
    return _this;
  }

  return NoEthereumProviderError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.NoEthereumProviderError = NoEthereumProviderError;

var UserRejectedRequestError = /*#__PURE__*/function (_Error2) {
  _inheritsLoose(UserRejectedRequestError, _Error2);

  function UserRejectedRequestError() {
    var _this2;

    _this2 = _Error2.call(this) || this;
    _this2.name = _this2.constructor.name;
    _this2.message = 'The user rejected the request.';
    return _this2;
  }

  return UserRejectedRequestError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.UserRejectedRequestError = UserRejectedRequestError;

var ProvidedConnector = /*#__PURE__*/function (_AbstractConnector) {
  _inheritsLoose(ProvidedConnector, _AbstractConnector);

  function ProvidedConnector(_ref) {
    var _this3;

    var _ref$provider = _ref.provider,
        provider = _ref$provider === void 0 ? window.ethereum : _ref$provider,
        supportedChainIds = _ref.supportedChainIds;
    _this3 = _AbstractConnector.call(this, {
      supportedChainIds: supportedChainIds
    }) || this;
    _this3.provider = provider;
    _this3.handleNetworkChanged = _this3.handleNetworkChanged.bind(_assertThisInitialized(_this3));
    _this3.handleChainChanged = _this3.handleChainChanged.bind(_assertThisInitialized(_this3));
    _this3.handleAccountsChanged = _this3.handleAccountsChanged.bind(_assertThisInitialized(_this3));
    _this3.handleClose = _this3.handleClose.bind(_assertThisInitialized(_this3));
    return _this3;
  }

  var _proto = ProvidedConnector.prototype;

  _proto.handleChainChanged = function handleChainChanged(chainId) {
    if ("development" !== "production") {
      console.log("Handling 'chainChanged' event with payload", chainId);
    }

    this.emitUpdate({
      chainId: chainId,
      provider: this.provider
    });
  };

  _proto.handleAccountsChanged = function handleAccountsChanged(accounts) {
    if ("development" !== "production") {
      console.log("Handling 'accountsChanged' event with payload", accounts);
    }

    if (accounts.length === 0) {
      this.emitDeactivate();
    } else {
      this.emitUpdate({
        account: accounts[0]
      });
    }
  };

  _proto.handleClose = function handleClose(code, reason) {
    if ("development" !== "production") {
      console.log("Handling 'close' event with payload", code, reason);
    }

    this.emitDeactivate();
  };

  _proto.handleNetworkChanged = function handleNetworkChanged(networkId) {
    if ("development" !== "production") {
      console.log("Handling 'networkChanged' event with payload", networkId);
    }

    this.emitUpdate({
      chainId: networkId,
      provider: this.provider
    });
  };

  _proto.activate = function activate() {
    try {
      var _temp5 = function _temp5(_result) {
        if (_exit2) return _result;

        function _temp2() {
          return _extends({
            provider: _this5.provider
          }, account ? {
            account: account
          } : {});
        }

        var _temp = function () {
          if (!account) {
            // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
            return Promise.resolve(_this5.provider.enable().then(function (sendReturn) {
              return sendReturn && parseSendReturn(sendReturn)[0];
            })).then(function (_this4$provider$enabl) {
              account = _this4$provider$enabl;
            });
          }
        }(); // if unsuccessful, try enable


        return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
      };

      var _exit2 = false;

      var _this5 = this;

      if (!_this5.provider) {
        throw new NoEthereumProviderError();
      }

      if (_this5.provider.on) {
        _this5.provider.on('chainChanged', _this5.handleChainChanged);

        _this5.provider.on('accountsChanged', _this5.handleAccountsChanged);

        _this5.provider.on('close', _this5.handleClose);

        _this5.provider.on('networkChanged', _this5.handleNetworkChanged);
      }

      if (_this5.provider.isMetaMask) {
        ;
        _this5.provider.autoRefreshOnNetworkChange = false;
      } // try to activate + get account via eth_requestAccounts


      var account;

      var _temp6 = _catch(function () {
        return Promise.resolve(_this5.provider.send('eth_requestAccounts').then(function (sendReturn) {
          return parseSendReturn(sendReturn)[0];
        })).then(function (_this4$provider$send$) {
          account = _this4$provider$send$;
        });
      }, function (error) {
        if (error.code === 4001) {
          throw new UserRejectedRequestError();
        }

        "development" !== "production" ? (0, _tinyWarning.default)(false, 'eth_requestAccounts was unsuccessful, falling back to enable') : void 0;
      });

      return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(_temp5) : _temp5(_temp6));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getProvider = function getProvider() {
    try {
      var _this7 = this;

      return Promise.resolve(_this7.provider);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getChainId = function getChainId() {
    try {
      var _temp12 = function _temp12() {
        function _temp9() {
          if (!chainId) {
            try {
              chainId = parseSendReturn(_this9.provider.send({
                method: 'net_version'
              }));
            } catch (_unused) {
              "development" !== "production" ? (0, _tinyWarning.default)(false, 'net_version v2 was unsuccessful, falling back to manual matches and static properties') : void 0;
            }
          }

          if (!chainId) {
            if (_this9.provider.isDapper) {
              chainId = parseSendReturn(_this9.provider.cachedResults.net_version);
            } else {
              chainId = _this9.provider.chainId || _this9.provider.networkVersion || _this9.provider._chainId;
            }
          }

          return chainId;
        }

        var _temp8 = function () {
          if (!chainId) {
            var _temp14 = _catch(function () {
              return Promise.resolve(_this9.provider.send('net_version').then(parseSendReturn)).then(function (_this8$provider$send$2) {
                chainId = _this8$provider$send$2;
              });
            }, function () {
              "development" !== "production" ? (0, _tinyWarning.default)(false, 'net_version was unsuccessful, falling back to net version v2') : void 0;
            });

            if (_temp14 && _temp14.then) return _temp14.then(function () {});
          }
        }();

        return _temp8 && _temp8.then ? _temp8.then(_temp9) : _temp9(_temp8);
      };

      var _this9 = this;

      if (!_this9.provider) {
        throw new NoEthereumProviderError();
      }

      var chainId;

      var _temp13 = _catch(function () {
        return Promise.resolve(_this9.provider.send('eth_chainId').then(parseSendReturn)).then(function (_this8$provider$send$) {
          chainId = _this8$provider$send$;
        });
      }, function () {
        "development" !== "production" ? (0, _tinyWarning.default)(false, 'eth_chainId was unsuccessful, falling back to net_version') : void 0;
      });

      return Promise.resolve(_temp13 && _temp13.then ? _temp13.then(_temp12) : _temp12(_temp13));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getAccount = function getAccount() {
    try {
      var _temp20 = function _temp20() {
        function _temp17() {
          if (!account) {
            account = parseSendReturn(_this11.provider.send({
              method: 'eth_accounts'
            }))[0];
          }

          return account;
        }

        var _temp16 = function () {
          if (!account) {
            var _temp22 = _catch(function () {
              return Promise.resolve(_this11.provider.enable().then(function (sendReturn) {
                return parseSendReturn(sendReturn)[0];
              })).then(function (_this10$provider$enab) {
                account = _this10$provider$enab;
              });
            }, function () {
              "development" !== "production" ? (0, _tinyWarning.default)(false, 'enable was unsuccessful, falling back to eth_accounts v2') : void 0;
            });

            if (_temp22 && _temp22.then) return _temp22.then(function () {});
          }
        }();

        return _temp16 && _temp16.then ? _temp16.then(_temp17) : _temp17(_temp16);
      };

      var _this11 = this;

      if (!_this11.provider) {
        throw new NoEthereumProviderError();
      }

      var account;

      var _temp21 = _catch(function () {
        return Promise.resolve(_this11.provider.send('eth_accounts').then(function (sendReturn) {
          return parseSendReturn(sendReturn)[0];
        })).then(function (_this10$provider$send) {
          account = _this10$provider$send;
        });
      }, function () {
        "development" !== "production" ? (0, _tinyWarning.default)(false, 'eth_accounts was unsuccessful, falling back to enable') : void 0;
      });

      return Promise.resolve(_temp21 && _temp21.then ? _temp21.then(_temp20) : _temp20(_temp21));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.deactivate = function deactivate() {
    if (this.provider && this.provider.removeListener) {
      this.provider.removeListener('chainChanged', this.handleChainChanged);
      this.provider.removeListener('accountsChanged', this.handleAccountsChanged);
      this.provider.removeListener('close', this.handleClose);
      this.provider.removeListener('networkChanged', this.handleNetworkChanged);
    }
  };

  _proto.isAuthorized = function isAuthorized() {
    try {
      var _this13 = this;

      if (!_this13.provider) {
        return Promise.resolve(false);
      }

      return Promise.resolve(_catch(function () {
        return Promise.resolve(_this13.provider.send('eth_accounts').then(function (sendReturn) {
          if (parseSendReturn(sendReturn).length > 0) {
            return true;
          } else {
            return false;
          }
        }));
      }, function () {
        return false;
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return ProvidedConnector;
}(_abstractConnector.AbstractConnector);

exports.ProvidedConnector = ProvidedConnector;
},{"@web3-react/abstract-connector":"../node_modules/@web3-react/abstract-connector/dist/abstract-connector.esm.js","tiny-warning":"../node_modules/tiny-warning/dist/tiny-warning.esm.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "58597" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js"], null)
//# sourceMappingURL=/provided-connector.esm.287d3d18.js.map