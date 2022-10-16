"use strict";

exports.__esModule = true;
exports.ServiceFactory = exports.serviceCreators = void 0;

var _apmServer = _interopRequireDefault(require("./apm-server"));

var _configService = _interopRequireDefault(require("./config-service"));

var _loggingService = _interopRequireDefault(require("./logging-service"));

var _constants = require("./constants");

var _state = require("../state");

var _serviceCreators;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var serviceCreators = (_serviceCreators = {}, _serviceCreators[_constants.CONFIG_SERVICE] = function () {
  return new _configService.default();
}, _serviceCreators[_constants.LOGGING_SERVICE] = function () {
  return new _loggingService.default({
    prefix: '[Elastic APM] '
  });
}, _serviceCreators[_constants.APM_SERVER] = function (factory) {
  var _factory$getService = factory.getService([_constants.CONFIG_SERVICE, _constants.LOGGING_SERVICE]),
      configService = _factory$getService[0],
      loggingService = _factory$getService[1];

  return new _apmServer.default(configService, loggingService);
}, _serviceCreators);
exports.serviceCreators = serviceCreators;

var ServiceFactory = function () {
  function ServiceFactory() {
    this.instances = {};
    this.initialized = false;
  }

  var _proto = ServiceFactory.prototype;

  _proto.init = function init() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    var configService = this.getService(_constants.CONFIG_SERVICE);
    configService.init();

    var _this$getService = this.getService([_constants.LOGGING_SERVICE, _constants.APM_SERVER]),
        loggingService = _this$getService[0],
        apmServer = _this$getService[1];

    configService.events.observe(_constants.CONFIG_CHANGE, function () {
      var logLevel = configService.get('logLevel');
      loggingService.setLevel(logLevel);
    });
    apmServer.init();
  };

  _proto.getService = function getService(name) {
    var _this = this;

    if (typeof name === 'string') {
      if (!this.instances[name]) {
        if (typeof serviceCreators[name] === 'function') {
          this.instances[name] = serviceCreators[name](this);
        } else if (_state.__DEV__) {
          console.log('Cannot get service, No creator for: ' + name);
        }
      }

      return this.instances[name];
    } else if (Array.isArray(name)) {
      return name.map(function (n) {
        return _this.getService(n);
      });
    }
  };

  return ServiceFactory;
}();

exports.ServiceFactory = ServiceFactory;