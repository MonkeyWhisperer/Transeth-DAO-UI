'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _extends = require('./extends-5150c1f4.js');
var objectWithoutProperties = require('./objectWithoutProperties-5d2c0728.js');
var _styled = require('styled-components');
var React = require('react');
var index = require('./index-37353731.js');
var ButtonBase = require('./ButtonBase.js');
var Theme = require('./Theme.js');
var constants = require('./constants.js');
require('./_commonjsHelpers-1b94f6bc.js');
require('./slicedToArray-bb07ac16.js');
require('./unsupportedIterableToArray-d5a3ce67.js');
require('./defineProperty-fdbd3c46.js');
require('./FocusVisible.js');
require('./getPrototypeOf-e2e819f3.js');
require('./keycodes.js');
require('./css.js');
require('./environment.js');
require('./miscellaneous.js');
require('./text-styles.js');
require('./font.js');
require('./theme-dark.js');
require('./theme-light.js');
require('./color.js');
require('./toConsumableArray-0f2dcfe0.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _styled__default = /*#__PURE__*/_interopDefaultLegacy(_styled);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

var _StyledButtonBase = _styled__default['default'](ButtonBase['default']).withConfig({
  displayName: "DiscButton___StyledButtonBase",
  componentId: "sc-1ay99f2-0"
})(["display:flex;align-items:center;justify-content:center;width:", "px;height:", "px;background:", ";color:", ";border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.25);transition-property:transform,box-shadow;transition-duration:50ms;transition-timing-function:ease-in-out;&:active{transform:translateY(1px);box-shadow:0px 1px 3px rgba(0,0,0,0.125);}"], function (p) {
  return p._css;
}, function (p) {
  return p._css2;
}, function (p) {
  return p._css3;
}, function (p) {
  return p._css4;
});

var DiscButton = /*#__PURE__*/React__default['default'].forwardRef(function (_ref, ref) {
  var children = _ref.children,
      description = _ref.description,
      size = _ref.size,
      props = objectWithoutProperties._objectWithoutProperties(_ref, ["children", "description", "size"]);

  var theme = Theme.useTheme();
  return /*#__PURE__*/React__default['default'].createElement(_StyledButtonBase, _extends._extends({
    ref: ref,
    focusRingSpacing: 4,
    focusRingRadius: size,
    title: description
  }, props, {
    _css: size,
    _css2: size,
    _css3: theme.help,
    _css4: theme.helpContent
  }), children);
});
DiscButton.propTypes = {
  children: index.propTypes.node.isRequired,
  description: index.propTypes.string.isRequired,
  size: index.propTypes.number
};
DiscButton.defaultProps = {
  size: 5 * constants.GU
};

exports.default = DiscButton;
//# sourceMappingURL=DiscButton.js.map
