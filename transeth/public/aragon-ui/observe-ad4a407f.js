'use strict';

var _extends = require('./extends-5150c1f4.js');
var getPrototypeOf = require('./getPrototypeOf-e2e819f3.js');
var defineProperty = require('./defineProperty-fdbd3c46.js');
var React = require('react');
var getDisplayName = require('./getDisplayName-7f913e84.js');
var environment = require('./environment.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = getPrototypeOf._getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = getPrototypeOf._getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return getPrototypeOf._possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var observe = function observe(_observe) {
  var initialState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function (Component) {
    var _class, _temp;

    return _temp = _class = /*#__PURE__*/function (_React$Component) {
      getPrototypeOf._inherits(_class, _React$Component);

      var _super = _createSuper(_class);

      function _class() {
        var _this;

        getPrototypeOf._classCallCheck(this, _class);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _super.call.apply(_super, [this].concat(args));

        defineProperty._defineProperty(getPrototypeOf._assertThisInitialized(_this), "state", initialState);

        defineProperty._defineProperty(getPrototypeOf._assertThisInitialized(_this), "subscribe", function (observable) {
          if (observable) {
            _this.setState({
              subscription: _observe(observable).subscribe(function (state) {
                _this.setState(state);
              })
            });
          }
        });

        defineProperty._defineProperty(getPrototypeOf._assertThisInitialized(_this), "unsubscribe", function () {
          _this.state.subscription && _this.state.subscription.unsubscribe();
        });

        return _this;
      }

      getPrototypeOf._createClass(_class, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          this.subscribe(this.props.observable);
        }
      }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(_ref) {
          var nextObservable = _ref.observable;
          var observable = this.props.observable; // If a new observable gets passed in, unsubscribe from the old and subscribe to the new

          if (nextObservable !== observable) {
            this.unsubscribe();
            this.subscribe(nextObservable);
          }
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this.unsubscribe();
        }
      }, {
        key: "render",
        value: function render() {
          environment.warnOnce('observe()', 'observe() is deprecated. If you are using it with @aragon/api, using @aragon/api-react is now recommended instead.');

          var props = _extends._extends({}, this.props); // Don't pass down the given observable


          delete props.observable;
          return /*#__PURE__*/React__default['default'].createElement(Component, _extends._extends({}, this.state, props));
        }
      }]);

      return _class;
    }(React__default['default'].Component), defineProperty._defineProperty(_class, "displayName", "Observe(".concat(getDisplayName.getDisplayName(Component), ")")), defineProperty._defineProperty(_class, "propTypes", {
      observable: function observable(_ref2, _, componentName) {
        var _observable = _ref2.observable;

        if (_observable && typeof _observable.subscribe !== 'function') {
          throw new Error("Invalid prop `observable` supplied to `".concat(componentName, "` ") + '(wrapped by `observe()`). ' + '`observable` must be an RxJS Observable-like object. ' + "Given ".concat(_observable, " instead."));
        }
      }
    }), _temp;
  };
};

exports.observe = observe;
//# sourceMappingURL=observe-ad4a407f.js.map
