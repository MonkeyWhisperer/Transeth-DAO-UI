'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _extends = require('./extends-5150c1f4.js');
var objectWithoutProperties = require('./objectWithoutProperties-5d2c0728.js');
var _styled = require('styled-components');
var React = require('react');
var index = require('./index-37353731.js');
var Theme = require('./Theme.js');
var css = require('./css.js');
var constants = require('./constants.js');
var textStyles = require('./text-styles.js');
require('./_commonjsHelpers-1b94f6bc.js');
require('./slicedToArray-bb07ac16.js');
require('./unsupportedIterableToArray-d5a3ce67.js');
require('./defineProperty-fdbd3c46.js');
require('./theme-dark.js');
require('./theme-light.js');
require('./environment.js');
require('./miscellaneous.js');
require('./color.js');
require('./getPrototypeOf-e2e819f3.js');
require('./toConsumableArray-0f2dcfe0.js');
require('./font.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _styled__default = /*#__PURE__*/_interopDefaultLegacy(_styled);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

var MODE_INDICATOR = 'indicator';
var MODE_IDENTIFIER = 'identifier';
var MODE_NEW = 'new';
var MODE_ACTIVITY = 'activity';
var SIZE_NORMAL = 'normal';
var SIZE_SMALL = 'small';
var COUNT_DEFAULT = 2;

function useMode(mode) {
  var theme = Theme.useTheme();

  if (mode === MODE_IDENTIFIER) {
    return {
      background: theme.tagIdentifier,
      color: theme.tagIdentifierContent,
      size: SIZE_NORMAL
    };
  }

  if (mode === MODE_NEW) {
    return {
      background: theme.tagNew,
      color: theme.tagNewContent,
      size: SIZE_NORMAL
    };
  }

  if (mode === MODE_ACTIVITY) {
    return {
      background: theme.tagActivity,
      color: theme.tagActivityContent,
      size: SIZE_SMALL
    };
  } // mode === MODE_INDICATOR (default)


  return {
    background: theme.tagIndicator,
    color: theme.tagIndicatorContent,
    size: SIZE_NORMAL
  };
}

function getSize(size, _ref) {
  var uppercase = _ref.uppercase,
      discMode = _ref.discMode,
      iconAndLabel = _ref.iconAndLabel;

  if (size === SIZE_SMALL) {
    return "\n      min-width: ".concat(2 * constants.GU, "px;\n      width: ").concat(discMode ? "".concat(2 * constants.GU, "px") : 'auto', ";\n      height: ").concat(2 * constants.GU, "px;\n      padding: ").concat(discMode ? '0' : "0 ".concat(0.5 * constants.GU, "px"), ";\n      padding-top: ").concat(uppercase ? '0.5px' : 0, ";\n      border-radius: ").concat(2 * constants.GU, "px;\n      ").concat(textStyles.textStyle('label3'), ";\n      font-weight: 600;\n    ");
  } // normal


  return "\n    min-width: ".concat(2.5 * constants.GU, "px;\n    width: ").concat(discMode ? "".concat(3 * constants.GU, "px") : 'auto', ";\n    height: ").concat(2.5 * constants.GU, "px;\n    padding: ").concat(discMode ? '0' : "0 ".concat(1.5 * constants.GU, "px"), " ;\n    padding-top: ").concat(uppercase ? '1px' : 0, ";\n    ").concat(iconAndLabel ? "padding-left: ".concat(1.25 * constants.GU, "px") : '', ";\n    border-radius: ").concat(2.5 * constants.GU, "px;\n    ").concat(textStyles.textStyle('label2'), ";\n    font-weight: 600;\n  ");
}

function useLabel(_ref2) {
  var _ref2$label = _ref2.label,
      label = _ref2$label === void 0 ? '' : _ref2$label,
      limitDigits = _ref2.limitDigits;
  var finalLabel = React.useMemo(function () {
    if (limitDigits === false) {
      return typeof label === 'number' ? String(label) : label || '';
    }

    var digits = typeof limitDigits === 'number' ? limitDigits : COUNT_DEFAULT;
    var parsed = parseInt(label, 10);

    if (isNaN(parsed)) {
      return label || '';
    }

    var max = Math.pow(10, digits) - 1;
    var formattedValue = parsed > max ? "".concat(max, "+") : parsed;
    return String(formattedValue);
  }, [label, limitDigits]);
  return finalLabel;
}

var _StyledSpan = _styled__default['default']("span").withConfig({
  displayName: "Tag___StyledSpan",
  componentId: "sc-875dmt-0"
})(["display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;", ";", ";color:", ";background:", ";", ";"], function (p) {
  return p._css;
}, function (p) {
  return p._css2;
}, function (p) {
  return p._css3;
}, function (p) {
  return p._css4;
}, css.unselectable);

var _StyledSpan2 = _styled__default['default']("span").withConfig({
  displayName: "Tag___StyledSpan2",
  componentId: "sc-875dmt-1"
})(["display:flex;align-items:center;margin-right:", "px;"], function (p) {
  return p._css5;
});

var _StyledSpan3 = _styled__default['default']("span").withConfig({
  displayName: "Tag___StyledSpan3",
  componentId: "sc-875dmt-2"
})(["overflow:hidden;text-overflow:ellipsis;margin-top:", ";"], function (p) {
  return p._css6;
});

function Tag(_ref3) {
  var background = _ref3.background,
      children = _ref3.children,
      color = _ref3.color,
      limitDigits = _ref3.limitDigits,
      icon = _ref3.icon,
      label = _ref3.label,
      mode = _ref3.mode,
      size = _ref3.size,
      uppercase = _ref3.uppercase,
      props = objectWithoutProperties._objectWithoutProperties(_ref3, ["background", "children", "color", "limitDigits", "icon", "label", "mode", "size", "uppercase"]);

  if ((icon || label !== undefined) && children !== undefined) {
    throw new Error('Tag: you cannot use icon or label with children.');
  }

  var modeProps = useMode(mode);
  var finalSize = size || modeProps.size;
  var finalLabel = useLabel({
    label: label !== undefined ? label : children,
    limitDigits: limitDigits
  });
  var sizeStyles = getSize(finalSize, {
    uppercase: uppercase,
    discMode: // icon only
    icon && !finalLabel || // label only, using 1 or 0 chars
    !icon && typeof finalLabel === 'string' && finalLabel.length < 2,
    iconAndLabel: icon && finalLabel
  }); // Slightly tweak the alignment when there are no descenders,
  // to make the characters look more aligned.

  var alignmentCorrection = finalSize === SIZE_NORMAL && (uppercase || typeof label === 'number' || limitDigits !== false);
  return /*#__PURE__*/React__default['default'].createElement(_StyledSpan, _extends._extends({}, props, {
    _css: sizeStyles,
    _css2: !uppercase ? 'text-transform: unset' : '',
    _css3: color || modeProps.color,
    _css4: background || modeProps.background
  }), icon && /*#__PURE__*/React__default['default'].createElement(_StyledSpan2, {
    _css5: finalLabel ? 0.25 * constants.GU : 0
  }, icon), /*#__PURE__*/React__default['default'].createElement(_StyledSpan3, {
    _css6: alignmentCorrection ? '1px' : '0'
  }, finalLabel));
}

Tag.propTypes = {
  background: index.propTypes.string,
  children: index.propTypes.node,
  color: index.propTypes.string,
  limitDigits: index.propTypes.oneOfType([index.propTypes.bool, index.propTypes.number]),
  icon: index.propTypes.node,
  label: index.propTypes.oneOfType([index.propTypes.node, index.propTypes.number]),
  mode: index.propTypes.oneOf([MODE_IDENTIFIER, MODE_NEW, MODE_INDICATOR, MODE_ACTIVITY]),
  size: index.propTypes.oneOf([SIZE_NORMAL, SIZE_SMALL]),
  uppercase: index.propTypes.bool
};
Tag.defaultProps = {
  uppercase: true,
  limitDigits: false
};

exports.default = Tag;
//# sourceMappingURL=Tag.js.map
