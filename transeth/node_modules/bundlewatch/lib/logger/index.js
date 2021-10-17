"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const stdout = console.log; // eslint-disable-line no-console

const stderr = console.error; // eslint-disable-line no-console

const debug = error => {
  if (process.env.DEBUG) {
    const debugObject = error.response ? error.response.data : error.response;
    stdout(_chalk.default.greenBright(`[DEBUG] ${error.message}`));
    stderr(error);

    try {
      stderr(JSON.stringify(debugObject, undefined, 2));
    } catch (e) {// eat it
    }
  }
};

const log = message => {
  stdout(message);
};

const info = message => {
  stdout(_chalk.default.cyan(`[INFO] ${message}`));
};

const warn = message => {
  stdout(_chalk.default.yellow(`[WARNING] ${message}`));
};

const error = (messsage, errorStack) => {
  if (errorStack) {
    stdout(errorStack);
  }

  stderr(_chalk.default.red(`[ERROR] ${messsage}`));
};

const fatal = (messsage, errorStack) => {
  if (errorStack) {
    stdout(errorStack);
  }

  stderr(_chalk.default.black.bgRed(`[FATAL] ${messsage}`));
};

var _default = {
  debug,
  log,
  info,
  warn,
  error,
  fatal
};
exports.default = _default;