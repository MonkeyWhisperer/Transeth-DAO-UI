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
})({"../node_modules/eth-provider/resolve/index.js":[function(require,module,exports) {
const getProtocol = location => {
  if (location === 'injected') return 'injected'
  if (location.endsWith('.ipc')) return 'ipc'
  if (location.startsWith('wss://') || location.startsWith('ws://')) return 'ws'
  if (location.startsWith('https://') || location.startsWith('http://')) return 'http'
  return ''
}

module.exports = (targets, presets) => {
  return [].concat(...[].concat(targets).map(provider => {
    if (presets[provider]) {
      return presets[provider].map(location => ({ type: provider, location, protocol: getProtocol(location) }))
    } else {
      return { type: 'custom', location: provider, protocol: getProtocol(provider) }
    }
  })).filter(provider => {
    if (provider.protocol || provider.type === 'injected') {
      return true
    } else {
      console.log('eth-provider | Invalid provider preset/location: "' + provider.location + '"')
      return false
    }
  })
}

},{}],"../node_modules/ethereum-provider/index.js":[function(require,module,exports) {
const EventEmitter = require('events')

class EthereumProvider extends EventEmitter {
  constructor (connection) {
    super()
    this.connected = false
    this.nextId = 0
    this.promises = {}
    this.subscriptions = []
    this.connection = connection
    this.connection.on('connect', () => this.checkConnection())
    this.connection.on('close', () => this.emit('close'))
    this.connection.on('payload', payload => {
      const { id, method, error, result } = payload
      if (typeof id !== 'undefined') {
        if (this.promises[id]) { // Fulfill promise
          payload.error ? this.promises[id].reject(error) : this.promises[id].resolve(result)
          delete this.promises[id]
        }
      } else if (method && method.indexOf('_subscription') > -1) { // Emit subscription result
        this.emit(payload.params.subscription, payload.params.result)
        this.emit(method, payload.params) // Latest EIP-1193
        this.emit('data', payload) // Backwards Compatibility
      }
    })
    this.on('newListener', (event, listener) => {
      if (event === 'networkChanged') {
        if (!this.attemptedNetworkSubscription && this.connected) this.startNetworkSubscription()
      } else if (event === 'accountsChanged') {
        if (!this.attemptedAccountsSubscription && this.connected) this.startAccountsSubscription()
      }
    })
  }
  async checkConnection () {
    try {
      this.emit('connect', await this._send('net_version'))
      this.connected = true
      if (this.listenerCount('networkChanged') && !this.attemptedNetworkSubscription) this.startNetworkSubscription()
      if (this.listenerCount('accountsChanged') && !this.attemptedAccountsSubscription) this.startAccountsSubscription()
    } catch (e) {
      this.connected = false
    }
  }
  async startNetworkSubscription () {
    this.attemptedNetworkSubscription = true
    try {
      let networkChanged = await this.subscribe('eth_subscribe', 'networkChanged')
      this.on(networkChanged, netId => this.emit('networkChanged', netId))
    } catch (e) {
      console.warn('Unable to subscribe to networkChanged', e)
    }
  }
  async startAccountsSubscription () {
    this.attemptedAccountsSubscription = true
    try {
      let accountsChanged = await this.subscribe('eth_subscribe', 'accountsChanged')
      this.on(accountsChanged, accounts => this.emit('accountsChanged', accounts))
    } catch (e) {
      console.warn('Unable to subscribe to accountsChanged', e)
    }
  }
  enable () {
    return new Promise((resolve, reject) => {
      this._send('eth_accounts').then(accounts => {
        if (accounts.length > 0) {
          this.accounts = accounts
          this.coinbase = accounts[0]
          this.emit('enable')
          resolve(accounts)
        } else {
          const err = new Error('User Denied Full Provider')
          err.code = 4001
          reject(err)
        }
      }).catch(reject)
    })
  }
  _send (method, params = []) {
    if (!method || typeof method !== 'string') return new Error('Method is not a valid string.')
    if (!(params instanceof Array)) return new Error('Params is not a valid array.')
    const payload = { jsonrpc: '2.0', id: this.nextId++, method, params }
    const promise = new Promise((resolve, reject) => { this.promises[payload.id] = { resolve, reject } })
    this.connection.send(payload)
    return promise
  }
  send (...args) { // Send can be clobbered, proxy sendPromise for backwards compatibility
    return this._send(...args)
  }
  _sendBatch (requests) {
    return Promise.all(requests.map(payload => this._send(payload.method, payload.params)))
  }
  subscribe (type, method, params = []) {
    return this._send(type, [method, ...params]).then(id => {
      this.subscriptions.push(id)
      return id
    })
  }
  unsubscribe (type, id) {
    return this._send(type, [id]).then(success => {
      if (success) {
        this.subscriptions = this.subscriptions.filter(_id => _id !== id) // Remove subscription
        this.removeAllListeners(id) // Remove listeners
        return success
      }
    })
  }
  sendAsync (payload, cb) { // Backwards Compatibility
    if (!cb || typeof cb !== 'function') return cb(new Error('Invalid or undefined callback provided to sendAsync'))
    if (!payload) return cb(new Error('Invalid Payload'))
    // sendAsync can be called with an array for batch requests used by web3.js 0.x
    // this is not part of EIP-1193's backwards compatibility but we still want to support it
    if (payload instanceof Array) {
      return this.sendAsyncBatch(payload, cb)
    } else {
      return this._send(payload.method, payload.params).then(result => {
        cb(null, { id: payload.id, jsonrpc: payload.jsonrpc, result })
      }).catch(err => {
        cb(err)
      })
    }
  }
  sendAsyncBatch (payload, cb) {
    return this._sendBatch(payload).then((results) => {
      let result = results.map((entry, index) => {
        return { id: payload[index].id, jsonrpc: payload[index].jsonrpc, result: entry }
      })
      cb(null, result)
    }).catch(err => {
      cb(err)
    })
  }
  isConnected () { // Backwards Compatibility
    return this.connected
  }
  close () {
    this.connection.close()
    this.connected = false
    let error = new Error(`Provider closed, subscription lost, please subscribe again.`)
    this.subscriptions.forEach(id => this.emit(id, error)) // Send Error objects to any open subscriptions
    this.subscriptions = [] // Clear subscriptions
  }
}

module.exports = EthereumProvider

},{"events":"../node_modules/events/events.js"}],"../node_modules/eth-provider/ConnectionManager/index.js":[function(require,module,exports) {
const EventEmitter = require('events');

const dev = "development" === 'development';

class ConnectionManager extends EventEmitter {
  constructor(connections, targets, options) {
    super();
    this.targets = targets;
    this.connections = connections;
    this.connected = false;
    this.status = 'loading';
    this.interval = options.interval || 5000;
    this.name = options.name || 'default';
    this.inSetup = true;
    this.connect();
  }

  connect(index = 0) {
    if (dev && index === 0) console.log(`\n\n\n\nA connection cycle started for provider with name: ${this.name}`);

    if (this.connection && this.connection.status === 'connected' && index >= this.connection.index) {
      if (dev) console.log('Stopping connection cycle becasuse we\'re already connected to a higher priority provider');
    } else if (this.targets.length === 0) {
      if (dev) console.log('No valid targets supplied');
    } else {
      const {
        protocol,
        location
      } = this.targets[index];
      this.connection = this.connections[protocol](location);
      this.connection.on('error', err => {
        if (!this.connected) return this.connectionError(index, err);
        if (this.listenerCount('error')) return this.emit('error', err);
        console.warn('eth-provider - Uncaught connection error: ' + err.message);
      });
      this.connection.on('close', summary => {
        this.connected = false;
        this.emit('close');
        if (!this.closing) this.refresh();
      });
      this.connection.on('connect', () => {
        this.connection.target = this.targets[index];
        this.connection.index = index;
        this.targets[index].status = this.connection.status;
        this.connected = true;
        this.inSetup = false;
        if (dev) console.log('Successfully connected to: ' + this.targets[index].location);
        this.emit('connect');
      });
      this.connection.on('data', data => this.emit('data', data));
      this.connection.on('payload', payload => this.emit('payload', payload));
    }
  }

  refresh(interval = this.interval) {
    if (dev) console.log(`Reconnect queued for ${(interval / 1000).toFixed(2)}s in the future`);
    clearTimeout(this.connectTimer);
    this.connectTimer = setTimeout(() => this.connect(), interval);
  }

  connectionError(index, err) {
    this.targets[index].status = err;

    if (this.targets.length - 1 === index) {
      this.inSetup = false;
      if (dev) console.warn('eth-provider unable to connect to any targets, view connection cycle summary: ', this.targets);
      this.refresh();
    } else {
      // Not last target, move on the next connection option
      this.connect(++index);
    }
  }

  close() {
    this.closing = true;

    if (this.connection) {
      this.connection.close(); // Let event bubble from here
    } else {
      this.emit('close');
    }

    clearTimeout(this.connectTimer);
  }

  error(payload, message, code = -1) {
    this.emit('payload', {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      error: {
        message,
        code
      }
    });
  }

  send(payload) {
    if (this.inSetup) {
      setTimeout(() => this.send(payload), 100);
    } else if (this.connection.closed) {
      this.error(payload, 'Not connected');
    } else {
      this.connection.send(payload);
    }
  }

}

module.exports = ConnectionManager;
},{"events":"../node_modules/events/events.js"}],"../node_modules/eth-provider/provider/index.js":[function(require,module,exports) {
const EventEmitter = require('events')
const EthereumProvider = require('ethereum-provider')
const ConnectionManager = require('../ConnectionManager')

const monitor = provider => {
  function update (status) {
    provider.status = status
    if (provider instanceof EventEmitter) provider.emit('status', status)
  }
  async function check () {
    if (provider.inSetup) return setTimeout(check, 1000)
    try {
      if (await provider.send('eth_syncing')) {
        update('syncing')
        setTimeout(() => check(), 5000)
      } else {
        update('connected')
      }
    } catch (e) {
      update('disconnected')
    }
  }
  update('loading')
  check()
  provider.on('connect', () => check())
  provider.on('close', () => update('disconnected'))
  return provider
}

module.exports = (connections, targets, options) => {
  // If window.ethereum and injected is a target in any priority, return ethereum provider
  if (connections.injected.__isProvider && targets.map(t => t.type).indexOf('injected') > -1) {
    delete connections.injected.__isProvider
    return monitor(connections.injected)
  }
  const provider = new EthereumProvider(new ConnectionManager(connections, targets, options))
  provider.setMaxListeners(128)
  return monitor(provider)
}

},{"events":"../node_modules/events/events.js","ethereum-provider":"../node_modules/ethereum-provider/index.js","../ConnectionManager":"../node_modules/eth-provider/ConnectionManager/index.js"}],"../node_modules/eth-provider/presets/index.js":[function(require,module,exports) {
module.exports = {
  injected: ['injected'],
  frame: ['ws://127.0.0.1:1248', 'http://127.0.0.1:1248'],
  direct: ['ws://127.0.0.1:8546', 'http://127.0.0.1:8545'], // IPC paths will be prepended in Node/Electron
  infura: ['wss://mainnet.infura.io/ws/v3/786ade30f36244469480aa5c2bf0743b', 'https://mainnet.infura.io/v3/786ade30f36244469480aa5c2bf0743b'],
  infuraRopsten: ['wss://ropsten.infura.io/ws/v3/786ade30f36244469480aa5c2bf0743b', 'https://ropsten.infura.io/v3/786ade30f36244469480aa5c2bf0743b'],
  infuraRinkeby: ['wss://rinkeby.infura.io/ws/v3/786ade30f36244469480aa5c2bf0743b', 'https://rinkeby.infura.io/v3/786ade30f36244469480aa5c2bf0743b'],
  infuraKovan: ['wss://kovan.infura.io/ws/v3/786ade30f36244469480aa5c2bf0743b', 'https://kovan.infura.io/v3/786ade30f36244469480aa5c2bf0743b']
}

},{}],"../node_modules/eth-provider/connections/injected.js":[function(require,module,exports) {
const EventEmitter = require('events')

class InjectedConnection extends EventEmitter {
  constructor (_injected, options) {
    super()
    if (_injected) {
      setTimeout(() => this.emit('error', new Error('Injected web3 provider is not currently supported')), 0)
    } else {
      setTimeout(() => this.emit('error', new Error('No injected provider found')), 0)
    }
  }
}

module.exports = injected => options => new InjectedConnection(injected, options)

},{"events":"../node_modules/events/events.js"}],"../node_modules/eth-provider/connections/unavailable.js":[function(require,module,exports) {
const EventEmitter = require('events')

class UnavailableConnection extends EventEmitter {
  constructor (message) {
    super()
    setTimeout(() => this.emit('error', new Error(message)), 0)
  }
}

module.exports = message => () => new UnavailableConnection(message)

},{"events":"../node_modules/events/events.js"}],"../node_modules/eth-provider/parse/index.js":[function(require,module,exports) {
let last, timeout

module.exports = (res, cb) => {
  const values = []
  res
    .replace(/\}[\n\r]?\{/g, '}|--|{') // }{
    .replace(/\}\][\n\r]?\[\{/g, '}]|--|[{') // }][{
    .replace(/\}[\n\r]?\[\{/g, '}|--|[{') // }[{
    .replace(/\}\][\n\r]?\{/g, '}]|--|{') // }]{
    .split('|--|')
    .forEach(data => {
      if (last) data = last + data // prepend the last chunk
      let result
      try {
        result = JSON.parse(data)
      } catch (e) {
        last = data
        clearTimeout(timeout) // restart timeout
        timeout = setTimeout(() => cb(new Error('Parse response timeout')), 15 * 1000)
        return
      }
      clearTimeout(timeout)
      last = null
      if (result) values.push(result)
    })
  cb(null, values)
}

},{}],"../node_modules/eth-provider/connections/ws.js":[function(require,module,exports) {
const EventEmitter = require('events');

const parse = require('../parse');

const dev = "development" === 'development';
let WebSocket;

class WebSocketConnection extends EventEmitter {
  constructor(_WebSocket, url, options) {
    super();
    WebSocket = _WebSocket;
    setTimeout(() => this.create(url, options), 0);
  }

  create(url, options) {
    if (!WebSocket) this.emit('error', new Error('No WebSocket transport available'));

    try {
      this.socket = new WebSocket(url);
    } catch (e) {
      return this.emit('error', e);
    }

    this.socket.addEventListener('error', err => this.emit('error', err));
    this.socket.addEventListener('open', () => {
      this.emit('connect');
      this.socket.addEventListener('message', message => {
        const data = typeof message.data === 'string' ? message.data : '';
        parse(data, (err, payloads) => {
          if (err) return; //

          payloads.forEach(load => {
            if (Array.isArray(load)) {
              load.forEach(payload => this.emit('payload', payload));
            } else {
              this.emit('payload', load);
            }
          });
        });
      });
      this.socket.addEventListener('close', () => this.onClose());
    });
  }

  onClose() {
    this.socket = null;
    this.closed = true;
    if (dev) console.log('Closing WebSocket connection');
    this.emit('close');
    this.removeAllListeners();
  }

  close() {
    if (this.socket) {
      this.socket.close();
    } else {
      this.onClose();
    }
  }

  error(payload, message, code = -1) {
    this.emit('payload', {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      error: {
        message,
        code
      }
    });
  }

  send(payload) {
    if (this.socket && this.socket.readyState === this.socket.CONNECTING) {
      setTimeout(_ => this.send(payload), 10);
    } else if (!this.socket || this.socket.readyState > 1) {
      this.connected = false;
      this.error(payload, 'Not connected');
    } else {
      this.socket.send(JSON.stringify(payload));
    }
  }

}

module.exports = WebSocket => (url, cb) => new WebSocketConnection(WebSocket, url, cb);
},{"events":"../node_modules/events/events.js","../parse":"../node_modules/eth-provider/parse/index.js"}],"../node_modules/eth-provider/connections/http.js":[function(require,module,exports) {
const EventEmitter = require('events');

const uuid = require('uuid/v4');

const dev = "development" === 'development';
let XHR;

class HTTPConnection extends EventEmitter {
  constructor(_XHR, url, options) {
    super();
    XHR = _XHR;
    this.connected = false;
    this.subscriptions = false;
    this.status = 'loading';
    this.url = url;
    this.pollId = uuid();
    setTimeout(() => this.create(), 0);
  }

  create() {
    if (!XHR) return this.emit('error', new Error('No HTTP transport available'));
    this.on('error', () => {
      if (this.connected) this.close();
    });
    this.init();
  }

  init() {
    this.send({
      jsonrpc: '2.0',
      method: 'eth_syncing',
      params: [],
      id: 1
    }, (err, response) => {
      if (err) return this.emit('error', err);
      this.send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_pollSubscriptions',
        params: [this.pollId, 'immediate']
      }, (err, response) => {
        if (!err) {
          this.subscriptions = true;
          this.pollSubscriptions();
        }

        this.connected = true;
        this.emit('connect');
      });
    });
  }

  pollSubscriptions() {
    this.send({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_pollSubscriptions',
      params: [this.pollId]
    }, (err, result) => {
      if (err) {
        this.subscriptionTimeout = setTimeout(() => this.pollSubscriptions(), 10000);
        return this.emit('error', err);
      } else {
        if (!this.closed) this.subscriptionTimeout = this.pollSubscriptions();

        if (result) {
          result.map(p => {
            let parse;

            try {
              parse = JSON.parse(p);
            } catch (e) {
              parse = false;
            }

            return parse;
          }).filter(n => n).forEach(p => this.emit('payload', p));
        }
      }
    });
  }

  close() {
    if (dev) console.log('Closing HTTP connection');
    this.closed = true;
    this.emit('close');
    clearTimeout(this.subscriptionTimeout);
    this.removeAllListeners();
  }

  filterStatus(res) {
    if (res.status >= 200 && res.status < 300) return res;
    const error = new Error(res.statusText);
    error.res = res;
    throw error.message;
  }

  error(payload, message, code = -1) {
    this.emit('payload', {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      error: {
        message,
        code
      }
    });
  }

  send(payload, internal) {
    if (this.closed) return this.error(payload, 'Not connected');

    if (payload.method === 'eth_subscribe') {
      if (this.subscriptions) {
        payload.pollId = this.pollId;
      } else {
        return this.error(payload, 'Subscriptions are not supported by this HTTP endpoint');
      }
    }

    const xhr = new XHR();
    let responded = false;

    const res = (err, result) => {
      if (!responded) {
        xhr.abort();
        responded = true;

        if (internal) {
          internal(err, result);
        } else {
          const {
            id,
            jsonrpc
          } = payload;
          const load = err ? {
            id,
            jsonrpc,
            error: {
              message: err.message,
              code: err.code
            }
          } : {
            id,
            jsonrpc,
            result
          };
          this.emit('payload', load);
        }
      }
    };

    xhr.open('POST', this.url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = 60 * 1000;
    xhr.onerror = res;
    xhr.ontimeout = res;

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        try {
          const response = JSON.parse(xhr.responseText);
          res(response.error, response.result);
        } catch (e) {
          res(e);
        }
      }
    };

    xhr.send(JSON.stringify(payload));
  }

}

module.exports = XHR => (url, options) => new HTTPConnection(XHR, url, options);
},{"events":"../node_modules/events/events.js","uuid/v4":"../node_modules/uuid/v4.js"}],"../node_modules/eth-provider/browser.js":[function(require,module,exports) {
const resolve = require('./resolve')
const provider = require('./provider')
const presets = require('./presets')

const injected = {
  ethereum: typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' ? window.ethereum : null,
  web3: typeof window !== 'undefined' && typeof window.web3 !== 'undefined' ? window.web3.currentProvider : null
}
const ws = typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined' ? window.WebSocket : null
const XHR = typeof window !== 'undefined' && typeof window.XMLHttpRequest !== 'undefined' ? window.XMLHttpRequest : null

if (injected.ethereum) injected.ethereum.__isProvider = true

const connections = {
  injected: injected.ethereum || require('./connections/injected')(injected.web3),
  ipc: require('./connections/unavailable')('IPC connections are unavliable in the browser'),
  ws: require('./connections/ws')(ws),
  http: require('./connections/http')(XHR)
}

module.exports = (targets = ['injected', 'frame'], options = {}) => provider(connections, resolve(targets, presets), options)

},{"./resolve":"../node_modules/eth-provider/resolve/index.js","./provider":"../node_modules/eth-provider/provider/index.js","./presets":"../node_modules/eth-provider/presets/index.js","./connections/injected":"../node_modules/eth-provider/connections/injected.js","./connections/unavailable":"../node_modules/eth-provider/connections/unavailable.js","./connections/ws":"../node_modules/eth-provider/connections/ws.js","./connections/http":"../node_modules/eth-provider/connections/http.js"}],"../node_modules/@web3-react/frame-connector/dist/frame-connector.esm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserRejectedRequestError = exports.FrameConnector = void 0;

