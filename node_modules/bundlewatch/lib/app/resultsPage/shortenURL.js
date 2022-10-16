"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _logger = _interopRequireDefault(require("../../logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const API_KEY = 'AIzaSyBhfxTjDFr98q7w7Us9x0Uxk34PgdkW2WI';
const DOMAIN_BASE = 'ja2r7.app.goo.gl';

const shortenURL = url => {
  return _axios.default.post(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${API_KEY}`, {
    dynamicLinkInfo: {
      dynamicLinkDomain: DOMAIN_BASE,
      link: url
    }
  }, {
    timeout: 5000
  }).then(response => {
    if (response.data && response.data.shortLink) {
      return response.data.shortLink;
    }

    _logger.default.error('Unable to shorten URL, no URL found in response');

    _logger.default.debug(response.data);

    return url;
  }).catch(error => {
    _logger.default.debug(error);

    _logger.default.error(`Unable to shorten URL code=${error.code || error.message}`);

    return url;
  });
};

var _default = shortenURL;
exports.default = _default;