var _abstractConnector = require("@web3-react/abstract-connector");

var _ethProvider = _interopRequireDefault(require("eth-provider"));

var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
}

var UserRejectedRequestError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(UserRejectedRequestError, _Error);

  function UserRejectedRequestError() {
    var _this;

    _this = _Error.call(this) || this;
    _this.name = _this.constructor.name;
    _this.message = 'The user rejected the request.';
    return _this;
  }

  return UserRejectedRequestError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.UserRejectedRequestError = UserRejectedRequestError;

var FrameConnector = /*#__PURE__*/function (_AbstractConnector) {
  _inheritsLoose(FrameConnector, _AbstractConnector);

  function FrameConnector(kwargs) {
    var _this2;

    !(kwargs.supportedChainIds.length === 1) ? "development" !== "production" ? (0, _tinyInvariant.default)(false, 'This connector only supports 1 chainId at the moment.') : (0, _tinyInvariant.default)(false) : void 0;
    _this2 = _AbstractConnector.call(this, kwargs) || this;
    _this2.handleNetworkChanged = _this2.handleNetworkChanged.bind(_assertThisInitialized(_this2));
    _this2.handleChainChanged = _this2.handleChainChanged.bind(_assertThisInitialized(_this2));
    _this2.handleAccountsChanged = _this2.handleAccountsChanged.bind(_assertThisInitialized(_this2));
    _this2.handleClose = _this2.handleClose.bind(_assertThisInitialized(_this2));
    return _this2;
  }

  var _proto = FrameConnector.prototype;

  _proto.handleNetworkChanged = function handleNetworkChanged(networkId) {
    if ("development" !== "production") {
      console.log("Handling 'networkChanged' event with payload", networkId);
    }

    this.emitUpdate({
      provider: this.provider,
      chainId: networkId
    });
  };

  _proto.handleChainChanged = function handleChainChanged(chainId) {
    if ("development" !== "production") {
      console.log("Handling 'chainChanged' event with payload", chainId);
    }

    this.emitUpdate({
      chainId: chainId
    });
  };

  _proto.handleAccountsChanged = function handleAccountsChanged(accounts) {
    if ("development" !== "production") {
      console.log("Handling 'accountsChanged' event with payload", accounts);
    }

    this.emitUpdate({
      account: accounts.length === 0 ? null : accounts[0]
    });
  };

  _proto.handleClose = function handleClose(code, reason) {
    if ("development" !== "production") {
      console.log("Handling 'close' event with payload", code, reason);
    }

    this.emitDeactivate();
  };

  _proto.activate = function activate() {
    try {
      var _this4 = this;

      if (!_this4.provider) {
        _this4.provider = (0, _ethProvider.default)('frame');
      }

      _this4.provider.on('networkChanged', _this4.handleNetworkChanged).on('chainChanged', _this4.handleChainChanged).on('accountsChanged', _this4.handleAccountsChanged).on('close', _this4.handleClose);

      return Promise.resolve(_this4.provider.enable().then(function (accounts) {
        return accounts[0];
      })["catch"](function (error) {
        if (error && error.code === 4001) {
          throw new UserRejectedRequestError();
        } else {
          throw error;
        }
      })).then(function (account) {
        return {
          provider: _this4.provider,
          account: account
        };
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getProvider = function getProvider() {
    try {
      var _this6 = this;

      return Promise.resolve(_this6.provider);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getChainId = function getChainId() {
    try {
      var _this8 = this;

      return Promise.resolve(_this8.provider.send('eth_chainId'));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getAccount = function getAccount() {
    try {
      var _this10 = this;

      return Promise.resolve(_this10.provider.send('eth_accounts').then(function (accounts) {
        return accounts[0];
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.deactivate = function deactivate() {
    this.provider.removeListener('networkChanged', this.handleNetworkChanged).removeListener('chainChanged', this.handleChainChanged).removeListener('accountsChanged', this.handleAccountsChanged).removeListener('close', this.handleClose);
  };

  return FrameConnector;
}(_abstractConnector.AbstractConnector);

exports.FrameConnector = FrameConnector;
},{"@web3-react/abstract-connector":"../node_modules/@web3-react/abstract-connector/dist/abstract-connector.esm.js","eth-provider":"../node_modules/eth-provider/browser.js","tiny-invariant":"../node_modules/tiny-invariant/dist/tiny-invariant.esm.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "53460" + '/');

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
//# sourceMappingURL=/frame-connector.esm.3d5b37e6.js.map