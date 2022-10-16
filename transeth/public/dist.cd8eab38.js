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
})({"../node_modules/walletlink/node_modules/bn.js/lib/bn.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
(function (module, exports) {
  'use strict';

  // Utils
  function assert (val, msg) {
    if (!val) throw new Error(msg || 'Assertion failed');
  }

  // Could use `inherits` module, but don't want to move from single file
  // architecture yet.
  function inherits (ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  }

  // BN

  function BN (number, base, endian) {
    if (BN.isBN(number)) {
      return number;
    }

    this.negative = 0;
    this.words = null;
    this.length = 0;

    // Reduction context
    this.red = null;

    if (number !== null) {
      if (base === 'le' || base === 'be') {
        endian = base;
        base = 10;
      }

      this._init(number || 0, base || 10, endian || 'be');
    }
  }
  if (typeof module === 'object') {
    module.exports = BN;
  } else {
    exports.BN = BN;
  }

  BN.BN = BN;
  BN.wordSize = 26;

  var Buffer;
  try {
    if (typeof window !== 'undefined' && typeof window.Buffer !== 'undefined') {
      Buffer = window.Buffer;
    } else {
      Buffer = require('buffer').Buffer;
    }
  } catch (e) {
  }

  BN.isBN = function isBN (num) {
    if (num instanceof BN) {
      return true;
    }

    return num !== null && typeof num === 'object' &&
      num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
  };

  BN.max = function max (left, right) {
    if (left.cmp(right) > 0) return left;
    return right;
  };

  BN.min = function min (left, right) {
    if (left.cmp(right) < 0) return left;
    return right;
  };

  BN.prototype._init = function init (number, base, endian) {
    if (typeof number === 'number') {
      return this._initNumber(number, base, endian);
    }

    if (typeof number === 'object') {
      return this._initArray(number, base, endian);
    }

    if (base === 'hex') {
      base = 16;
    }
    assert(base === (base | 0) && base >= 2 && base <= 36);

    number = number.toString().replace(/\s+/g, '');
    var start = 0;
    if (number[0] === '-') {
      start++;
      this.negative = 1;
    }

    if (start < number.length) {
      if (base === 16) {
        this._parseHex(number, start, endian);
      } else {
        this._parseBase(number, base, start);
        if (endian === 'le') {
          this._initArray(this.toArray(), base, endian);
        }
      }
    }
  };

  BN.prototype._initNumber = function _initNumber (number, base, endian) {
    if (number < 0) {
      this.negative = 1;
      number = -number;
    }
    if (number < 0x4000000) {
      this.words = [number & 0x3ffffff];
      this.length = 1;
    } else if (number < 0x10000000000000) {
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff
      ];
      this.length = 2;
    } else {
      assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff,
        1
      ];
      this.length = 3;
    }

    if (endian !== 'le') return;

    // Reverse the bytes
    this._initArray(this.toArray(), base, endian);
  };

  BN.prototype._initArray = function _initArray (number, base, endian) {
    // Perhaps a Uint8Array
    assert(typeof number.length === 'number');
    if (number.length <= 0) {
      this.words = [0];
      this.length = 1;
      return this;
    }

    this.length = Math.ceil(number.length / 3);
    this.words = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      this.words[i] = 0;
    }

    var j, w;
    var off = 0;
    if (endian === 'be') {
      for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
        w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
        this.words[j] |= (w << off) & 0x3ffffff;
        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
        off += 24;
        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
    } else if (endian === 'le') {
      for (i = 0, j = 0; i < number.length; i += 3) {
        w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
        this.words[j] |= (w << off) & 0x3ffffff;
        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
        off += 24;
        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
    }
    return this._strip();
  };

  function parseHex4Bits (string, index) {
    var c = string.charCodeAt(index);
    // '0' - '9'
    if (c >= 48 && c <= 57) {
      return c - 48;
    // 'A' - 'F'
    } else if (c >= 65 && c <= 70) {
      return c - 55;
    // 'a' - 'f'
    } else if (c >= 97 && c <= 102) {
      return c - 87;
    } else {
      assert(false, 'Invalid character in ' + string);
    }
  }

  function parseHexByte (string, lowerBound, index) {
    var r = parseHex4Bits(string, index);
    if (index - 1 >= lowerBound) {
      r |= parseHex4Bits(string, index - 1) << 4;
    }
    return r;
  }

  BN.prototype._parseHex = function _parseHex (number, start, endian) {
    // Create possibly bigger array to ensure that it fits the number
    this.length = Math.ceil((number.length - start) / 6);
    this.words = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      this.words[i] = 0;
    }

    // 24-bits chunks
    var off = 0;
    var j = 0;

    var w;
    if (endian === 'be') {
      for (i = number.length - 1; i >= start; i -= 2) {
        w = parseHexByte(number, start, i) << off;
        this.words[j] |= w & 0x3ffffff;
        if (off >= 18) {
          off -= 18;
          j += 1;
          this.words[j] |= w >>> 26;
        } else {
          off += 8;
        }
      }
    } else {
      var parseLength = number.length - start;
      for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
        w = parseHexByte(number, start, i) << off;
        this.words[j] |= w & 0x3ffffff;
        if (off >= 18) {
          off -= 18;
          j += 1;
          this.words[j] |= w >>> 26;
        } else {
          off += 8;
        }
      }
    }

    this._strip();
  };

  function parseBase (str, start, end, mul) {
    var r = 0;
    var b = 0;
    var len = Math.min(str.length, end);
    for (var i = start; i < len; i++) {
      var c = str.charCodeAt(i) - 48;

      r *= mul;

      // 'a'
      if (c >= 49) {
        b = c - 49 + 0xa;

      // 'A'
      } else if (c >= 17) {
        b = c - 17 + 0xa;

      // '0' - '9'
      } else {
        b = c;
      }
      assert(c >= 0 && b < mul, 'Invalid character');
      r += b;
    }
    return r;
  }

  BN.prototype._parseBase = function _parseBase (number, base, start) {
    // Initialize as zero
    this.words = [0];
    this.length = 1;

    // Find length of limb in base
    for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
      limbLen++;
    }
    limbLen--;
    limbPow = (limbPow / base) | 0;

    var total = number.length - start;
    var mod = total % limbLen;
    var end = Math.min(total, total - mod) + start;

    var word = 0;
    for (var i = start; i < end; i += limbLen) {
      word = parseBase(number, i, i + limbLen, base);

      this.imuln(limbPow);
      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word;
      } else {
        this._iaddn(word);
      }
    }

    if (mod !== 0) {
      var pow = 1;
      word = parseBase(number, i, number.length, base);

      for (i = 0; i < mod; i++) {
        pow *= base;
      }

      this.imuln(pow);
      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word;
      } else {
        this._iaddn(word);
      }
    }

    this._strip();
  };

  BN.prototype.copy = function copy (dest) {
    dest.words = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      dest.words[i] = this.words[i];
    }
    dest.length = this.length;
    dest.negative = this.negative;
    dest.red = this.red;
  };

  function move (dest, src) {
    dest.words = src.words;
    dest.length = src.length;
    dest.negative = src.negative;
    dest.red = src.red;
  }

  BN.prototype._move = function _move (dest) {
    move(dest, this);
  };

  BN.prototype.clone = function clone () {
    var r = new BN(null);
    this.copy(r);
    return r;
  };

  BN.prototype._expand = function _expand (size) {
    while (this.length < size) {
      this.words[this.length++] = 0;
    }
    return this;
  };

  // Remove leading `0` from `this`
  BN.prototype._strip = function strip () {
    while (this.length > 1 && this.words[this.length - 1] === 0) {
      this.length--;
    }
    return this._normSign();
  };

  BN.prototype._normSign = function _normSign () {
    // -0 = 0
    if (this.length === 1 && this.words[0] === 0) {
      this.negative = 0;
    }
    return this;
  };

  // Check Symbol.for because not everywhere where Symbol defined
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility
  if (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function') {
    try {
      BN.prototype[Symbol.for('nodejs.util.inspect.custom')] = inspect;
    } catch (e) {
      BN.prototype.inspect = inspect;
    }
  } else {
    BN.prototype.inspect = inspect;
  }

  function inspect () {
    return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
  }

  /*

  var zeros = [];
  var groupSizes = [];
  var groupBases = [];

  var s = '';
  var i = -1;
  while (++i < BN.wordSize) {
    zeros[i] = s;
    s += '0';
  }
  groupSizes[0] = 0;
  groupSizes[1] = 0;
  groupBases[0] = 0;
  groupBases[1] = 0;
  var base = 2 - 1;
  while (++base < 36 + 1) {
    var groupSize = 0;
    var groupBase = 1;
    while (groupBase < (1 << BN.wordSize) / base) {
      groupBase *= base;
      groupSize += 1;
    }
    groupSizes[base] = groupSize;
    groupBases[base] = groupBase;
  }

  */

  var zeros = [
    '',
    '0',
    '00',
    '000',
    '0000',
    '00000',
    '000000',
    '0000000',
    '00000000',
    '000000000',
    '0000000000',
    '00000000000',
    '000000000000',
    '0000000000000',
    '00000000000000',
    '000000000000000',
    '0000000000000000',
    '00000000000000000',
    '000000000000000000',
    '0000000000000000000',
    '00000000000000000000',
    '000000000000000000000',
    '0000000000000000000000',
    '00000000000000000000000',
    '000000000000000000000000',
    '0000000000000000000000000'
  ];

  var groupSizes = [
    0, 0,
    25, 16, 12, 11, 10, 9, 8,
    8, 7, 7, 7, 7, 6, 6,
    6, 6, 6, 6, 6, 5, 5,
    5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5
  ];

  var groupBases = [
    0, 0,
    33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
    43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
    16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
    6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
    24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
  ];

  BN.prototype.toString = function toString (base, padding) {
    base = base || 10;
    padding = padding | 0 || 1;

    var out;
    if (base === 16 || base === 'hex') {
      out = '';
      var off = 0;
      var carry = 0;
      for (var i = 0; i < this.length; i++) {
        var w = this.words[i];
        var word = (((w << off) | carry) & 0xffffff).toString(16);
        carry = (w >>> (24 - off)) & 0xffffff;
        if (carry !== 0 || i !== this.length - 1) {
          out = zeros[6 - word.length] + word + out;
        } else {
          out = word + out;
        }
        off += 2;
        if (off >= 26) {
          off -= 26;
          i--;
        }
      }
      if (carry !== 0) {
        out = carry.toString(16) + out;
      }
      while (out.length % padding !== 0) {
        out = '0' + out;
      }
      if (this.negative !== 0) {
        out = '-' + out;
      }
      return out;
    }

    if (base === (base | 0) && base >= 2 && base <= 36) {
      // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
      var groupSize = groupSizes[base];
      // var groupBase = Math.pow(base, groupSize);
      var groupBase = groupBases[base];
      out = '';
      var c = this.clone();
      c.negative = 0;
      while (!c.isZero()) {
        var r = c.modrn(groupBase).toString(base);
        c = c.idivn(groupBase);

        if (!c.isZero()) {
          out = zeros[groupSize - r.length] + r + out;
        } else {
          out = r + out;
        }
      }
      if (this.isZero()) {
        out = '0' + out;
      }
      while (out.length % padding !== 0) {
        out = '0' + out;
      }
      if (this.negative !== 0) {
        out = '-' + out;
      }
      return out;
    }

    assert(false, 'Base should be between 2 and 36');
  };

  BN.prototype.toNumber = function toNumber () {
    var ret = this.words[0];
    if (this.length === 2) {
      ret += this.words[1] * 0x4000000;
    } else if (this.length === 3 && this.words[2] === 0x01) {
      // NOTE: at this stage it is known that the top bit is set
      ret += 0x10000000000000 + (this.words[1] * 0x4000000);
    } else if (this.length > 2) {
      assert(false, 'Number can only safely store up to 53 bits');
    }
    return (this.negative !== 0) ? -ret : ret;
  };

  BN.prototype.toJSON = function toJSON () {
    return this.toString(16, 2);
  };

  if (Buffer) {
    BN.prototype.toBuffer = function toBuffer (endian, length) {
      return this.toArrayLike(Buffer, endian, length);
    };
  }

  BN.prototype.toArray = function toArray (endian, length) {
    return this.toArrayLike(Array, endian, length);
  };

  var allocate = function allocate (ArrayType, size) {
    if (ArrayType.allocUnsafe) {
      return ArrayType.allocUnsafe(size);
    }
    return new ArrayType(size);
  };

  BN.prototype.toArrayLike = function toArrayLike (ArrayType, endian, length) {
    this._strip();

    var byteLength = this.byteLength();
    var reqLength = length || Math.max(1, byteLength);
    assert(byteLength <= reqLength, 'byte array longer than desired length');
    assert(reqLength > 0, 'Requested array length <= 0');

    var res = allocate(ArrayType, reqLength);
    var postfix = endian === 'le' ? 'LE' : 'BE';
    this['_toArrayLike' + postfix](res, byteLength);
    return res;
  };

  BN.prototype._toArrayLikeLE = function _toArrayLikeLE (res, byteLength) {
    var position = 0;
    var carry = 0;

    for (var i = 0, shift = 0; i < this.length; i++) {
      var word = (this.words[i] << shift) | carry;

      res[position++] = word & 0xff;
      if (position < res.length) {
        res[position++] = (word >> 8) & 0xff;
      }
      if (position < res.length) {
        res[position++] = (word >> 16) & 0xff;
      }

      if (shift === 6) {
        if (position < res.length) {
          res[position++] = (word >> 24) & 0xff;
        }
        carry = 0;
        shift = 0;
      } else {
        carry = word >>> 24;
        shift += 2;
      }
    }

    if (position < res.length) {
      res[position++] = carry;

      while (position < res.length) {
        res[position++] = 0;
      }
    }
  };

  BN.prototype._toArrayLikeBE = function _toArrayLikeBE (res, byteLength) {
    var position = res.length - 1;
    var carry = 0;

    for (var i = 0, shift = 0; i < this.length; i++) {
      var word = (this.words[i] << shift) | carry;

      res[position--] = word & 0xff;
      if (position >= 0) {
        res[position--] = (word >> 8) & 0xff;
      }
      if (position >= 0) {
        res[position--] = (word >> 16) & 0xff;
      }

      if (shift === 6) {
        if (position >= 0) {
          res[position--] = (word >> 24) & 0xff;
        }
        carry = 0;
        shift = 0;
      } else {
        carry = word >>> 24;
        shift += 2;
      }
    }

    if (position >= 0) {
      res[position--] = carry;

      while (position >= 0) {
        res[position--] = 0;
      }
    }
  };

  if (Math.clz32) {
    BN.prototype._countBits = function _countBits (w) {
      return 32 - Math.clz32(w);
    };
  } else {
    BN.prototype._countBits = function _countBits (w) {
      var t = w;
      var r = 0;
      if (t >= 0x1000) {
        r += 13;
        t >>>= 13;
      }
      if (t >= 0x40) {
        r += 7;
        t >>>= 7;
      }
      if (t >= 0x8) {
        r += 4;
        t >>>= 4;
      }
      if (t >= 0x02) {
        r += 2;
        t >>>= 2;
      }
      return r + t;
    };
  }

  BN.prototype._zeroBits = function _zeroBits (w) {
    // Short-cut
    if (w === 0) return 26;

    var t = w;
    var r = 0;
    if ((t & 0x1fff) === 0) {
      r += 13;
      t >>>= 13;
    }
    if ((t & 0x7f) === 0) {
      r += 7;
      t >>>= 7;
    }
    if ((t & 0xf) === 0) {
      r += 4;
      t >>>= 4;
    }
    if ((t & 0x3) === 0) {
      r += 2;
      t >>>= 2;
    }
    if ((t & 0x1) === 0) {
      r++;
    }
    return r;
  };

  // Return number of used bits in a BN
  BN.prototype.bitLength = function bitLength () {
    var w = this.words[this.length - 1];
    var hi = this._countBits(w);
    return (this.length - 1) * 26 + hi;
  };

  function toBitArray (num) {
    var w = new Array(num.bitLength());

    for (var bit = 0; bit < w.length; bit++) {
      var off = (bit / 26) | 0;
      var wbit = bit % 26;

      w[bit] = (num.words[off] >>> wbit) & 0x01;
    }

    return w;
  }

  // Number of trailing zero bits
  BN.prototype.zeroBits = function zeroBits () {
    if (this.isZero()) return 0;

    var r = 0;
    for (var i = 0; i < this.length; i++) {
      var b = this._zeroBits(this.words[i]);
      r += b;
      if (b !== 26) break;
    }
    return r;
  };

  BN.prototype.byteLength = function byteLength () {
    return Math.ceil(this.bitLength() / 8);
  };

  BN.prototype.toTwos = function toTwos (width) {
    if (this.negative !== 0) {
      return this.abs().inotn(width).iaddn(1);
    }
    return this.clone();
  };

  BN.prototype.fromTwos = function fromTwos (width) {
    if (this.testn(width - 1)) {
      return this.notn(width).iaddn(1).ineg();
    }
    return this.clone();
  };

  BN.prototype.isNeg = function isNeg () {
    return this.negative !== 0;
  };

  // Return negative clone of `this`
  BN.prototype.neg = function neg () {
    return this.clone().ineg();
  };

  BN.prototype.ineg = function ineg () {
    if (!this.isZero()) {
      this.negative ^= 1;
    }

    return this;
  };

  // Or `num` with `this` in-place
  BN.prototype.iuor = function iuor (num) {
    while (this.length < num.length) {
      this.words[this.length++] = 0;
    }

    for (var i = 0; i < num.length; i++) {
      this.words[i] = this.words[i] | num.words[i];
    }

    return this._strip();
  };

  BN.prototype.ior = function ior (num) {
    assert((this.negative | num.negative) === 0);
    return this.iuor(num);
  };

  // Or `num` with `this`
  BN.prototype.or = function or (num) {
    if (this.length > num.length) return this.clone().ior(num);
    return num.clone().ior(this);
  };

  BN.prototype.uor = function uor (num) {
    if (this.length > num.length) return this.clone().iuor(num);
    return num.clone().iuor(this);
  };

  // And `num` with `this` in-place
  BN.prototype.iuand = function iuand (num) {
    // b = min-length(num, this)
    var b;
    if (this.length > num.length) {
      b = num;
    } else {
      b = this;
    }

    for (var i = 0; i < b.length; i++) {
      this.words[i] = this.words[i] & num.words[i];
    }

    this.length = b.length;

    return this._strip();
  };

  BN.prototype.iand = function iand (num) {
    assert((this.negative | num.negative) === 0);
    return this.iuand(num);
  };

  // And `num` with `this`
  BN.prototype.and = function and (num) {
    if (this.length > num.length) return this.clone().iand(num);
    return num.clone().iand(this);
  };

  BN.prototype.uand = function uand (num) {
    if (this.length > num.length) return this.clone().iuand(num);
    return num.clone().iuand(this);
  };

  // Xor `num` with `this` in-place
  BN.prototype.iuxor = function iuxor (num) {
    // a.length > b.length
    var a;
    var b;
    if (this.length > num.length) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    for (var i = 0; i < b.length; i++) {
      this.words[i] = a.words[i] ^ b.words[i];
    }

    if (this !== a) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    this.length = a.length;

    return this._strip();
  };

  BN.prototype.ixor = function ixor (num) {
    assert((this.negative | num.negative) === 0);
    return this.iuxor(num);
  };

  // Xor `num` with `this`
  BN.prototype.xor = function xor (num) {
    if (this.length > num.length) return this.clone().ixor(num);
    return num.clone().ixor(this);
  };

  BN.prototype.uxor = function uxor (num) {
    if (this.length > num.length) return this.clone().iuxor(num);
    return num.clone().iuxor(this);
  };

  // Not ``this`` with ``width`` bitwidth
  BN.prototype.inotn = function inotn (width) {
    assert(typeof width === 'number' && width >= 0);

    var bytesNeeded = Math.ceil(width / 26) | 0;
    var bitsLeft = width % 26;

    // Extend the buffer with leading zeroes
    this._expand(bytesNeeded);

    if (bitsLeft > 0) {
      bytesNeeded--;
    }

    // Handle complete words
    for (var i = 0; i < bytesNeeded; i++) {
      this.words[i] = ~this.words[i] & 0x3ffffff;
    }

    // Handle the residue
    if (bitsLeft > 0) {
      this.words[i] = ~this.words[i] & (0x3ffffff >> (26 - bitsLeft));
    }

    // And remove leading zeroes
    return this._strip();
  };

  BN.prototype.notn = function notn (width) {
    return this.clone().inotn(width);
  };

  // Set `bit` of `this`
  BN.prototype.setn = function setn (bit, val) {
    assert(typeof bit === 'number' && bit >= 0);

    var off = (bit / 26) | 0;
    var wbit = bit % 26;

    this._expand(off + 1);

    if (val) {
      this.words[off] = this.words[off] | (1 << wbit);
    } else {
      this.words[off] = this.words[off] & ~(1 << wbit);
    }

    return this._strip();
  };

  // Add `num` to `this` in-place
  BN.prototype.iadd = function iadd (num) {
    var r;

    // negative + positive
    if (this.negative !== 0 && num.negative === 0) {
      this.negative = 0;
      r = this.isub(num);
      this.negative ^= 1;
      return this._normSign();

    // positive + negative
    } else if (this.negative === 0 && num.negative !== 0) {
      num.negative = 0;
      r = this.isub(num);
      num.negative = 1;
      return r._normSign();
    }

    // a.length > b.length
    var a, b;
    if (this.length > num.length) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    var carry = 0;
    for (var i = 0; i < b.length; i++) {
      r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
      this.words[i] = r & 0x3ffffff;
      carry = r >>> 26;
    }
    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry;
      this.words[i] = r & 0x3ffffff;
      carry = r >>> 26;
    }

    this.length = a.length;
    if (carry !== 0) {
      this.words[this.length] = carry;
      this.length++;
    // Copy the rest of the words
    } else if (a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    return this;
  };

  // Add `num` to `this`
  BN.prototype.add = function add (num) {
    var res;
    if (num.negative !== 0 && this.negative === 0) {
      num.negative = 0;
      res = this.sub(num);
      num.negative ^= 1;
      return res;
    } else if (num.negative === 0 && this.negative !== 0) {
      this.negative = 0;
      res = num.sub(this);
      this.negative = 1;
      return res;
    }

    if (this.length > num.length) return this.clone().iadd(num);

    return num.clone().iadd(this);
  };

  // Subtract `num` from `this` in-place
  BN.prototype.isub = function isub (num) {
    // this - (-num) = this + num
    if (num.negative !== 0) {
      num.negative = 0;
      var r = this.iadd(num);
      num.negative = 1;
      return r._normSign();

    // -this - num = -(this + num)
    } else if (this.negative !== 0) {
      this.negative = 0;
      this.iadd(num);
      this.negative = 1;
      return this._normSign();
    }

    // At this point both numbers are positive
    var cmp = this.cmp(num);

    // Optimization - zeroify
    if (cmp === 0) {
      this.negative = 0;
      this.length = 1;
      this.words[0] = 0;
      return this;
    }

    // a > b
    var a, b;
    if (cmp > 0) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    var carry = 0;
    for (var i = 0; i < b.length; i++) {
      r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    }
    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    }

    // Copy rest of the words
    if (carry === 0 && i < a.length && a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    this.length = Math.max(this.length, i);

    if (a !== this) {
      this.negative = 1;
    }

    return this._strip();
  };

  // Subtract `num` from `this`
  BN.prototype.sub = function sub (num) {
    return this.clone().isub(num);
  };

  function smallMulTo (self, num, out) {
    out.negative = num.negative ^ self.negative;
    var len = (self.length + num.length) | 0;
    out.length = len;
    len = (len - 1) | 0;

    // Peel one iteration (compiler can't do it, because of code complexity)
    var a = self.words[0] | 0;
    var b = num.words[0] | 0;
    var r = a * b;

    var lo = r & 0x3ffffff;
    var carry = (r / 0x4000000) | 0;
    out.words[0] = lo;

    for (var k = 1; k < len; k++) {
      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
      // note that ncarry could be >= 0x3ffffff
      var ncarry = carry >>> 26;
      var rword = carry & 0x3ffffff;
      var maxJ = Math.min(k, num.length - 1);
      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
        var i = (k - j) | 0;
        a = self.words[i] | 0;
        b = num.words[j] | 0;
        r = a * b + rword;
        ncarry += (r / 0x4000000) | 0;
        rword = r & 0x3ffffff;
      }
      out.words[k] = rword | 0;
      carry = ncarry | 0;
    }
    if (carry !== 0) {
      out.words[k] = carry | 0;
    } else {
      out.length--;
    }

    return out._strip();
  }

  // TODO(indutny): it may be reasonable to omit it for users who don't need
  // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
  // multiplication (like elliptic secp256k1).
  var comb10MulTo = function comb10MulTo (self, num, out) {
    var a = self.words;
    var b = num.words;
    var o = out.words;
    var c = 0;
    var lo;
    var mid;
    var hi;
    var a0 = a[0] | 0;
    var al0 = a0 & 0x1fff;
    var ah0 = a0 >>> 13;
    var a1 = a[1] | 0;
    var al1 = a1 & 0x1fff;
    var ah1 = a1 >>> 13;
    var a2 = a[2] | 0;
    var al2 = a2 & 0x1fff;
    var ah2 = a2 >>> 13;
    var a3 = a[3] | 0;
    var al3 = a3 & 0x1fff;
    var ah3 = a3 >>> 13;
    var a4 = a[4] | 0;
    var al4 = a4 & 0x1fff;
    var ah4 = a4 >>> 13;
    var a5 = a[5] | 0;
    var al5 = a5 & 0x1fff;
    var ah5 = a5 >>> 13;
    var a6 = a[6] | 0;
    var al6 = a6 & 0x1fff;
    var ah6 = a6 >>> 13;
    var a7 = a[7] | 0;
    var al7 = a7 & 0x1fff;
    var ah7 = a7 >>> 13;
    var a8 = a[8] | 0;
    var al8 = a8 & 0x1fff;
    var ah8 = a8 >>> 13;
    var a9 = a[9] | 0;
    var al9 = a9 & 0x1fff;
    var ah9 = a9 >>> 13;
    var b0 = b[0] | 0;
    var bl0 = b0 & 0x1fff;
    var bh0 = b0 >>> 13;
    var b1 = b[1] | 0;
    var bl1 = b1 & 0x1fff;
    var bh1 = b1 >>> 13;
    var b2 = b[2] | 0;
    var bl2 = b2 & 0x1fff;
    var bh2 = b2 >>> 13;
    var b3 = b[3] | 0;
    var bl3 = b3 & 0x1fff;
    var bh3 = b3 >>> 13;
    var b4 = b[4] | 0;
    var bl4 = b4 & 0x1fff;
    var bh4 = b4 >>> 13;
    var b5 = b[5] | 0;
    var bl5 = b5 & 0x1fff;
    var bh5 = b5 >>> 13;
    var b6 = b[6] | 0;
    var bl6 = b6 & 0x1fff;
    var bh6 = b6 >>> 13;
    var b7 = b[7] | 0;
    var bl7 = b7 & 0x1fff;
    var bh7 = b7 >>> 13;
    var b8 = b[8] | 0;
    var bl8 = b8 & 0x1fff;
    var bh8 = b8 >>> 13;
    var b9 = b[9] | 0;
    var bl9 = b9 & 0x1fff;
    var bh9 = b9 >>> 13;

    out.negative = self.negative ^ num.negative;
    out.length = 19;
    /* k = 0 */
    lo = Math.imul(al0, bl0);
    mid = Math.imul(al0, bh0);
    mid = (mid + Math.imul(ah0, bl0)) | 0;
    hi = Math.imul(ah0, bh0);
    var w0 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0;
    w0 &= 0x3ffffff;
    /* k = 1 */
    lo = Math.imul(al1, bl0);
    mid = Math.imul(al1, bh0);
    mid = (mid + Math.imul(ah1, bl0)) | 0;
    hi = Math.imul(ah1, bh0);
    lo = (lo + Math.imul(al0, bl1)) | 0;
    mid = (mid + Math.imul(al0, bh1)) | 0;
    mid = (mid + Math.imul(ah0, bl1)) | 0;
    hi = (hi + Math.imul(ah0, bh1)) | 0;
    var w1 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0;
    w1 &= 0x3ffffff;
    /* k = 2 */
    lo = Math.imul(al2, bl0);
    mid = Math.imul(al2, bh0);
    mid = (mid + Math.imul(ah2, bl0)) | 0;
    hi = Math.imul(ah2, bh0);
    lo = (lo + Math.imul(al1, bl1)) | 0;
    mid = (mid + Math.imul(al1, bh1)) | 0;
    mid = (mid + Math.imul(ah1, bl1)) | 0;
    hi = (hi + Math.imul(ah1, bh1)) | 0;
    lo = (lo + Math.imul(al0, bl2)) | 0;
    mid = (mid + Math.imul(al0, bh2)) | 0;
    mid = (mid + Math.imul(ah0, bl2)) | 0;
    hi = (hi + Math.imul(ah0, bh2)) | 0;
    var w2 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0;
    w2 &= 0x3ffffff;
    /* k = 3 */
    lo = Math.imul(al3, bl0);
    mid = Math.imul(al3, bh0);
    mid = (mid + Math.imul(ah3, bl0)) | 0;
    hi = Math.imul(ah3, bh0);
    lo = (lo + Math.imul(al2, bl1)) | 0;
    mid = (mid + Math.imul(al2, bh1)) | 0;
    mid = (mid + Math.imul(ah2, bl1)) | 0;
    hi = (hi + Math.imul(ah2, bh1)) | 0;
    lo = (lo + Math.imul(al1, bl2)) | 0;
    mid = (mid + Math.imul(al1, bh2)) | 0;
    mid = (mid + Math.imul(ah1, bl2)) | 0;
    hi = (hi + Math.imul(ah1, bh2)) | 0;
    lo = (lo + Math.imul(al0, bl3)) | 0;
    mid = (mid + Math.imul(al0, bh3)) | 0;
    mid = (mid + Math.imul(ah0, bl3)) | 0;
    hi = (hi + Math.imul(ah0, bh3)) | 0;
    var w3 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0;
    w3 &= 0x3ffffff;
    /* k = 4 */
    lo = Math.imul(al4, bl0);
    mid = Math.imul(al4, bh0);
    mid = (mid + Math.imul(ah4, bl0)) | 0;
    hi = Math.imul(ah4, bh0);
    lo = (lo + Math.imul(al3, bl1)) | 0;
    mid = (mid + Math.imul(al3, bh1)) | 0;
    mid = (mid + Math.imul(ah3, bl1)) | 0;
    hi = (hi + Math.imul(ah3, bh1)) | 0;
    lo = (lo + Math.imul(al2, bl2)) | 0;
    mid = (mid + Math.imul(al2, bh2)) | 0;
    mid = (mid + Math.imul(ah2, bl2)) | 0;
    hi = (hi + Math.imul(ah2, bh2)) | 0;
    lo = (lo + Math.imul(al1, bl3)) | 0;
    mid = (mid + Math.imul(al1, bh3)) | 0;
    mid = (mid + Math.imul(ah1, bl3)) | 0;
    hi = (hi + Math.imul(ah1, bh3)) | 0;
    lo = (lo + Math.imul(al0, bl4)) | 0;
    mid = (mid + Math.imul(al0, bh4)) | 0;
    mid = (mid + Math.imul(ah0, bl4)) | 0;
    hi = (hi + Math.imul(ah0, bh4)) | 0;
    var w4 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0;
    w4 &= 0x3ffffff;
    /* k = 5 */
    lo = Math.imul(al5, bl0);
    mid = Math.imul(al5, bh0);
    mid = (mid + Math.imul(ah5, bl0)) | 0;
    hi = Math.imul(ah5, bh0);
    lo = (lo + Math.imul(al4, bl1)) | 0;
    mid = (mid + Math.imul(al4, bh1)) | 0;
    mid = (mid + Math.imul(ah4, bl1)) | 0;
    hi = (hi + Math.imul(ah4, bh1)) | 0;
    lo = (lo + Math.imul(al3, bl2)) | 0;
    mid = (mid + Math.imul(al3, bh2)) | 0;
    mid = (mid + Math.imul(ah3, bl2)) | 0;
    hi = (hi + Math.imul(ah3, bh2)) | 0;
    lo = (lo + Math.imul(al2, bl3)) | 0;
    mid = (mid + Math.imul(al2, bh3)) | 0;
    mid = (mid + Math.imul(ah2, bl3)) | 0;
    hi = (hi + Math.imul(ah2, bh3)) | 0;
    lo = (lo + Math.imul(al1, bl4)) | 0;
    mid = (mid + Math.imul(al1, bh4)) | 0;
    mid = (mid + Math.imul(ah1, bl4)) | 0;
    hi = (hi + Math.imul(ah1, bh4)) | 0;
    lo = (lo + Math.imul(al0, bl5)) | 0;
    mid = (mid + Math.imul(al0, bh5)) | 0;
    mid = (mid + Math.imul(ah0, bl5)) | 0;
    hi = (hi + Math.imul(ah0, bh5)) | 0;
    var w5 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0;
    w5 &= 0x3ffffff;
    /* k = 6 */
    lo = Math.imul(al6, bl0);
    mid = Math.imul(al6, bh0);
    mid = (mid + Math.imul(ah6, bl0)) | 0;
    hi = Math.imul(ah6, bh0);
    lo = (lo + Math.imul(al5, bl1)) | 0;
    mid = (mid + Math.imul(al5, bh1)) | 0;
    mid = (mid + Math.imul(ah5, bl1)) | 0;
    hi = (hi + Math.imul(ah5, bh1)) | 0;
    lo = (lo + Math.imul(al4, bl2)) | 0;
    mid = (mid + Math.imul(al4, bh2)) | 0;
    mid = (mid + Math.imul(ah4, bl2)) | 0;
    hi = (hi + Math.imul(ah4, bh2)) | 0;
    lo = (lo + Math.imul(al3, bl3)) | 0;
    mid = (mid + Math.imul(al3, bh3)) | 0;
    mid = (mid + Math.imul(ah3, bl3)) | 0;
    hi = (hi + Math.imul(ah3, bh3)) | 0;
    lo = (lo + Math.imul(al2, bl4)) | 0;
    mid = (mid + Math.imul(al2, bh4)) | 0;
    mid = (mid + Math.imul(ah2, bl4)) | 0;
    hi = (hi + Math.imul(ah2, bh4)) | 0;
    lo = (lo + Math.imul(al1, bl5)) | 0;
    mid = (mid + Math.imul(al1, bh5)) | 0;
    mid = (mid + Math.imul(ah1, bl5)) | 0;
    hi = (hi + Math.imul(ah1, bh5)) | 0;
    lo = (lo + Math.imul(al0, bl6)) | 0;
    mid = (mid + Math.imul(al0, bh6)) | 0;
    mid = (mid + Math.imul(ah0, bl6)) | 0;
    hi = (hi + Math.imul(ah0, bh6)) | 0;
    var w6 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0;
    w6 &= 0x3ffffff;
    /* k = 7 */
    lo = Math.imul(al7, bl0);
    mid = Math.imul(al7, bh0);
    mid = (mid + Math.imul(ah7, bl0)) | 0;
    hi = Math.imul(ah7, bh0);
    lo = (lo + Math.imul(al6, bl1)) | 0;
    mid = (mid + Math.imul(al6, bh1)) | 0;
    mid = (mid + Math.imul(ah6, bl1)) | 0;
    hi = (hi + Math.imul(ah6, bh1)) | 0;
    lo = (lo + Math.imul(al5, bl2)) | 0;
    mid = (mid + Math.imul(al5, bh2)) | 0;
    mid = (mid + Math.imul(ah5, bl2)) | 0;
    hi = (hi + Math.imul(ah5, bh2)) | 0;
    lo = (lo + Math.imul(al4, bl3)) | 0;
    mid = (mid + Math.imul(al4, bh3)) | 0;
    mid = (mid + Math.imul(ah4, bl3)) | 0;
    hi = (hi + Math.imul(ah4, bh3)) | 0;
    lo = (lo + Math.imul(al3, bl4)) | 0;
    mid = (mid + Math.imul(al3, bh4)) | 0;
    mid = (mid + Math.imul(ah3, bl4)) | 0;
    hi = (hi + Math.imul(ah3, bh4)) | 0;
    lo = (lo + Math.imul(al2, bl5)) | 0;
    mid = (mid + Math.imul(al2, bh5)) | 0;
    mid = (mid + Math.imul(ah2, bl5)) | 0;
    hi = (hi + Math.imul(ah2, bh5)) | 0;
    lo = (lo + Math.imul(al1, bl6)) | 0;
    mid = (mid + Math.imul(al1, bh6)) | 0;
    mid = (mid + Math.imul(ah1, bl6)) | 0;
    hi = (hi + Math.imul(ah1, bh6)) | 0;
    lo = (lo + Math.imul(al0, bl7)) | 0;
    mid = (mid + Math.imul(al0, bh7)) | 0;
    mid = (mid + Math.imul(ah0, bl7)) | 0;
    hi = (hi + Math.imul(ah0, bh7)) | 0;
    var w7 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0;
    w7 &= 0x3ffffff;
    /* k = 8 */
    lo = Math.imul(al8, bl0);
    mid = Math.imul(al8, bh0);
    mid = (mid + Math.imul(ah8, bl0)) | 0;
    hi = Math.imul(ah8, bh0);
    lo = (lo + Math.imul(al7, bl1)) | 0;
    mid = (mid + Math.imul(al7, bh1)) | 0;
    mid = (mid + Math.imul(ah7, bl1)) | 0;
    hi = (hi + Math.imul(ah7, bh1)) | 0;
    lo = (lo + Math.imul(al6, bl2)) | 0;
    mid = (mid + Math.imul(al6, bh2)) | 0;
    mid = (mid + Math.imul(ah6, bl2)) | 0;
    hi = (hi + Math.imul(ah6, bh2)) | 0;
    lo = (lo + Math.imul(al5, bl3)) | 0;
    mid = (mid + Math.imul(al5, bh3)) | 0;
    mid = (mid + Math.imul(ah5, bl3)) | 0;
    hi = (hi + Math.imul(ah5, bh3)) | 0;
    lo = (lo + Math.imul(al4, bl4)) | 0;
    mid = (mid + Math.imul(al4, bh4)) | 0;
    mid = (mid + Math.imul(ah4, bl4)) | 0;
    hi = (hi + Math.imul(ah4, bh4)) | 0;
    lo = (lo + Math.imul(al3, bl5)) | 0;
    mid = (mid + Math.imul(al3, bh5)) | 0;
    mid = (mid + Math.imul(ah3, bl5)) | 0;
    hi = (hi + Math.imul(ah3, bh5)) | 0;
    lo = (lo + Math.imul(al2, bl6)) | 0;
    mid = (mid + Math.imul(al2, bh6)) | 0;
    mid = (mid + Math.imul(ah2, bl6)) | 0;
    hi = (hi + Math.imul(ah2, bh6)) | 0;
    lo = (lo + Math.imul(al1, bl7)) | 0;
    mid = (mid + Math.imul(al1, bh7)) | 0;
    mid = (mid + Math.imul(ah1, bl7)) | 0;
    hi = (hi + Math.imul(ah1, bh7)) | 0;
    lo = (lo + Math.imul(al0, bl8)) | 0;
    mid = (mid + Math.imul(al0, bh8)) | 0;
    mid = (mid + Math.imul(ah0, bl8)) | 0;
    hi = (hi + Math.imul(ah0, bh8)) | 0;
    var w8 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0;
    w8 &= 0x3ffffff;
    /* k = 9 */
    lo = Math.imul(al9, bl0);
    mid = Math.imul(al9, bh0);
    mid = (mid + Math.imul(ah9, bl0)) | 0;
    hi = Math.imul(ah9, bh0);
    lo = (lo + Math.imul(al8, bl1)) | 0;
    mid = (mid + Math.imul(al8, bh1)) | 0;
    mid = (mid + Math.imul(ah8, bl1)) | 0;
    hi = (hi + Math.imul(ah8, bh1)) | 0;
    lo = (lo + Math.imul(al7, bl2)) | 0;
    mid = (mid + Math.imul(al7, bh2)) | 0;
    mid = (mid + Math.imul(ah7, bl2)) | 0;
    hi = (hi + Math.imul(ah7, bh2)) | 0;
    lo = (lo + Math.imul(al6, bl3)) | 0;
    mid = (mid + Math.imul(al6, bh3)) | 0;
    mid = (mid + Math.imul(ah6, bl3)) | 0;
    hi = (hi + Math.imul(ah6, bh3)) | 0;
    lo = (lo + Math.imul(al5, bl4)) | 0;
    mid = (mid + Math.imul(al5, bh4)) | 0;
    mid = (mid + Math.imul(ah5, bl4)) | 0;
    hi = (hi + Math.imul(ah5, bh4)) | 0;
    lo = (lo + Math.imul(al4, bl5)) | 0;
    mid = (mid + Math.imul(al4, bh5)) | 0;
    mid = (mid + Math.imul(ah4, bl5)) | 0;
    hi = (hi + Math.imul(ah4, bh5)) | 0;
    lo = (lo + Math.imul(al3, bl6)) | 0;
    mid = (mid + Math.imul(al3, bh6)) | 0;
    mid = (mid + Math.imul(ah3, bl6)) | 0;
    hi = (hi + Math.imul(ah3, bh6)) | 0;
    lo = (lo + Math.imul(al2, bl7)) | 0;
    mid = (mid + Math.imul(al2, bh7)) | 0;
    mid = (mid + Math.imul(ah2, bl7)) | 0;
    hi = (hi + Math.imul(ah2, bh7)) | 0;
    lo = (lo + Math.imul(al1, bl8)) | 0;
    mid = (mid + Math.imul(al1, bh8)) | 0;
    mid = (mid + Math.imul(ah1, bl8)) | 0;
    hi = (hi + Math.imul(ah1, bh8)) | 0;
    lo = (lo + Math.imul(al0, bl9)) | 0;
    mid = (mid + Math.imul(al0, bh9)) | 0;
    mid = (mid + Math.imul(ah0, bl9)) | 0;
    hi = (hi + Math.imul(ah0, bh9)) | 0;
    var w9 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0;
    w9 &= 0x3ffffff;
    /* k = 10 */
    lo = Math.imul(al9, bl1);
    mid = Math.imul(al9, bh1);
    mid = (mid + Math.imul(ah9, bl1)) | 0;
    hi = Math.imul(ah9, bh1);
    lo = (lo + Math.imul(al8, bl2)) | 0;
    mid = (mid + Math.imul(al8, bh2)) | 0;
    mid = (mid + Math.imul(ah8, bl2)) | 0;
    hi = (hi + Math.imul(ah8, bh2)) | 0;
    lo = (lo + Math.imul(al7, bl3)) | 0;
    mid = (mid + Math.imul(al7, bh3)) | 0;
    mid = (mid + Math.imul(ah7, bl3)) | 0;
    hi = (hi + Math.imul(ah7, bh3)) | 0;
    lo = (lo + Math.imul(al6, bl4)) | 0;
    mid = (mid + Math.imul(al6, bh4)) | 0;
    mid = (mid + Math.imul(ah6, bl4)) | 0;
    hi = (hi + Math.imul(ah6, bh4)) | 0;
    lo = (lo + Math.imul(al5, bl5)) | 0;
    mid = (mid + Math.imul(al5, bh5)) | 0;
    mid = (mid + Math.imul(ah5, bl5)) | 0;
    hi = (hi + Math.imul(ah5, bh5)) | 0;
    lo = (lo + Math.imul(al4, bl6)) | 0;
    mid = (mid + Math.imul(al4, bh6)) | 0;
    mid = (mid + Math.imul(ah4, bl6)) | 0;
    hi = (hi + Math.imul(ah4, bh6)) | 0;
    lo = (lo + Math.imul(al3, bl7)) | 0;
    mid = (mid + Math.imul(al3, bh7)) | 0;
    mid = (mid + Math.imul(ah3, bl7)) | 0;
    hi = (hi + Math.imul(ah3, bh7)) | 0;
    lo = (lo + Math.imul(al2, bl8)) | 0;
    mid = (mid + Math.imul(al2, bh8)) | 0;
    mid = (mid + Math.imul(ah2, bl8)) | 0;
    hi = (hi + Math.imul(ah2, bh8)) | 0;
    lo = (lo + Math.imul(al1, bl9)) | 0;
    mid = (mid + Math.imul(al1, bh9)) | 0;
    mid = (mid + Math.imul(ah1, bl9)) | 0;
    hi = (hi + Math.imul(ah1, bh9)) | 0;
    var w10 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0;
    w10 &= 0x3ffffff;
    /* k = 11 */
    lo = Math.imul(al9, bl2);
    mid = Math.imul(al9, bh2);
    mid = (mid + Math.imul(ah9, bl2)) | 0;
    hi = Math.imul(ah9, bh2);
    lo = (lo + Math.imul(al8, bl3)) | 0;
    mid = (mid + Math.imul(al8, bh3)) | 0;
    mid = (mid + Math.imul(ah8, bl3)) | 0;
    hi = (hi + Math.imul(ah8, bh3)) | 0;
    lo = (lo + Math.imul(al7, bl4)) | 0;
    mid = (mid + Math.imul(al7, bh4)) | 0;
    mid = (mid + Math.imul(ah7, bl4)) | 0;
    hi = (hi + Math.imul(ah7, bh4)) | 0;
    lo = (lo + Math.imul(al6, bl5)) | 0;
    mid = (mid + Math.imul(al6, bh5)) | 0;
    mid = (mid + Math.imul(ah6, bl5)) | 0;
    hi = (hi + Math.imul(ah6, bh5)) | 0;
    lo = (lo + Math.imul(al5, bl6)) | 0;
    mid = (mid + Math.imul(al5, bh6)) | 0;
    mid = (mid + Math.imul(ah5, bl6)) | 0;
    hi = (hi + Math.imul(ah5, bh6)) | 0;
    lo = (lo + Math.imul(al4, bl7)) | 0;
    mid = (mid + Math.imul(al4, bh7)) | 0;
    mid = (mid + Math.imul(ah4, bl7)) | 0;
    hi = (hi + Math.imul(ah4, bh7)) | 0;
    lo = (lo + Math.imul(al3, bl8)) | 0;
    mid = (mid + Math.imul(al3, bh8)) | 0;
    mid = (mid + Math.imul(ah3, bl8)) | 0;
    hi = (hi + Math.imul(ah3, bh8)) | 0;
    lo = (lo + Math.imul(al2, bl9)) | 0;
    mid = (mid + Math.imul(al2, bh9)) | 0;
    mid = (mid + Math.imul(ah2, bl9)) | 0;
    hi = (hi + Math.imul(ah2, bh9)) | 0;
    var w11 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0;
    w11 &= 0x3ffffff;
    /* k = 12 */
    lo = Math.imul(al9, bl3);
    mid = Math.imul(al9, bh3);
    mid = (mid + Math.imul(ah9, bl3)) | 0;
    hi = Math.imul(ah9, bh3);
    lo = (lo + Math.imul(al8, bl4)) | 0;
    mid = (mid + Math.imul(al8, bh4)) | 0;
    mid = (mid + Math.imul(ah8, bl4)) | 0;
    hi = (hi + Math.imul(ah8, bh4)) | 0;
    lo = (lo + Math.imul(al7, bl5)) | 0;
    mid = (mid + Math.imul(al7, bh5)) | 0;
    mid = (mid + Math.imul(ah7, bl5)) | 0;
    hi = (hi + Math.imul(ah7, bh5)) | 0;
    lo = (lo + Math.imul(al6, bl6)) | 0;
    mid = (mid + Math.imul(al6, bh6)) | 0;
    mid = (mid + Math.imul(ah6, bl6)) | 0;
    hi = (hi + Math.imul(ah6, bh6)) | 0;
    lo = (lo + Math.imul(al5, bl7)) | 0;
    mid = (mid + Math.imul(al5, bh7)) | 0;
    mid = (mid + Math.imul(ah5, bl7)) | 0;
    hi = (hi + Math.imul(ah5, bh7)) | 0;
    lo = (lo + Math.imul(al4, bl8)) | 0;
    mid = (mid + Math.imul(al4, bh8)) | 0;
    mid = (mid + Math.imul(ah4, bl8)) | 0;
    hi = (hi + Math.imul(ah4, bh8)) | 0;
    lo = (lo + Math.imul(al3, bl9)) | 0;
    mid = (mid + Math.imul(al3, bh9)) | 0;
    mid = (mid + Math.imul(ah3, bl9)) | 0;
    hi = (hi + Math.imul(ah3, bh9)) | 0;
    var w12 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0;
    w12 &= 0x3ffffff;
    /* k = 13 */
    lo = Math.imul(al9, bl4);
    mid = Math.imul(al9, bh4);
    mid = (mid + Math.imul(ah9, bl4)) | 0;
    hi = Math.imul(ah9, bh4);
    lo = (lo + Math.imul(al8, bl5)) | 0;
    mid = (mid + Math.imul(al8, bh5)) | 0;
    mid = (mid + Math.imul(ah8, bl5)) | 0;
    hi = (hi + Math.imul(ah8, bh5)) | 0;
    lo = (lo + Math.imul(al7, bl6)) | 0;
    mid = (mid + Math.imul(al7, bh6)) | 0;
    mid = (mid + Math.imul(ah7, bl6)) | 0;
    hi = (hi + Math.imul(ah7, bh6)) | 0;
    lo = (lo + Math.imul(al6, bl7)) | 0;
    mid = (mid + Math.imul(al6, bh7)) | 0;
    mid = (mid + Math.imul(ah6, bl7)) | 0;
    hi = (hi + Math.imul(ah6, bh7)) | 0;
    lo = (lo + Math.imul(al5, bl8)) | 0;
    mid = (mid + Math.imul(al5, bh8)) | 0;
    mid = (mid + Math.imul(ah5, bl8)) | 0;
    hi = (hi + Math.imul(ah5, bh8)) | 0;
    lo = (lo + Math.imul(al4, bl9)) | 0;
    mid = (mid + Math.imul(al4, bh9)) | 0;
    mid = (mid + Math.imul(ah4, bl9)) | 0;
    hi = (hi + Math.imul(ah4, bh9)) | 0;
    var w13 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0;
    w13 &= 0x3ffffff;
    /* k = 14 */
    lo = Math.imul(al9, bl5);
    mid = Math.imul(al9, bh5);
    mid = (mid + Math.imul(ah9, bl5)) | 0;
    hi = Math.imul(ah9, bh5);
    lo = (lo + Math.imul(al8, bl6)) | 0;
    mid = (mid + Math.imul(al8, bh6)) | 0;
    mid = (mid + Math.imul(ah8, bl6)) | 0;
    hi = (hi + Math.imul(ah8, bh6)) | 0;
    lo = (lo + Math.imul(al7, bl7)) | 0;
    mid = (mid + Math.imul(al7, bh7)) | 0;
    mid = (mid + Math.imul(ah7, bl7)) | 0;
    hi = (hi + Math.imul(ah7, bh7)) | 0;
    lo = (lo + Math.imul(al6, bl8)) | 0;
    mid = (mid + Math.imul(al6, bh8)) | 0;
    mid = (mid + Math.imul(ah6, bl8)) | 0;
    hi = (hi + Math.imul(ah6, bh8)) | 0;
    lo = (lo + Math.imul(al5, bl9)) | 0;
    mid = (mid + Math.imul(al5, bh9)) | 0;
    mid = (mid + Math.imul(ah5, bl9)) | 0;
    hi = (hi + Math.imul(ah5, bh9)) | 0;
    var w14 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0;
    w14 &= 0x3ffffff;
    /* k = 15 */
    lo = Math.imul(al9, bl6);
    mid = Math.imul(al9, bh6);
    mid = (mid + Math.imul(ah9, bl6)) | 0;
    hi = Math.imul(ah9, bh6);
    lo = (lo + Math.imul(al8, bl7)) | 0;
    mid = (mid + Math.imul(al8, bh7)) | 0;
    mid = (mid + Math.imul(ah8, bl7)) | 0;
    hi = (hi + Math.imul(ah8, bh7)) | 0;
    lo = (lo + Math.imul(al7, bl8)) | 0;
    mid = (mid + Math.imul(al7, bh8)) | 0;
    mid = (mid + Math.imul(ah7, bl8)) | 0;
    hi = (hi + Math.imul(ah7, bh8)) | 0;
    lo = (lo + Math.imul(al6, bl9)) | 0;
    mid = (mid + Math.imul(al6, bh9)) | 0;
    mid = (mid + Math.imul(ah6, bl9)) | 0;
    hi = (hi + Math.imul(ah6, bh9)) | 0;
    var w15 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0;
    w15 &= 0x3ffffff;
    /* k = 16 */
    lo = Math.imul(al9, bl7);
    mid = Math.imul(al9, bh7);
    mid = (mid + Math.imul(ah9, bl7)) | 0;
    hi = Math.imul(ah9, bh7);
    lo = (lo + Math.imul(al8, bl8)) | 0;
    mid = (mid + Math.imul(al8, bh8)) | 0;
    mid = (mid + Math.imul(ah8, bl8)) | 0;
    hi = (hi + Math.imul(ah8, bh8)) | 0;
    lo = (lo + Math.imul(al7, bl9)) | 0;
    mid = (mid + Math.imul(al7, bh9)) | 0;
    mid = (mid + Math.imul(ah7, bl9)) | 0;
    hi = (hi + Math.imul(ah7, bh9)) | 0;
    var w16 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0;
    w16 &= 0x3ffffff;
    /* k = 17 */
    lo = Math.imul(al9, bl8);
    mid = Math.imul(al9, bh8);
    mid = (mid + Math.imul(ah9, bl8)) | 0;
    hi = Math.imul(ah9, bh8);
    lo = (lo + Math.imul(al8, bl9)) | 0;
    mid = (mid + Math.imul(al8, bh9)) | 0;
    mid = (mid + Math.imul(ah8, bl9)) | 0;
    hi = (hi + Math.imul(ah8, bh9)) | 0;
    var w17 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0;
    w17 &= 0x3ffffff;
    /* k = 18 */
    lo = Math.imul(al9, bl9);
    mid = Math.imul(al9, bh9);
    mid = (mid + Math.imul(ah9, bl9)) | 0;
    hi = Math.imul(ah9, bh9);
    var w18 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0;
    w18 &= 0x3ffffff;
    o[0] = w0;
    o[1] = w1;
    o[2] = w2;
    o[3] = w3;
    o[4] = w4;
    o[5] = w5;
    o[6] = w6;
    o[7] = w7;
    o[8] = w8;
    o[9] = w9;
    o[10] = w10;
    o[11] = w11;
    o[12] = w12;
    o[13] = w13;
    o[14] = w14;
    o[15] = w15;
    o[16] = w16;
    o[17] = w17;
    o[18] = w18;
    if (c !== 0) {
      o[19] = c;
      out.length++;
    }
    return out;
  };

  // Polyfill comb
  if (!Math.imul) {
    comb10MulTo = smallMulTo;
  }

  function bigMulTo (self, num, out) {
    out.negative = num.negative ^ self.negative;
    out.length = self.length + num.length;

    var carry = 0;
    var hncarry = 0;
    for (var k = 0; k < out.length - 1; k++) {
      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
      // note that ncarry could be >= 0x3ffffff
      var ncarry = hncarry;
      hncarry = 0;
      var rword = carry & 0x3ffffff;
      var maxJ = Math.min(k, num.length - 1);
      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
        var i = k - j;
        var a = self.words[i] | 0;
        var b = num.words[j] | 0;
        var r = a * b;

        var lo = r & 0x3ffffff;
        ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
        lo = (lo + rword) | 0;
        rword = lo & 0x3ffffff;
        ncarry = (ncarry + (lo >>> 26)) | 0;

        hncarry += ncarry >>> 26;
        ncarry &= 0x3ffffff;
      }
      out.words[k] = rword;
      carry = ncarry;
      ncarry = hncarry;
    }
    if (carry !== 0) {
      out.words[k] = carry;
    } else {
      out.length--;
    }

    return out._strip();
  }

  function jumboMulTo (self, num, out) {
    // Temporary disable, see https://github.com/indutny/bn.js/issues/211
    // var fftm = new FFTM();
    // return fftm.mulp(self, num, out);
    return bigMulTo(self, num, out);
  }

  BN.prototype.mulTo = function mulTo (num, out) {
    var res;
    var len = this.length + num.length;
    if (this.length === 10 && num.length === 10) {
      res = comb10MulTo(this, num, out);
    } else if (len < 63) {
      res = smallMulTo(this, num, out);
    } else if (len < 1024) {
      res = bigMulTo(this, num, out);
    } else {
      res = jumboMulTo(this, num, out);
    }

    return res;
  };

  // Cooley-Tukey algorithm for FFT
  // slightly revisited to rely on looping instead of recursion

  function FFTM (x, y) {
    this.x = x;
    this.y = y;
  }

  FFTM.prototype.makeRBT = function makeRBT (N) {
    var t = new Array(N);
    var l = BN.prototype._countBits(N) - 1;
    for (var i = 0; i < N; i++) {
      t[i] = this.revBin(i, l, N);
    }

    return t;
  };

  // Returns binary-reversed representation of `x`
  FFTM.prototype.revBin = function revBin (x, l, N) {
    if (x === 0 || x === N - 1) return x;

    var rb = 0;
    for (var i = 0; i < l; i++) {
      rb |= (x & 1) << (l - i - 1);
      x >>= 1;
    }

    return rb;
  };

  // Performs "tweedling" phase, therefore 'emulating'
  // behaviour of the recursive algorithm
  FFTM.prototype.permute = function permute (rbt, rws, iws, rtws, itws, N) {
    for (var i = 0; i < N; i++) {
      rtws[i] = rws[rbt[i]];
      itws[i] = iws[rbt[i]];
    }
  };

  FFTM.prototype.transform = function transform (rws, iws, rtws, itws, N, rbt) {
    this.permute(rbt, rws, iws, rtws, itws, N);

    for (var s = 1; s < N; s <<= 1) {
      var l = s << 1;

      var rtwdf = Math.cos(2 * Math.PI / l);
      var itwdf = Math.sin(2 * Math.PI / l);

      for (var p = 0; p < N; p += l) {
        var rtwdf_ = rtwdf;
        var itwdf_ = itwdf;

        for (var j = 0; j < s; j++) {
          var re = rtws[p + j];
          var ie = itws[p + j];

          var ro = rtws[p + j + s];
          var io = itws[p + j + s];

          var rx = rtwdf_ * ro - itwdf_ * io;

          io = rtwdf_ * io + itwdf_ * ro;
          ro = rx;

          rtws[p + j] = re + ro;
          itws[p + j] = ie + io;

          rtws[p + j + s] = re - ro;
          itws[p + j + s] = ie - io;

          /* jshint maxdepth : false */
          if (j !== l) {
            rx = rtwdf * rtwdf_ - itwdf * itwdf_;

            itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
            rtwdf_ = rx;
          }
        }
      }
    }
  };

  FFTM.prototype.guessLen13b = function guessLen13b (n, m) {
    var N = Math.max(m, n) | 1;
    var odd = N & 1;
    var i = 0;
    for (N = N / 2 | 0; N; N = N >>> 1) {
      i++;
    }

    return 1 << i + 1 + odd;
  };

  FFTM.prototype.conjugate = function conjugate (rws, iws, N) {
    if (N <= 1) return;

    for (var i = 0; i < N / 2; i++) {
      var t = rws[i];

      rws[i] = rws[N - i - 1];
      rws[N - i - 1] = t;

      t = iws[i];

      iws[i] = -iws[N - i - 1];
      iws[N - i - 1] = -t;
    }
  };

  FFTM.prototype.normalize13b = function normalize13b (ws, N) {
    var carry = 0;
    for (var i = 0; i < N / 2; i++) {
      var w = Math.round(ws[2 * i + 1] / N) * 0x2000 +
        Math.round(ws[2 * i] / N) +
        carry;

      ws[i] = w & 0x3ffffff;

      if (w < 0x4000000) {
        carry = 0;
      } else {
        carry = w / 0x4000000 | 0;
      }
    }

    return ws;
  };

  FFTM.prototype.convert13b = function convert13b (ws, len, rws, N) {
    var carry = 0;
    for (var i = 0; i < len; i++) {
      carry = carry + (ws[i] | 0);

      rws[2 * i] = carry & 0x1fff; carry = carry >>> 13;
      rws[2 * i + 1] = carry & 0x1fff; carry = carry >>> 13;
    }

    // Pad with zeroes
    for (i = 2 * len; i < N; ++i) {
      rws[i] = 0;
    }

    assert(carry === 0);
    assert((carry & ~0x1fff) === 0);
  };

  FFTM.prototype.stub = function stub (N) {
    var ph = new Array(N);
    for (var i = 0; i < N; i++) {
      ph[i] = 0;
    }

    return ph;
  };

  FFTM.prototype.mulp = function mulp (x, y, out) {
    var N = 2 * this.guessLen13b(x.length, y.length);

    var rbt = this.makeRBT(N);

    var _ = this.stub(N);

    var rws = new Array(N);
    var rwst = new Array(N);
    var iwst = new Array(N);

    var nrws = new Array(N);
    var nrwst = new Array(N);
    var niwst = new Array(N);

    var rmws = out.words;
    rmws.length = N;

    this.convert13b(x.words, x.length, rws, N);
    this.convert13b(y.words, y.length, nrws, N);

    this.transform(rws, _, rwst, iwst, N, rbt);
    this.transform(nrws, _, nrwst, niwst, N, rbt);

    for (var i = 0; i < N; i++) {
      var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
      iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
      rwst[i] = rx;
    }

    this.conjugate(rwst, iwst, N);
    this.transform(rwst, iwst, rmws, _, N, rbt);
    this.conjugate(rmws, _, N);
    this.normalize13b(rmws, N);

    out.negative = x.negative ^ y.negative;
    out.length = x.length + y.length;
    return out._strip();
  };

  // Multiply `this` by `num`
  BN.prototype.mul = function mul (num) {
    var out = new BN(null);
    out.words = new Array(this.length + num.length);
    return this.mulTo(num, out);
  };

  // Multiply employing FFT
  BN.prototype.mulf = function mulf (num) {
    var out = new BN(null);
    out.words = new Array(this.length + num.length);
    return jumboMulTo(this, num, out);
  };

  // In-place Multiplication
  BN.prototype.imul = function imul (num) {
    return this.clone().mulTo(num, this);
  };

  BN.prototype.imuln = function imuln (num) {
    var isNegNum = num < 0;
    if (isNegNum) num = -num;

    assert(typeof num === 'number');
    assert(num < 0x4000000);

    // Carry
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var w = (this.words[i] | 0) * num;
      var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
      carry >>= 26;
      carry += (w / 0x4000000) | 0;
      // NOTE: lo is 27bit maximum
      carry += lo >>> 26;
      this.words[i] = lo & 0x3ffffff;
    }

    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }

    return isNegNum ? this.ineg() : this;
  };

  BN.prototype.muln = function muln (num) {
    return this.clone().imuln(num);
  };

  // `this` * `this`
  BN.prototype.sqr = function sqr () {
    return this.mul(this);
  };

  // `this` * `this` in-place
  BN.prototype.isqr = function isqr () {
    return this.imul(this.clone());
  };

  // Math.pow(`this`, `num`)
  BN.prototype.pow = function pow (num) {
    var w = toBitArray(num);
    if (w.length === 0) return new BN(1);

    // Skip leading zeroes
    var res = this;
    for (var i = 0; i < w.length; i++, res = res.sqr()) {
      if (w[i] !== 0) break;
    }

    if (++i < w.length) {
      for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
        if (w[i] === 0) continue;

        res = res.mul(q);
      }
    }

    return res;
  };

  // Shift-left in-place
  BN.prototype.iushln = function iushln (bits) {
    assert(typeof bits === 'number' && bits >= 0);
    var r = bits % 26;
    var s = (bits - r) / 26;
    var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);
    var i;

    if (r !== 0) {
      var carry = 0;

      for (i = 0; i < this.length; i++) {
        var newCarry = this.words[i] & carryMask;
        var c = ((this.words[i] | 0) - newCarry) << r;
        this.words[i] = c | carry;
        carry = newCarry >>> (26 - r);
      }

      if (carry) {
        this.words[i] = carry;
        this.length++;
      }
    }

    if (s !== 0) {
      for (i = this.length - 1; i >= 0; i--) {
        this.words[i + s] = this.words[i];
      }

      for (i = 0; i < s; i++) {
        this.words[i] = 0;
      }

      this.length += s;
    }

    return this._strip();
  };

  BN.prototype.ishln = function ishln (bits) {
    // TODO(indutny): implement me
    assert(this.negative === 0);
    return this.iushln(bits);
  };

  // Shift-right in-place
  // NOTE: `hint` is a lowest bit before trailing zeroes
  // NOTE: if `extended` is present - it will be filled with destroyed bits
  BN.prototype.iushrn = function iushrn (bits, hint, extended) {
    assert(typeof bits === 'number' && bits >= 0);
    var h;
    if (hint) {
      h = (hint - (hint % 26)) / 26;
    } else {
      h = 0;
    }

    var r = bits % 26;
    var s = Math.min((bits - r) / 26, this.length);
    var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
    var maskedWords = extended;

    h -= s;
    h = Math.max(0, h);

    // Extended mode, copy masked part
    if (maskedWords) {
      for (var i = 0; i < s; i++) {
        maskedWords.words[i] = this.words[i];
      }
      maskedWords.length = s;
    }

    if (s === 0) {
      // No-op, we should not move anything at all
    } else if (this.length > s) {
      this.length -= s;
      for (i = 0; i < this.length; i++) {
        this.words[i] = this.words[i + s];
      }
    } else {
      this.words[0] = 0;
      this.length = 1;
    }

    var carry = 0;
    for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
      var word = this.words[i] | 0;
      this.words[i] = (carry << (26 - r)) | (word >>> r);
      carry = word & mask;
    }

    // Push carried bits as a mask
    if (maskedWords && carry !== 0) {
      maskedWords.words[maskedWords.length++] = carry;
    }

    if (this.length === 0) {
      this.words[0] = 0;
      this.length = 1;
    }

    return this._strip();
  };

  BN.prototype.ishrn = function ishrn (bits, hint, extended) {
    // TODO(indutny): implement me
    assert(this.negative === 0);
    return this.iushrn(bits, hint, extended);
  };

  // Shift-left
  BN.prototype.shln = function shln (bits) {
    return this.clone().ishln(bits);
  };

  BN.prototype.ushln = function ushln (bits) {
    return this.clone().iushln(bits);
  };

  // Shift-right
  BN.prototype.shrn = function shrn (bits) {
    return this.clone().ishrn(bits);
  };

  BN.prototype.ushrn = function ushrn (bits) {
    return this.clone().iushrn(bits);
  };

  // Test if n bit is set
  BN.prototype.testn = function testn (bit) {
    assert(typeof bit === 'number' && bit >= 0);
    var r = bit % 26;
    var s = (bit - r) / 26;
    var q = 1 << r;

    // Fast case: bit is much higher than all existing words
    if (this.length <= s) return false;

    // Check bit and return
    var w = this.words[s];

    return !!(w & q);
  };

  // Return only lowers bits of number (in-place)
  BN.prototype.imaskn = function imaskn (bits) {
    assert(typeof bits === 'number' && bits >= 0);
    var r = bits % 26;
    var s = (bits - r) / 26;

    assert(this.negative === 0, 'imaskn works only with positive numbers');

    if (this.length <= s) {
      return this;
    }

    if (r !== 0) {
      s++;
    }
    this.length = Math.min(s, this.length);

    if (r !== 0) {
      var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
      this.words[this.length - 1] &= mask;
    }

    return this._strip();
  };

  // Return only lowers bits of number
  BN.prototype.maskn = function maskn (bits) {
    return this.clone().imaskn(bits);
  };

  // Add plain number `num` to `this`
  BN.prototype.iaddn = function iaddn (num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);
    if (num < 0) return this.isubn(-num);

    // Possible sign change
    if (this.negative !== 0) {
      if (this.length === 1 && (this.words[0] | 0) <= num) {
        this.words[0] = num - (this.words[0] | 0);
        this.negative = 0;
        return this;
      }

      this.negative = 0;
      this.isubn(num);
      this.negative = 1;
      return this;
    }

    // Add without checks
    return this._iaddn(num);
  };

  BN.prototype._iaddn = function _iaddn (num) {
    this.words[0] += num;

    // Carry
    for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
      this.words[i] -= 0x4000000;
      if (i === this.length - 1) {
        this.words[i + 1] = 1;
      } else {
        this.words[i + 1]++;
      }
    }
    this.length = Math.max(this.length, i + 1);

    return this;
  };

  // Subtract plain number `num` from `this`
  BN.prototype.isubn = function isubn (num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);
    if (num < 0) return this.iaddn(-num);

    if (this.negative !== 0) {
      this.negative = 0;
      this.iaddn(num);
      this.negative = 1;
      return this;
    }

    this.words[0] -= num;

    if (this.length === 1 && this.words[0] < 0) {
      this.words[0] = -this.words[0];
      this.negative = 1;
    } else {
      // Carry
      for (var i = 0; i < this.length && this.words[i] < 0; i++) {
        this.words[i] += 0x4000000;
        this.words[i + 1] -= 1;
      }
    }

    return this._strip();
  };

  BN.prototype.addn = function addn (num) {
    return this.clone().iaddn(num);
  };

  BN.prototype.subn = function subn (num) {
    return this.clone().isubn(num);
  };

  BN.prototype.iabs = function iabs () {
    this.negative = 0;

    return this;
  };

  BN.prototype.abs = function abs () {
    return this.clone().iabs();
  };

  BN.prototype._ishlnsubmul = function _ishlnsubmul (num, mul, shift) {
    var len = num.length + shift;
    var i;

    this._expand(len);

    var w;
    var carry = 0;
    for (i = 0; i < num.length; i++) {
      w = (this.words[i + shift] | 0) + carry;
      var right = (num.words[i] | 0) * mul;
      w -= right & 0x3ffffff;
      carry = (w >> 26) - ((right / 0x4000000) | 0);
      this.words[i + shift] = w & 0x3ffffff;
    }
    for (; i < this.length - shift; i++) {
      w = (this.words[i + shift] | 0) + carry;
      carry = w >> 26;
      this.words[i + shift] = w & 0x3ffffff;
    }

    if (carry === 0) return this._strip();

    // Subtraction overflow
    assert(carry === -1);
    carry = 0;
    for (i = 0; i < this.length; i++) {
      w = -(this.words[i] | 0) + carry;
      carry = w >> 26;
      this.words[i] = w & 0x3ffffff;
    }
    this.negative = 1;

    return this._strip();
  };

  BN.prototype._wordDiv = function _wordDiv (num, mode) {
    var shift = this.length - num.length;

    var a = this.clone();
    var b = num;

    // Normalize
    var bhi = b.words[b.length - 1] | 0;
    var bhiBits = this._countBits(bhi);
    shift = 26 - bhiBits;
    if (shift !== 0) {
      b = b.ushln(shift);
      a.iushln(shift);
      bhi = b.words[b.length - 1] | 0;
    }

    // Initialize quotient
    var m = a.length - b.length;
    var q;

    if (mode !== 'mod') {
      q = new BN(null);
      q.length = m + 1;
      q.words = new Array(q.length);
      for (var i = 0; i < q.length; i++) {
        q.words[i] = 0;
      }
    }

    var diff = a.clone()._ishlnsubmul(b, 1, m);
    if (diff.negative === 0) {
      a = diff;
      if (q) {
        q.words[m] = 1;
      }
    }

    for (var j = m - 1; j >= 0; j--) {
      var qj = (a.words[b.length + j] | 0) * 0x4000000 +
        (a.words[b.length + j - 1] | 0);

      // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
      // (0x7ffffff)
      qj = Math.min((qj / bhi) | 0, 0x3ffffff);

      a._ishlnsubmul(b, qj, j);
      while (a.negative !== 0) {
        qj--;
        a.negative = 0;
        a._ishlnsubmul(b, 1, j);
        if (!a.isZero()) {
          a.negative ^= 1;
        }
      }
      if (q) {
        q.words[j] = qj;
      }
    }
    if (q) {
      q._strip();
    }
    a._strip();

    // Denormalize
    if (mode !== 'div' && shift !== 0) {
      a.iushrn(shift);
    }

    return {
      div: q || null,
      mod: a
    };
  };

  // NOTE: 1) `mode` can be set to `mod` to request mod only,
  //       to `div` to request div only, or be absent to
  //       request both div & mod
  //       2) `positive` is true if unsigned mod is requested
  BN.prototype.divmod = function divmod (num, mode, positive) {
    assert(!num.isZero());

    if (this.isZero()) {
      return {
        div: new BN(0),
        mod: new BN(0)
      };
    }

    var div, mod, res;
    if (this.negative !== 0 && num.negative === 0) {
      res = this.neg().divmod(num, mode);

      if (mode !== 'mod') {
        div = res.div.neg();
      }

      if (mode !== 'div') {
        mod = res.mod.neg();
        if (positive && mod.negative !== 0) {
          mod.iadd(num);
        }
      }

      return {
        div: div,
        mod: mod
      };
    }

    if (this.negative === 0 && num.negative !== 0) {
      res = this.divmod(num.neg(), mode);

      if (mode !== 'mod') {
        div = res.div.neg();
      }

      return {
        div: div,
        mod: res.mod
      };
    }

    if ((this.negative & num.negative) !== 0) {
      res = this.neg().divmod(num.neg(), mode);

      if (mode !== 'div') {
        mod = res.mod.neg();
        if (positive && mod.negative !== 0) {
          mod.isub(num);
        }
      }

      return {
        div: res.div,
        mod: mod
      };
    }

    // Both numbers are positive at this point

    // Strip both numbers to approximate shift value
    if (num.length > this.length || this.cmp(num) < 0) {
      return {
        div: new BN(0),
        mod: this
      };
    }

    // Very short reduction
    if (num.length === 1) {
      if (mode === 'div') {
        return {
          div: this.divn(num.words[0]),
          mod: null
        };
      }

      if (mode === 'mod') {
        return {
          div: null,
          mod: new BN(this.modrn(num.words[0]))
        };
      }

      return {
        div: this.divn(num.words[0]),
        mod: new BN(this.modrn(num.words[0]))
      };
    }

    return this._wordDiv(num, mode);
  };

  // Find `this` / `num`
  BN.prototype.div = function div (num) {
    return this.divmod(num, 'div', false).div;
  };

  // Find `this` % `num`
  BN.prototype.mod = function mod (num) {
    return this.divmod(num, 'mod', false).mod;
  };

  BN.prototype.umod = function umod (num) {
    return this.divmod(num, 'mod', true).mod;
  };

  // Find Round(`this` / `num`)
  BN.prototype.divRound = function divRound (num) {
    var dm = this.divmod(num);

    // Fast case - exact division
    if (dm.mod.isZero()) return dm.div;

    var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

    var half = num.ushrn(1);
    var r2 = num.andln(1);
    var cmp = mod.cmp(half);

    // Round down
    if (cmp < 0 || (r2 === 1 && cmp === 0)) return dm.div;

    // Round up
    return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
  };

  BN.prototype.modrn = function modrn (num) {
    var isNegNum = num < 0;
    if (isNegNum) num = -num;

    assert(num <= 0x3ffffff);
    var p = (1 << 26) % num;

    var acc = 0;
    for (var i = this.length - 1; i >= 0; i--) {
      acc = (p * acc + (this.words[i] | 0)) % num;
    }

    return isNegNum ? -acc : acc;
  };

  // WARNING: DEPRECATED
  BN.prototype.modn = function modn (num) {
    return this.modrn(num);
  };

  // In-place division by number
  BN.prototype.idivn = function idivn (num) {
    var isNegNum = num < 0;
    if (isNegNum) num = -num;

    assert(num <= 0x3ffffff);

    var carry = 0;
    for (var i = this.length - 1; i >= 0; i--) {
      var w = (this.words[i] | 0) + carry * 0x4000000;
      this.words[i] = (w / num) | 0;
      carry = w % num;
    }

    this._strip();
    return isNegNum ? this.ineg() : this;
  };

  BN.prototype.divn = function divn (num) {
    return this.clone().idivn(num);
  };

  BN.prototype.egcd = function egcd (p) {
    assert(p.negative === 0);
    assert(!p.isZero());

    var x = this;
    var y = p.clone();

    if (x.negative !== 0) {
      x = x.umod(p);
    } else {
      x = x.clone();
    }

    // A * x + B * y = x
    var A = new BN(1);
    var B = new BN(0);

    // C * x + D * y = y
    var C = new BN(0);
    var D = new BN(1);

    var g = 0;

    while (x.isEven() && y.isEven()) {
      x.iushrn(1);
      y.iushrn(1);
      ++g;
    }

    var yp = y.clone();
    var xp = x.clone();

    while (!x.isZero()) {
      for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
      if (i > 0) {
        x.iushrn(i);
        while (i-- > 0) {
          if (A.isOdd() || B.isOdd()) {
            A.iadd(yp);
            B.isub(xp);
          }

          A.iushrn(1);
          B.iushrn(1);
        }
      }

      for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
      if (j > 0) {
        y.iushrn(j);
        while (j-- > 0) {
          if (C.isOdd() || D.isOdd()) {
            C.iadd(yp);
            D.isub(xp);
          }

          C.iushrn(1);
          D.iushrn(1);
        }
      }

      if (x.cmp(y) >= 0) {
        x.isub(y);
        A.isub(C);
        B.isub(D);
      } else {
        y.isub(x);
        C.isub(A);
        D.isub(B);
      }
    }

    return {
      a: C,
      b: D,
      gcd: y.iushln(g)
    };
  };

  // This is reduced incarnation of the binary EEA
  // above, designated to invert members of the
  // _prime_ fields F(p) at a maximal speed
  BN.prototype._invmp = function _invmp (p) {
    assert(p.negative === 0);
    assert(!p.isZero());

    var a = this;
    var b = p.clone();

    if (a.negative !== 0) {
      a = a.umod(p);
    } else {
      a = a.clone();
    }

    var x1 = new BN(1);
    var x2 = new BN(0);

    var delta = b.clone();

    while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
      for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
      if (i > 0) {
        a.iushrn(i);
        while (i-- > 0) {
          if (x1.isOdd()) {
            x1.iadd(delta);
          }

          x1.iushrn(1);
        }
      }

      for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
      if (j > 0) {
        b.iushrn(j);
        while (j-- > 0) {
          if (x2.isOdd()) {
            x2.iadd(delta);
          }

          x2.iushrn(1);
        }
      }

      if (a.cmp(b) >= 0) {
        a.isub(b);
        x1.isub(x2);
      } else {
        b.isub(a);
        x2.isub(x1);
      }
    }

    var res;
    if (a.cmpn(1) === 0) {
      res = x1;
    } else {
      res = x2;
    }

    if (res.cmpn(0) < 0) {
      res.iadd(p);
    }

    return res;
  };

  BN.prototype.gcd = function gcd (num) {
    if (this.isZero()) return num.abs();
    if (num.isZero()) return this.abs();

    var a = this.clone();
    var b = num.clone();
    a.negative = 0;
    b.negative = 0;

    // Remove common factor of two
    for (var shift = 0; a.isEven() && b.isEven(); shift++) {
      a.iushrn(1);
      b.iushrn(1);
    }

    do {
      while (a.isEven()) {
        a.iushrn(1);
      }
      while (b.isEven()) {
        b.iushrn(1);
      }

      var r = a.cmp(b);
      if (r < 0) {
        // Swap `a` and `b` to make `a` always bigger than `b`
        var t = a;
        a = b;
        b = t;
      } else if (r === 0 || b.cmpn(1) === 0) {
        break;
      }

      a.isub(b);
    } while (true);

    return b.iushln(shift);
  };

  // Invert number in the field F(num)
  BN.prototype.invm = function invm (num) {
    return this.egcd(num).a.umod(num);
  };

  BN.prototype.isEven = function isEven () {
    return (this.words[0] & 1) === 0;
  };

  BN.prototype.isOdd = function isOdd () {
    return (this.words[0] & 1) === 1;
  };

  // And first word and num
  BN.prototype.andln = function andln (num) {
    return this.words[0] & num;
  };

  // Increment at the bit position in-line
  BN.prototype.bincn = function bincn (bit) {
    assert(typeof bit === 'number');
    var r = bit % 26;
    var s = (bit - r) / 26;
    var q = 1 << r;

    // Fast case: bit is much higher than all existing words
    if (this.length <= s) {
      this._expand(s + 1);
      this.words[s] |= q;
      return this;
    }

    // Add bit and propagate, if needed
    var carry = q;
    for (var i = s; carry !== 0 && i < this.length; i++) {
      var w = this.words[i] | 0;
      w += carry;
      carry = w >>> 26;
      w &= 0x3ffffff;
      this.words[i] = w;
    }
    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }
    return this;
  };

  BN.prototype.isZero = function isZero () {
    return this.length === 1 && this.words[0] === 0;
  };

  BN.prototype.cmpn = function cmpn (num) {
    var negative = num < 0;

    if (this.negative !== 0 && !negative) return -1;
    if (this.negative === 0 && negative) return 1;

    this._strip();

    var res;
    if (this.length > 1) {
      res = 1;
    } else {
      if (negative) {
        num = -num;
      }

      assert(num <= 0x3ffffff, 'Number is too big');

      var w = this.words[0] | 0;
      res = w === num ? 0 : w < num ? -1 : 1;
    }
    if (this.negative !== 0) return -res | 0;
    return res;
  };

  // Compare two numbers and return:
  // 1 - if `this` > `num`
  // 0 - if `this` == `num`
  // -1 - if `this` < `num`
  BN.prototype.cmp = function cmp (num) {
    if (this.negative !== 0 && num.negative === 0) return -1;
    if (this.negative === 0 && num.negative !== 0) return 1;

    var res = this.ucmp(num);
    if (this.negative !== 0) return -res | 0;
    return res;
  };

  // Unsigned comparison
  BN.prototype.ucmp = function ucmp (num) {
    // At this point both numbers have the same sign
    if (this.length > num.length) return 1;
    if (this.length < num.length) return -1;

    var res = 0;
    for (var i = this.length - 1; i >= 0; i--) {
      var a = this.words[i] | 0;
      var b = num.words[i] | 0;

      if (a === b) continue;
      if (a < b) {
        res = -1;
      } else if (a > b) {
        res = 1;
      }
      break;
    }
    return res;
  };

  BN.prototype.gtn = function gtn (num) {
    return this.cmpn(num) === 1;
  };

  BN.prototype.gt = function gt (num) {
    return this.cmp(num) === 1;
  };

  BN.prototype.gten = function gten (num) {
    return this.cmpn(num) >= 0;
  };

  BN.prototype.gte = function gte (num) {
    return this.cmp(num) >= 0;
  };

  BN.prototype.ltn = function ltn (num) {
    return this.cmpn(num) === -1;
  };

  BN.prototype.lt = function lt (num) {
    return this.cmp(num) === -1;
  };

  BN.prototype.lten = function lten (num) {
    return this.cmpn(num) <= 0;
  };

  BN.prototype.lte = function lte (num) {
    return this.cmp(num) <= 0;
  };

  BN.prototype.eqn = function eqn (num) {
    return this.cmpn(num) === 0;
  };

  BN.prototype.eq = function eq (num) {
    return this.cmp(num) === 0;
  };

  //
  // A reduce context, could be using montgomery or something better, depending
  // on the `m` itself.
  //
  BN.red = function red (num) {
    return new Red(num);
  };

  BN.prototype.toRed = function toRed (ctx) {
    assert(!this.red, 'Already a number in reduction context');
    assert(this.negative === 0, 'red works only with positives');
    return ctx.convertTo(this)._forceRed(ctx);
  };

  BN.prototype.fromRed = function fromRed () {
    assert(this.red, 'fromRed works only with numbers in reduction context');
    return this.red.convertFrom(this);
  };

  BN.prototype._forceRed = function _forceRed (ctx) {
    this.red = ctx;
    return this;
  };

  BN.prototype.forceRed = function forceRed (ctx) {
    assert(!this.red, 'Already a number in reduction context');
    return this._forceRed(ctx);
  };

  BN.prototype.redAdd = function redAdd (num) {
    assert(this.red, 'redAdd works only with red numbers');
    return this.red.add(this, num);
  };

  BN.prototype.redIAdd = function redIAdd (num) {
    assert(this.red, 'redIAdd works only with red numbers');
    return this.red.iadd(this, num);
  };

  BN.prototype.redSub = function redSub (num) {
    assert(this.red, 'redSub works only with red numbers');
    return this.red.sub(this, num);
  };

  BN.prototype.redISub = function redISub (num) {
    assert(this.red, 'redISub works only with red numbers');
    return this.red.isub(this, num);
  };

  BN.prototype.redShl = function redShl (num) {
    assert(this.red, 'redShl works only with red numbers');
    return this.red.shl(this, num);
  };

  BN.prototype.redMul = function redMul (num) {
    assert(this.red, 'redMul works only with red numbers');
    this.red._verify2(this, num);
    return this.red.mul(this, num);
  };

  BN.prototype.redIMul = function redIMul (num) {
    assert(this.red, 'redMul works only with red numbers');
    this.red._verify2(this, num);
    return this.red.imul(this, num);
  };

  BN.prototype.redSqr = function redSqr () {
    assert(this.red, 'redSqr works only with red numbers');
    this.red._verify1(this);
    return this.red.sqr(this);
  };

  BN.prototype.redISqr = function redISqr () {
    assert(this.red, 'redISqr works only with red numbers');
    this.red._verify1(this);
    return this.red.isqr(this);
  };

  // Square root over p
  BN.prototype.redSqrt = function redSqrt () {
    assert(this.red, 'redSqrt works only with red numbers');
    this.red._verify1(this);
    return this.red.sqrt(this);
  };

  BN.prototype.redInvm = function redInvm () {
    assert(this.red, 'redInvm works only with red numbers');
    this.red._verify1(this);
    return this.red.invm(this);
  };

  // Return negative clone of `this` % `red modulo`
  BN.prototype.redNeg = function redNeg () {
    assert(this.red, 'redNeg works only with red numbers');
    this.red._verify1(this);
    return this.red.neg(this);
  };

  BN.prototype.redPow = function redPow (num) {
    assert(this.red && !num.red, 'redPow(normalNum)');
    this.red._verify1(this);
    return this.red.pow(this, num);
  };

  // Prime numbers with efficient reduction
  var primes = {
    k256: null,
    p224: null,
    p192: null,
    p25519: null
  };

  // Pseudo-Mersenne prime
  function MPrime (name, p) {
    // P = 2 ^ N - K
    this.name = name;
    this.p = new BN(p, 16);
    this.n = this.p.bitLength();
    this.k = new BN(1).iushln(this.n).isub(this.p);

    this.tmp = this._tmp();
  }

  MPrime.prototype._tmp = function _tmp () {
    var tmp = new BN(null);
    tmp.words = new Array(Math.ceil(this.n / 13));
    return tmp;
  };

  MPrime.prototype.ireduce = function ireduce (num) {
    // Assumes that `num` is less than `P^2`
    // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
    var r = num;
    var rlen;

    do {
      this.split(r, this.tmp);
      r = this.imulK(r);
      r = r.iadd(this.tmp);
      rlen = r.bitLength();
    } while (rlen > this.n);

    var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
    if (cmp === 0) {
      r.words[0] = 0;
      r.length = 1;
    } else if (cmp > 0) {
      r.isub(this.p);
    } else {
      if (r.strip !== undefined) {
        // r is a BN v4 instance
        r.strip();
      } else {
        // r is a BN v5 instance
        r._strip();
      }
    }

    return r;
  };

  MPrime.prototype.split = function split (input, out) {
    input.iushrn(this.n, 0, out);
  };

  MPrime.prototype.imulK = function imulK (num) {
    return num.imul(this.k);
  };

  function K256 () {
    MPrime.call(
      this,
      'k256',
      'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
  }
  inherits(K256, MPrime);

  K256.prototype.split = function split (input, output) {
    // 256 = 9 * 26 + 22
    var mask = 0x3fffff;

    var outLen = Math.min(input.length, 9);
    for (var i = 0; i < outLen; i++) {
      output.words[i] = input.words[i];
    }
    output.length = outLen;

    if (input.length <= 9) {
      input.words[0] = 0;
      input.length = 1;
      return;
    }

    // Shift by 9 limbs
    var prev = input.words[9];
    output.words[output.length++] = prev & mask;

    for (i = 10; i < input.length; i++) {
      var next = input.words[i] | 0;
      input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
      prev = next;
    }
    prev >>>= 22;
    input.words[i - 10] = prev;
    if (prev === 0 && input.length > 10) {
      input.length -= 10;
    } else {
      input.length -= 9;
    }
  };

  K256.prototype.imulK = function imulK (num) {
    // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
    num.words[num.length] = 0;
    num.words[num.length + 1] = 0;
    num.length += 2;

    // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
    var lo = 0;
    for (var i = 0; i < num.length; i++) {
      var w = num.words[i] | 0;
      lo += w * 0x3d1;
      num.words[i] = lo & 0x3ffffff;
      lo = w * 0x40 + ((lo / 0x4000000) | 0);
    }

    // Fast length reduction
    if (num.words[num.length - 1] === 0) {
      num.length--;
      if (num.words[num.length - 1] === 0) {
        num.length--;
      }
    }
    return num;
  };

  function P224 () {
    MPrime.call(
      this,
      'p224',
      'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
  }
  inherits(P224, MPrime);

  function P192 () {
    MPrime.call(
      this,
      'p192',
      'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
  }
  inherits(P192, MPrime);

  function P25519 () {
    // 2 ^ 255 - 19
    MPrime.call(
      this,
      '25519',
      '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
  }
  inherits(P25519, MPrime);

  P25519.prototype.imulK = function imulK (num) {
    // K = 0x13
    var carry = 0;
    for (var i = 0; i < num.length; i++) {
      var hi = (num.words[i] | 0) * 0x13 + carry;
      var lo = hi & 0x3ffffff;
      hi >>>= 26;

      num.words[i] = lo;
      carry = hi;
    }
    if (carry !== 0) {
      num.words[num.length++] = carry;
    }
    return num;
  };

  // Exported mostly for testing purposes, use plain name instead
  BN._prime = function prime (name) {
    // Cached version of prime
    if (primes[name]) return primes[name];

    var prime;
    if (name === 'k256') {
      prime = new K256();
    } else if (name === 'p224') {
      prime = new P224();
    } else if (name === 'p192') {
      prime = new P192();
    } else if (name === 'p25519') {
      prime = new P25519();
    } else {
      throw new Error('Unknown prime ' + name);
    }
    primes[name] = prime;

    return prime;
  };

  //
  // Base reduction engine
  //
  function Red (m) {
    if (typeof m === 'string') {
      var prime = BN._prime(m);
      this.m = prime.p;
      this.prime = prime;
    } else {
      assert(m.gtn(1), 'modulus must be greater than 1');
      this.m = m;
      this.prime = null;
    }
  }

  Red.prototype._verify1 = function _verify1 (a) {
    assert(a.negative === 0, 'red works only with positives');
    assert(a.red, 'red works only with red numbers');
  };

  Red.prototype._verify2 = function _verify2 (a, b) {
    assert((a.negative | b.negative) === 0, 'red works only with positives');
    assert(a.red && a.red === b.red,
      'red works only with red numbers');
  };

  Red.prototype.imod = function imod (a) {
    if (this.prime) return this.prime.ireduce(a)._forceRed(this);

    move(a, a.umod(this.m)._forceRed(this));
    return a;
  };

  Red.prototype.neg = function neg (a) {
    if (a.isZero()) {
      return a.clone();
    }

    return this.m.sub(a)._forceRed(this);
  };

  Red.prototype.add = function add (a, b) {
    this._verify2(a, b);

    var res = a.add(b);
    if (res.cmp(this.m) >= 0) {
      res.isub(this.m);
    }
    return res._forceRed(this);
  };

  Red.prototype.iadd = function iadd (a, b) {
    this._verify2(a, b);

    var res = a.iadd(b);
    if (res.cmp(this.m) >= 0) {
      res.isub(this.m);
    }
    return res;
  };

  Red.prototype.sub = function sub (a, b) {
    this._verify2(a, b);

    var res = a.sub(b);
    if (res.cmpn(0) < 0) {
      res.iadd(this.m);
    }
    return res._forceRed(this);
  };

  Red.prototype.isub = function isub (a, b) {
    this._verify2(a, b);

    var res = a.isub(b);
    if (res.cmpn(0) < 0) {
      res.iadd(this.m);
    }
    return res;
  };

  Red.prototype.shl = function shl (a, num) {
    this._verify1(a);
    return this.imod(a.ushln(num));
  };

  Red.prototype.imul = function imul (a, b) {
    this._verify2(a, b);
    return this.imod(a.imul(b));
  };

  Red.prototype.mul = function mul (a, b) {
    this._verify2(a, b);
    return this.imod(a.mul(b));
  };

  Red.prototype.isqr = function isqr (a) {
    return this.imul(a, a.clone());
  };

  Red.prototype.sqr = function sqr (a) {
    return this.mul(a, a);
  };

  Red.prototype.sqrt = function sqrt (a) {
    if (a.isZero()) return a.clone();

    var mod3 = this.m.andln(3);
    assert(mod3 % 2 === 1);

    // Fast case
    if (mod3 === 3) {
      var pow = this.m.add(new BN(1)).iushrn(2);
      return this.pow(a, pow);
    }

    // Tonelli-Shanks algorithm (Totally unoptimized and slow)
    //
    // Find Q and S, that Q * 2 ^ S = (P - 1)
    var q = this.m.subn(1);
    var s = 0;
    while (!q.isZero() && q.andln(1) === 0) {
      s++;
      q.iushrn(1);
    }
    assert(!q.isZero());

    var one = new BN(1).toRed(this);
    var nOne = one.redNeg();

    // Find quadratic non-residue
    // NOTE: Max is such because of generalized Riemann hypothesis.
    var lpow = this.m.subn(1).iushrn(1);
    var z = this.m.bitLength();
    z = new BN(2 * z * z).toRed(this);

    while (this.pow(z, lpow).cmp(nOne) !== 0) {
      z.redIAdd(nOne);
    }

    var c = this.pow(z, q);
    var r = this.pow(a, q.addn(1).iushrn(1));
    var t = this.pow(a, q);
    var m = s;
    while (t.cmp(one) !== 0) {
      var tmp = t;
      for (var i = 0; tmp.cmp(one) !== 0; i++) {
        tmp = tmp.redSqr();
      }
      assert(i < m);
      var b = this.pow(c, new BN(1).iushln(m - i - 1));

      r = r.redMul(b);
      c = b.redSqr();
      t = t.redMul(c);
      m = i;
    }

    return r;
  };

  Red.prototype.invm = function invm (a) {
    var inv = a._invmp(this.m);
    if (inv.negative !== 0) {
      inv.negative = 0;
      return this.imod(inv).redNeg();
    } else {
      return this.imod(inv);
    }
  };

  Red.prototype.pow = function pow (a, num) {
    if (num.isZero()) return new BN(1).toRed(this);
    if (num.cmpn(1) === 0) return a.clone();

    var windowSize = 4;
    var wnd = new Array(1 << windowSize);
    wnd[0] = new BN(1).toRed(this);
    wnd[1] = a;
    for (var i = 2; i < wnd.length; i++) {
      wnd[i] = this.mul(wnd[i - 1], a);
    }

    var res = wnd[0];
    var current = 0;
    var currentLen = 0;
    var start = num.bitLength() % 26;
    if (start === 0) {
      start = 26;
    }

    for (i = num.length - 1; i >= 0; i--) {
      var word = num.words[i];
      for (var j = start - 1; j >= 0; j--) {
        var bit = (word >> j) & 1;
        if (res !== wnd[0]) {
          res = this.sqr(res);
        }

        if (bit === 0 && current === 0) {
          currentLen = 0;
          continue;
        }

        current <<= 1;
        current |= bit;
        currentLen++;
        if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

        res = this.mul(res, wnd[current]);
        currentLen = 0;
        current = 0;
      }
      start = 26;
    }

    return res;
  };

  Red.prototype.convertTo = function convertTo (num) {
    var r = num.umod(this.m);

    return r === num ? r.clone() : r;
  };

  Red.prototype.convertFrom = function convertFrom (num) {
    var res = num.clone();
    res.red = null;
    return res;
  };

  //
  // Montgomery method engine
  //

  BN.mont = function mont (num) {
    return new Mont(num);
  };

  function Mont (m) {
    Red.call(this, m);

    this.shift = this.m.bitLength();
    if (this.shift % 26 !== 0) {
      this.shift += 26 - (this.shift % 26);
    }

    this.r = new BN(1).iushln(this.shift);
    this.r2 = this.imod(this.r.sqr());
    this.rinv = this.r._invmp(this.m);

    this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
    this.minv = this.minv.umod(this.r);
    this.minv = this.r.sub(this.minv);
  }
  inherits(Mont, Red);

  Mont.prototype.convertTo = function convertTo (num) {
    return this.imod(num.ushln(this.shift));
  };

  Mont.prototype.convertFrom = function convertFrom (num) {
    var r = this.imod(num.mul(this.rinv));
    r.red = null;
    return r;
  };

  Mont.prototype.imul = function imul (a, b) {
    if (a.isZero() || b.isZero()) {
      a.words[0] = 0;
      a.length = 1;
      return a;
    }

    var t = a.imul(b);
    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
    var u = t.isub(c).iushrn(this.shift);
    var res = u;

    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m);
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Mont.prototype.mul = function mul (a, b) {
    if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

    var t = a.mul(b);
    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
    var u = t.isub(c).iushrn(this.shift);
    var res = u;
    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m);
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Mont.prototype.invm = function invm (a) {
    // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
    var res = this.imod(a._invmp(this.m).mul(this.r2));
    return res._forceRed(this);
  };
})(typeof module === 'undefined' || module, this);

},{"buffer":"../node_modules/parcel-bundler/src/builtins/_empty.js"}],"../node_modules/walletlink/dist/types.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RegExpString = exports.IntNumber = exports.BigIntString = exports.AddressString = exports.HexString = exports.OpaqueType = void 0;

function OpaqueType() {
  return value => value;
}

exports.OpaqueType = OpaqueType;
exports.HexString = OpaqueType();
exports.AddressString = OpaqueType();
exports.BigIntString = OpaqueType();

function IntNumber(num) {
  return Math.floor(num);
}

exports.IntNumber = IntNumber;
exports.RegExpString = OpaqueType();
},{}],"../node_modules/walletlink/dist/util.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFavicon = exports.range = exports.isBigNumber = exports.ensureParsedJSONObject = exports.ensureBN = exports.ensureRegExpString = exports.ensureIntNumber = exports.ensureBuffer = exports.ensureAddressString = exports.ensureEvenLengthHexString = exports.ensureHexString = exports.isHexString = exports.prepend0x = exports.strip0x = exports.has0xPrefix = exports.hexStringFromIntNumber = exports.intNumberFromHexString = exports.bigIntStringFromBN = exports.hexStringFromBuffer = exports.hexStringToUint8Array = exports.uint8ArrayToHex = exports.randomBytesHex = void 0;

const bn_js_1 = __importDefault(require("bn.js"));

const types_1 = require("./types");

const INT_STRING_REGEX = /^[0-9]*$/;
const HEXADECIMAL_STRING_REGEX = /^[a-f0-9]*$/;
/**
 * @param length number of bytes
 */

function randomBytesHex(length) {
  return uint8ArrayToHex(crypto.getRandomValues(new Uint8Array(length)));
}

exports.randomBytesHex = randomBytesHex;

function uint8ArrayToHex(value) {
  return [...value].map(b => b.toString(16).padStart(2, '0')).join('');
}

exports.uint8ArrayToHex = uint8ArrayToHex;

function hexStringToUint8Array(hexString) {
  return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

exports.hexStringToUint8Array = hexStringToUint8Array;

function hexStringFromBuffer(buf, includePrefix = false) {
  const hex = buf.toString("hex");
  return types_1.HexString(includePrefix ? "0x" + hex : hex);
}

exports.hexStringFromBuffer = hexStringFromBuffer;

function bigIntStringFromBN(bn) {
  return types_1.BigIntString(bn.toString(10));
}

exports.bigIntStringFromBN = bigIntStringFromBN;

function intNumberFromHexString(hex) {
  return types_1.IntNumber(new bn_js_1.default(ensureEvenLengthHexString(hex, false), 16).toNumber());
}

exports.intNumberFromHexString = intNumberFromHexString;

function hexStringFromIntNumber(num) {
  return types_1.HexString("0x" + new bn_js_1.default(num).toString(16));
}

exports.hexStringFromIntNumber = hexStringFromIntNumber;

function has0xPrefix(str) {
  return str.startsWith("0x") || str.startsWith("0X");
}

exports.has0xPrefix = has0xPrefix;

function strip0x(hex) {
  if (has0xPrefix(hex)) {
    return hex.slice(2);
  }

  return hex;
}

exports.strip0x = strip0x;

function prepend0x(hex) {
  if (has0xPrefix(hex)) {
    return "0x" + hex.slice(2);
  }

  return "0x" + hex;
}

exports.prepend0x = prepend0x;

function isHexString(hex) {
  if (typeof hex !== "string") {
    return false;
  }

  const s = strip0x(hex).toLowerCase();
  return HEXADECIMAL_STRING_REGEX.test(s);
}

exports.isHexString = isHexString;

function ensureHexString(hex, includePrefix = false) {
  if (typeof hex === "string") {
    const s = strip0x(hex).toLowerCase();

    if (HEXADECIMAL_STRING_REGEX.test(s)) {
      return types_1.HexString(includePrefix ? "0x" + s : s);
    }
  }

  throw new Error(`"${hex}" is not a hexadecimal string`);
}

exports.ensureHexString = ensureHexString;

function ensureEvenLengthHexString(hex, includePrefix = false) {
  let h = ensureHexString(hex, false);

  if (h.length % 2 === 1) {
    h = types_1.HexString("0" + h);
  }

  return includePrefix ? types_1.HexString("0x" + h) : h;
}

exports.ensureEvenLengthHexString = ensureEvenLengthHexString;

function ensureAddressString(str) {
  if (typeof str === "string") {
    const s = strip0x(str).toLowerCase();

    if (isHexString(s) && s.length === 40) {
      return types_1.AddressString(prepend0x(s));
    }
  }

  throw new Error(`Invalid Ethereum address: ${str}`);
}

exports.ensureAddressString = ensureAddressString;

function ensureBuffer(str) {
  if (Buffer.isBuffer(str)) {
    return str;
  }

  if (typeof str === "string") {
    if (isHexString(str)) {
      const s = ensureEvenLengthHexString(str, false);
      return Buffer.from(s, "hex");
    } else {
      return Buffer.from(str, "utf8");
    }
  }

  throw new Error(`Not binary data: ${str}`);
}

exports.ensureBuffer = ensureBuffer;

function ensureIntNumber(num) {
  if (typeof num === "number" && Number.isInteger(num)) {
    return types_1.IntNumber(num);
  }

  if (typeof num === "string") {
    if (INT_STRING_REGEX.test(num)) {
      return types_1.IntNumber(Number(num));
    }

    if (isHexString(num)) {
      return types_1.IntNumber(new bn_js_1.default(ensureEvenLengthHexString(num, false), 16).toNumber());
    }
  }

  throw new Error(`Not an integer: ${num}`);
}

exports.ensureIntNumber = ensureIntNumber;

function ensureRegExpString(regExp) {
  if (regExp instanceof RegExp) {
    return types_1.RegExpString(regExp.toString());
  }

  throw new Error(`Not a RegExp: ${regExp}`);
}

exports.ensureRegExpString = ensureRegExpString;

function ensureBN(val) {
  if (val != null && (bn_js_1.default.isBN(val) || isBigNumber(val))) {
    return new bn_js_1.default(val.toString(10), 10);
  }

  if (typeof val === "number") {
    return new bn_js_1.default(ensureIntNumber(val));
  }

  if (typeof val === "string") {
    if (INT_STRING_REGEX.test(val)) {
      return new bn_js_1.default(val, 10);
    }

    if (isHexString(val)) {
      return new bn_js_1.default(ensureEvenLengthHexString(val, false), 16);
    }
  }

  throw new Error(`Not an integer: ${val}`);
}

exports.ensureBN = ensureBN;

function ensureParsedJSONObject(val) {
  if (typeof val === "string") {
    return JSON.parse(val);
  }

  if (typeof val === "object") {
    return val;
  }

  throw new Error(`Not a JSON string or an object: ${val}`);
}

exports.ensureParsedJSONObject = ensureParsedJSONObject;

function isBigNumber(val) {
  if (val == null || typeof val.constructor !== "function") {
    return false;
  }

  const {
    constructor
  } = val;
  return typeof constructor.config === "function" && typeof constructor.EUCLID === "number";
}

exports.isBigNumber = isBigNumber;

function range(start, stop) {
  return Array.from({
    length: stop - start
  }, (_, i) => start + i);
}

exports.range = range;

function getFavicon() {
  const el = document.querySelector('link[sizes="192x192"]') || document.querySelector('link[sizes="180x180"]') || document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
  const {
    protocol,
    host
  } = document.location;
  const href = el ? el.getAttribute("href") : null;

  if (!href || href.startsWith("javascript:")) {
    return null;
  }

  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("data:")) {
    return href;
  }

  if (href.startsWith("//")) {
    return protocol + href;
  }

  return `${protocol}//${host}${href}`;
}

exports.getFavicon = getFavicon;
},{"bn.js":"../node_modules/walletlink/node_modules/bn.js/lib/bn.js","./types":"../node_modules/walletlink/dist/types.js","buffer":"../node_modules/node-libs-browser/node_modules/buffer/index.js"}],"../node_modules/walletlink/dist/vendor-js/eth-eip712-util/util.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
// Extracted from https://github.com/ethereumjs/ethereumjs-util and stripped out irrelevant code
// Original code licensed under the Mozilla Public License Version 2.0
const createKeccakHash = require('keccak/js');

const BN = require('bn.js');
/**
 * Returns a buffer filled with 0s
 * @method zeros
 * @param {Number} bytes  the number of bytes the buffer should be
 * @return {Buffer}
 */


function zeros(bytes) {
  return Buffer.allocUnsafe(bytes).fill(0);
}
/**
 * Left Pads an `Array` or `Buffer` with leading zeros till it has `length` bytes.
 * Or it truncates the beginning if it exceeds.
 * @method setLength
 * @param {Buffer|Array} msg the value to pad
 * @param {Number} length the number of bytes the output should be
 * @param {Boolean} [right=false] whether to start padding form the left or right
 * @return {Buffer|Array}
 */


function setLength(msg, length, right) {
  const buf = zeros(length);
  msg = toBuffer(msg);

  if (right) {
    if (msg.length < length) {
      msg.copy(buf);
      return buf;
    }

    return msg.slice(0, length);
  } else {
    if (msg.length < length) {
      msg.copy(buf, length - msg.length);
      return buf;
    }

    return msg.slice(-length);
  }
}
/**
 * Right Pads an `Array` or `Buffer` with leading zeros till it has `length` bytes.
 * Or it truncates the beginning if it exceeds.
 * @param {Buffer|Array} msg the value to pad
 * @param {Number} length the number of bytes the output should be
 * @return {Buffer|Array}
 */


function setLengthRight(msg, length) {
  return setLength(msg, length, true);
}
/**
 * Attempts to turn a value into a `Buffer`. As input it supports `Buffer`, `String`, `Number`, null/undefined, `BN` and other objects with a `toArray()` method.
 * @param {*} v the value
 */


function toBuffer(v) {
  if (!Buffer.isBuffer(v)) {
    if (Array.isArray(v)) {
      v = Buffer.from(v);
    } else if (typeof v === 'string') {
      if (isHexString(v)) {
        v = Buffer.from(padToEven(stripHexPrefix(v)), 'hex');
      } else {
        v = Buffer.from(v);
      }
    } else if (typeof v === 'number') {
      v = intToBuffer(v);
    } else if (v === null || v === undefined) {
      v = Buffer.allocUnsafe(0);
    } else if (BN.isBN(v)) {
      v = v.toArrayLike(Buffer);
    } else if (v.toArray) {
      // converts a BN to a Buffer
      v = Buffer.from(v.toArray());
    } else {
      throw new Error('invalid type');
    }
  }

  return v;
}
/**
 * Converts a `Buffer` into a hex `String`
 * @param {Buffer} buf
 * @return {String}
 */


function bufferToHex(buf) {
  buf = toBuffer(buf);
  return '0x' + buf.toString('hex');
}
/**
 * Creates Keccak hash of the input
 * @param {Buffer|Array|String|Number} a the input data
 * @param {Number} [bits=256] the Keccak width
 * @return {Buffer}
 */


function keccak(a, bits) {
  a = toBuffer(a);
  if (!bits) bits = 256;
  return createKeccakHash('keccak' + bits).update(a).digest();
}

function padToEven(str) {
  return str.length % 2 ? '0' + str : str;
}

function isHexString(str) {
  return typeof str === 'string' && str.match(/^0x[0-9A-Fa-f]*$/);
}

function stripHexPrefix(str) {
  if (typeof str === 'string' && str.startsWith('0x')) {
    return str.slice(2);
  }

  return str;
}

module.exports = {
  zeros,
  setLength,
  setLengthRight,
  isHexString,
  stripHexPrefix,
  toBuffer,
  bufferToHex,
  keccak
};
},{"keccak/js":"../node_modules/keccak/js.js","bn.js":"../node_modules/walletlink/node_modules/bn.js/lib/bn.js","buffer":"../node_modules/node-libs-browser/node_modules/buffer/index.js"}],"../node_modules/walletlink/dist/vendor-js/eth-eip712-util/abi.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
// Extracted from https://github.com/ethereumjs/ethereumjs-abi and stripped out irrelevant code
// Original code licensed under the MIT License - Copyright (c) 2015 Alex Beregszaszi
const util = require('./util');

const BN = require('bn.js'); // Convert from short to canonical names
// FIXME: optimise or make this nicer?


function elementaryName(name) {
  if (name.startsWith('int[')) {
    return 'int256' + name.slice(3);
  } else if (name === 'int') {
    return 'int256';
  } else if (name.startsWith('uint[')) {
    return 'uint256' + name.slice(4);
  } else if (name === 'uint') {
    return 'uint256';
  } else if (name.startsWith('fixed[')) {
    return 'fixed128x128' + name.slice(5);
  } else if (name === 'fixed') {
    return 'fixed128x128';
  } else if (name.startsWith('ufixed[')) {
    return 'ufixed128x128' + name.slice(6);
  } else if (name === 'ufixed') {
    return 'ufixed128x128';
  }

  return name;
} // Parse N from type<N>


function parseTypeN(type) {
  return parseInt(/^\D+(\d+)$/.exec(type)[1], 10);
} // Parse N,M from type<N>x<M>


function parseTypeNxM(type) {
  var tmp = /^\D+(\d+)x(\d+)$/.exec(type);
  return [parseInt(tmp[1], 10), parseInt(tmp[2], 10)];
} // Parse N in type[<N>] where "type" can itself be an array type.


function parseTypeArray(type) {
  var tmp = type.match(/(.*)\[(.*?)\]$/);

  if (tmp) {
    return tmp[2] === '' ? 'dynamic' : parseInt(tmp[2], 10);
  }

  return null;
}

function parseNumber(arg) {
  var type = typeof arg;

  if (type === 'string') {
    if (util.isHexString(arg)) {
      return new BN(util.stripHexPrefix(arg), 16);
    } else {
      return new BN(arg, 10);
    }
  } else if (type === 'number') {
    return new BN(arg);
  } else if (arg.toArray) {
    // assume this is a BN for the moment, replace with BN.isBN soon
    return arg;
  } else {
    throw new Error('Argument is not a number');
  }
} // Encodes a single item (can be dynamic array)
// @returns: Buffer


function encodeSingle(type, arg) {
  var size, num, ret, i;

  if (type === 'address') {
    return encodeSingle('uint160', parseNumber(arg));
  } else if (type === 'bool') {
    return encodeSingle('uint8', arg ? 1 : 0);
  } else if (type === 'string') {
    return encodeSingle('bytes', new Buffer(arg, 'utf8'));
  } else if (isArray(type)) {
    // this part handles fixed-length ([2]) and variable length ([]) arrays
    // NOTE: we catch here all calls to arrays, that simplifies the rest
    if (typeof arg.length === 'undefined') {
      throw new Error('Not an array?');
    }

    size = parseTypeArray(type);

    if (size !== 'dynamic' && size !== 0 && arg.length > size) {
      throw new Error('Elements exceed array size: ' + size);
    }

    ret = [];
    type = type.slice(0, type.lastIndexOf('['));

    if (typeof arg === 'string') {
      arg = JSON.parse(arg);
    }

    for (i in arg) {
      ret.push(encodeSingle(type, arg[i]));
    }

    if (size === 'dynamic') {
      var length = encodeSingle('uint256', arg.length);
      ret.unshift(length);
    }

    return Buffer.concat(ret);
  } else if (type === 'bytes') {
    arg = new Buffer(arg);
    ret = Buffer.concat([encodeSingle('uint256', arg.length), arg]);

    if (arg.length % 32 !== 0) {
      ret = Buffer.concat([ret, util.zeros(32 - arg.length % 32)]);
    }

    return ret;
  } else if (type.startsWith('bytes')) {
    size = parseTypeN(type);

    if (size < 1 || size > 32) {
      throw new Error('Invalid bytes<N> width: ' + size);
    }

    return util.setLengthRight(arg, 32);
  } else if (type.startsWith('uint')) {
    size = parseTypeN(type);

    if (size % 8 || size < 8 || size > 256) {
      throw new Error('Invalid uint<N> width: ' + size);
    }

    num = parseNumber(arg);

    if (num.bitLength() > size) {
      throw new Error('Supplied uint exceeds width: ' + size + ' vs ' + num.bitLength());
    }

    if (num < 0) {
      throw new Error('Supplied uint is negative');
    }

    return num.toArrayLike(Buffer, 'be', 32);
  } else if (type.startsWith('int')) {
    size = parseTypeN(type);

    if (size % 8 || size < 8 || size > 256) {
      throw new Error('Invalid int<N> width: ' + size);
    }

    num = parseNumber(arg);

    if (num.bitLength() > size) {
      throw new Error('Supplied int exceeds width: ' + size + ' vs ' + num.bitLength());
    }

    return num.toTwos(256).toArrayLike(Buffer, 'be', 32);
  } else if (type.startsWith('ufixed')) {
    size = parseTypeNxM(type);
    num = parseNumber(arg);

    if (num < 0) {
      throw new Error('Supplied ufixed is negative');
    }

    return encodeSingle('uint256', num.mul(new BN(2).pow(new BN(size[1]))));
  } else if (type.startsWith('fixed')) {
    size = parseTypeNxM(type);
    return encodeSingle('int256', parseNumber(arg).mul(new BN(2).pow(new BN(size[1]))));
  }

  throw new Error('Unsupported or invalid type: ' + type);
} // Is a type dynamic?


function isDynamic(type) {
  // FIXME: handle all types? I don't think anything is missing now
  return type === 'string' || type === 'bytes' || parseTypeArray(type) === 'dynamic';
} // Is a type an array?


function isArray(type) {
  return type.lastIndexOf(']') === type.length - 1;
} // Encode a method/event with arguments
// @types an array of string type names
// @args  an array of the appropriate values


function rawEncode(types, values) {
  var output = [];
  var data = [];
  var headLength = 32 * types.length;

  for (var i in types) {
    var type = elementaryName(types[i]);
    var value = values[i];
    var cur = encodeSingle(type, value); // Use the head/tail method for storing dynamic data

    if (isDynamic(type)) {
      output.push(encodeSingle('uint256', headLength));
      data.push(cur);
      headLength += cur.length;
    } else {
      output.push(cur);
    }
  }

  return Buffer.concat(output.concat(data));
}

function solidityPack(types, values) {
  if (types.length !== values.length) {
    throw new Error('Number of types are not matching the values');
  }

  var size, num;
  var ret = [];

  for (var i = 0; i < types.length; i++) {
    var type = elementaryName(types[i]);
    var value = values[i];

    if (type === 'bytes') {
      ret.push(value);
    } else if (type === 'string') {
      ret.push(new Buffer(value, 'utf8'));
    } else if (type === 'bool') {
      ret.push(new Buffer(value ? '01' : '00', 'hex'));
    } else if (type === 'address') {
      ret.push(util.setLength(value, 20));
    } else if (type.startsWith('bytes')) {
      size = parseTypeN(type);

      if (size < 1 || size > 32) {
        throw new Error('Invalid bytes<N> width: ' + size);
      }

      ret.push(util.setLengthRight(value, size));
    } else if (type.startsWith('uint')) {
      size = parseTypeN(type);

      if (size % 8 || size < 8 || size > 256) {
        throw new Error('Invalid uint<N> width: ' + size);
      }

      num = parseNumber(value);

      if (num.bitLength() > size) {
        throw new Error('Supplied uint exceeds width: ' + size + ' vs ' + num.bitLength());
      }

      ret.push(num.toArrayLike(Buffer, 'be', size / 8));
    } else if (type.startsWith('int')) {
      size = parseTypeN(type);

      if (size % 8 || size < 8 || size > 256) {
        throw new Error('Invalid int<N> width: ' + size);
      }

      num = parseNumber(value);

      if (num.bitLength() > size) {
        throw new Error('Supplied int exceeds width: ' + size + ' vs ' + num.bitLength());
      }

      ret.push(num.toTwos(size).toArrayLike(Buffer, 'be', size / 8));
    } else {
      // FIXME: support all other types
      throw new Error('Unsupported or invalid type: ' + type);
    }
  }

  return Buffer.concat(ret);
}

function soliditySHA3(types, values) {
  return util.keccak(solidityPack(types, values));
}

module.exports = {
  rawEncode,
  solidityPack,
  soliditySHA3
};
},{"./util":"../node_modules/walletlink/dist/vendor-js/eth-eip712-util/util.js","bn.js":"../node_modules/walletlink/node_modules/bn.js/lib/bn.js","buffer":"../node_modules/node-libs-browser/node_modules/buffer/index.js"}],"../node_modules/walletlink/dist/vendor-js/eth-eip712-util/index.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
const util = require('./util');

const abi = require('./abi');

const TYPED_MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    types: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            type: {
              type: 'string'
            }
          },
          required: ['name', 'type']
        }
      }
    },
    primaryType: {
      type: 'string'
    },
    domain: {
      type: 'object'
    },
    message: {
      type: 'object'
    }
  },
  required: ['types', 'primaryType', 'domain', 'message']
};
/**
 * A collection of utility functions used for signing typed data
 */

const TypedDataUtils = {
  /**
   * Encodes an object by encoding and concatenating each of its members
   *
   * @param {string} primaryType - Root type
   * @param {Object} data - Object to encode
   * @param {Object} types - Type definitions
   * @returns {string} - Encoded representation of an object
   */
  encodeData(primaryType, data, types, useV4 = true) {
    const encodedTypes = ['bytes32'];
    const encodedValues = [this.hashType(primaryType, types)];

    if (useV4) {
      const encodeField = (name, type, value) => {
        if (types[type] !== undefined) {
          return ['bytes32', value == null ? '0x0000000000000000000000000000000000000000000000000000000000000000' : util.keccak(this.encodeData(type, value, types, useV4))];
        }

        if (value === undefined) throw new Error(`missing value for field ${name} of type ${type}`);

        if (type === 'bytes') {
          return ['bytes32', util.keccak(value)];
        }

        if (type === 'string') {
          // convert string to buffer - prevents ethUtil from interpreting strings like '0xabcd' as hex
          if (typeof value === 'string') {
            value = Buffer.from(value, 'utf8');
          }

          return ['bytes32', util.keccak(value)];
        }

        if (type.lastIndexOf(']') === type.length - 1) {
          const parsedType = type.slice(0, type.lastIndexOf('['));
          const typeValuePairs = value.map(item => encodeField(name, parsedType, item));
          return ['bytes32', util.keccak(abi.rawEncode(typeValuePairs.map(([type]) => type), typeValuePairs.map(([, value]) => value)))];
        }

        return [type, value];
      };

      for (const field of types[primaryType]) {
        const [type, value] = encodeField(field.name, field.type, data[field.name]);
        encodedTypes.push(type);
        encodedValues.push(value);
      }
    } else {
      for (const field of types[primaryType]) {
        let value = data[field.name];

        if (value !== undefined) {
          if (field.type === 'bytes') {
            encodedTypes.push('bytes32');
            value = util.keccak(value);
            encodedValues.push(value);
          } else if (field.type === 'string') {
            encodedTypes.push('bytes32'); // convert string to buffer - prevents ethUtil from interpreting strings like '0xabcd' as hex

            if (typeof value === 'string') {
              value = Buffer.from(value, 'utf8');
            }

            value = util.keccak(value);
            encodedValues.push(value);
          } else if (types[field.type] !== undefined) {
            encodedTypes.push('bytes32');
            value = util.keccak(this.encodeData(field.type, value, types, useV4));
            encodedValues.push(value);
          } else if (field.type.lastIndexOf(']') === field.type.length - 1) {
            throw new Error('Arrays currently unimplemented in encodeData');
          } else {
            encodedTypes.push(field.type);
            encodedValues.push(value);
          }
        }
      }
    }

    return abi.rawEncode(encodedTypes, encodedValues);
  },

  /**
   * Encodes the type of an object by encoding a comma delimited list of its members
   *
   * @param {string} primaryType - Root type to encode
   * @param {Object} types - Type definitions
   * @returns {string} - Encoded representation of the type of an object
   */
  encodeType(primaryType, types) {
    let result = '';
    let deps = this.findTypeDependencies(primaryType, types).filter(dep => dep !== primaryType);
    deps = [primaryType].concat(deps.sort());

    for (const type of deps) {
      const children = types[type];

      if (!children) {
        throw new Error('No type definition specified: ' + type);
      }

      result += type + '(' + types[type].map(({
        name,
        type
      }) => type + ' ' + name).join(',') + ')';
    }

    return result;
  },

  /**
   * Finds all types within a type defintion object
   *
   * @param {string} primaryType - Root type
   * @param {Object} types - Type definitions
   * @param {Array} results - current set of accumulated types
   * @returns {Array} - Set of all types found in the type definition
   */
  findTypeDependencies(primaryType, types, results = []) {
    primaryType = primaryType.match(/^\w*/)[0];

    if (results.includes(primaryType) || types[primaryType] === undefined) {
      return results;
    }

    results.push(primaryType);

    for (const field of types[primaryType]) {
      for (const dep of this.findTypeDependencies(field.type, types, results)) {
        !results.includes(dep) && results.push(dep);
      }
    }

    return results;
  },

  /**
   * Hashes an object
   *
   * @param {string} primaryType - Root type
   * @param {Object} data - Object to hash
   * @param {Object} types - Type definitions
   * @returns {string} - Hash of an object
   */
  hashStruct(primaryType, data, types, useV4 = true) {
    return util.keccak(this.encodeData(primaryType, data, types, useV4));
  },

  /**
   * Hashes the type of an object
   *
   * @param {string} primaryType - Root type to hash
   * @param {Object} types - Type definitions
   * @returns {string} - Hash of an object
   */
  hashType(primaryType, types) {
    return util.keccak(this.encodeType(primaryType, types));
  },

  /**
   * Removes properties from a message object that are not defined per EIP-712
   *
   * @param {Object} data - typed message object
   * @returns {Object} - typed message object with only allowed fields
   */
  sanitizeData(data) {
    const sanitizedData = {};

    for (const key in TYPED_MESSAGE_SCHEMA.properties) {
      data[key] && (sanitizedData[key] = data[key]);
    }

    if (sanitizedData.types) {
      sanitizedData.types = Object.assign({
        EIP712Domain: []
      }, sanitizedData.types);
    }

    return sanitizedData;
  },

  /**
   * Returns the hash of a typed message as per EIP-712 for signing
   *
   * @param {Object} typedData - Types message data to sign
   * @returns {string} - sha3 hash for signing
   */
  hash(typedData, useV4 = true) {
    const sanitizedData = this.sanitizeData(typedData);
    const parts = [Buffer.from('1901', 'hex')];
    parts.push(this.hashStruct('EIP712Domain', sanitizedData.domain, sanitizedData.types, useV4));

    if (sanitizedData.primaryType !== 'EIP712Domain') {
      parts.push(this.hashStruct(sanitizedData.primaryType, sanitizedData.message, sanitizedData.types, useV4));
    }

    return util.keccak(Buffer.concat(parts));
  }

};
module.exports = {
  TYPED_MESSAGE_SCHEMA,
  TypedDataUtils,
  hashForSignTypedDataLegacy: function (msgParams) {
    return typedSignatureHashLegacy(msgParams.data);
  },
  hashForSignTypedData_v3: function (msgParams) {
    return TypedDataUtils.hash(msgParams.data, false);
  },
  hashForSignTypedData_v4: function (msgParams) {
    return TypedDataUtils.hash(msgParams.data);
  }
};
/**
 * @param typedData - Array of data along with types, as per EIP712.
 * @returns Buffer
 */

function typedSignatureHashLegacy(typedData) {
  const error = new Error('Expect argument to be non-empty array');
  if (typeof typedData !== 'object' || !typedData.length) throw error;
  const data = typedData.map(function (e) {
    return e.type === 'bytes' ? util.toBuffer(e.value) : e.value;
  });
  const types = typedData.map(function (e) {
    return e.type;
  });
  const schema = typedData.map(function (e) {
    if (!e.name) throw error;
    return e.type + ' ' + e.name;
  });
  return abi.soliditySHA3(['bytes32', 'bytes32'], [abi.soliditySHA3(new Array(typedData.length).fill('string'), schema), abi.soliditySHA3(types, data)]);
}
},{"./util":"../node_modules/walletlink/dist/vendor-js/eth-eip712-util/util.js","./abi":"../node_modules/walletlink/dist/vendor-js/eth-eip712-util/abi.js","buffer":"../node_modules/node-libs-browser/node_modules/buffer/index.js"}],"../node_modules/walletlink/dist/provider/FilterPolyfill.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterFromParam = exports.FilterPolyfill = void 0;

const types_1 = require("../types");

const util_1 = require("../util");

const TIMEOUT = 5 * 60 * 1000; // 5 minutes

const JSONRPC_TEMPLATE = {
  jsonrpc: "2.0",
  id: 0
};

class FilterPolyfill {
  constructor(provider) {
    this.logFilters = new Map(); // <id, filter>

    this.blockFilters = new Set(); // <id>

    this.pendingTransactionFilters = new Set(); // <id, true>

    this.cursors = new Map(); // <id, cursor>

    this.timeouts = new Map(); // <id, setTimeout id>

    this.nextFilterId = types_1.IntNumber(1);
    this.provider = provider;
  }

  async newFilter(param) {
    const filter = filterFromParam(param);
    const id = this.makeFilterId();
    const cursor = await this.setInitialCursorPosition(id, filter.fromBlock);
    console.log(`Installing new log filter(${id}):`, filter, "initial cursor position:", cursor);
    this.logFilters.set(id, filter);
    this.setFilterTimeout(id);
    return util_1.hexStringFromIntNumber(id);
  }

  async newBlockFilter() {
    const id = this.makeFilterId();
    const cursor = await this.setInitialCursorPosition(id, "latest");
    console.log(`Installing new block filter (${id}) with initial cursor position:`, cursor);
    this.blockFilters.add(id);
    this.setFilterTimeout(id);
    return util_1.hexStringFromIntNumber(id);
  }

  async newPendingTransactionFilter() {
    const id = this.makeFilterId();
    const cursor = await this.setInitialCursorPosition(id, "latest");
    console.log(`Installing new block filter (${id}) with initial cursor position:`, cursor);
    this.pendingTransactionFilters.add(id);
    this.setFilterTimeout(id);
    return util_1.hexStringFromIntNumber(id);
  }

  uninstallFilter(filterId) {
    const id = util_1.intNumberFromHexString(filterId);
    console.log(`Uninstalling filter (${id})`);
    this.deleteFilter(id);
    return true;
  }

  getFilterChanges(filterId) {
    const id = util_1.intNumberFromHexString(filterId);

    if (this.timeouts.has(id)) {
      // extend timeout
      this.setFilterTimeout(id);
    }

    if (this.logFilters.has(id)) {
      return this.getLogFilterChanges(id);
    } else if (this.blockFilters.has(id)) {
      return this.getBlockFilterChanges(id);
    } else if (this.pendingTransactionFilters.has(id)) {
      return this.getPendingTransactionFilterChanges(id);
    }

    return Promise.resolve(filterNotFoundError());
  }

  async getFilterLogs(filterId) {
    const id = util_1.intNumberFromHexString(filterId);
    const filter = this.logFilters.get(id);

    if (!filter) {
      return filterNotFoundError();
    }

    return this.sendAsyncPromise(Object.assign(Object.assign({}, JSONRPC_TEMPLATE), {
      method: "eth_getLogs",
      params: [paramFromFilter(filter)]
    }));
  }

  makeFilterId() {
    return types_1.IntNumber(++this.nextFilterId);
  }

  sendAsyncPromise(request) {
    return new Promise((resolve, reject) => {
      this.provider.sendAsync(request, (err, response) => {
        if (err) {
          return reject(err);
        }

        if (Array.isArray(response) || response == null) {
          return reject(new Error(`unexpected response received: ${JSON.stringify(response)}`));
        }

        resolve(response);
      });
    });
  }

  deleteFilter(id) {
    console.log(`Deleting filter (${id})`);
    this.logFilters.delete(id);
    this.blockFilters.delete(id);
    this.pendingTransactionFilters.delete(id);
    this.cursors.delete(id);
    this.timeouts.delete(id);
  }

  async getLogFilterChanges(id) {
    const filter = this.logFilters.get(id);
    const cursorPosition = this.cursors.get(id);

    if (!cursorPosition || !filter) {
      return filterNotFoundError();
    }

    const currentBlockHeight = await this.getCurrentBlockHeight();
    const toBlock = filter.toBlock === "latest" ? currentBlockHeight : filter.toBlock;

    if (cursorPosition > currentBlockHeight) {
      return emptyResult();
    }

    if (cursorPosition > filter.toBlock) {
      return emptyResult();
    }

    console.log(`Fetching logs from ${cursorPosition} to ${toBlock} for filter ${id}`);
    const response = await this.sendAsyncPromise(Object.assign(Object.assign({}, JSONRPC_TEMPLATE), {
      method: "eth_getLogs",
      params: [paramFromFilter(Object.assign(Object.assign({}, filter), {
        fromBlock: cursorPosition,
        toBlock
      }))]
    }));

    if (Array.isArray(response.result)) {
      const blocks = response.result.map(log => util_1.intNumberFromHexString(log.blockNumber || "0x0"));
      const highestBlock = Math.max(...blocks);

      if (highestBlock && highestBlock > cursorPosition) {
        const newCursorPosition = types_1.IntNumber(highestBlock + 1);
        console.log(`Moving cursor position for filter (${id}) from ${cursorPosition} to ${newCursorPosition}`);
        this.cursors.set(id, newCursorPosition);
      }
    }

    return response;
  }

  async getBlockFilterChanges(id) {
    const cursorPosition = this.cursors.get(id);

    if (!cursorPosition) {
      return filterNotFoundError();
    }

    const currentBlockHeight = await this.getCurrentBlockHeight();

    if (cursorPosition > currentBlockHeight) {
      return emptyResult();
    }

    console.log(`Fetching blocks from ${cursorPosition} to ${currentBlockHeight} for filter (${id})`);
    const blocks = (await Promise.all(util_1.range(cursorPosition, currentBlockHeight + 1).map(i => this.getBlockHashByNumber(types_1.IntNumber(i))))).filter(hash => !!hash);
    const newCursorPosition = types_1.IntNumber(cursorPosition + blocks.length);
    console.log(`Moving cursor position for filter (${id}) from ${cursorPosition} to ${newCursorPosition}`);
    this.cursors.set(id, newCursorPosition);
    return Object.assign(Object.assign({}, JSONRPC_TEMPLATE), {
      result: blocks
    });
  }

  async getPendingTransactionFilterChanges(_id) {
    // pending transaction filters are not supported
    return Promise.resolve(emptyResult());
  }

  async setInitialCursorPosition(id, startBlock) {
    const currentBlockHeight = await this.getCurrentBlockHeight();
    const initialCursorPosition = typeof startBlock === "number" && startBlock > currentBlockHeight ? startBlock : currentBlockHeight;
    this.cursors.set(id, initialCursorPosition);
    return initialCursorPosition;
  }

  setFilterTimeout(id) {
    const existing = this.timeouts.get(id);

    if (existing) {
      window.clearTimeout(existing);
    }

    const timeout = window.setTimeout(() => {
      console.log(`Filter (${id}) timed out`);
      this.deleteFilter(id);
    }, TIMEOUT);
    this.timeouts.set(id, timeout);
  }

  async getCurrentBlockHeight() {
    const {
      result
    } = await this.sendAsyncPromise(Object.assign(Object.assign({}, JSONRPC_TEMPLATE), {
      method: "eth_blockNumber",
      params: []
    }));
    return util_1.intNumberFromHexString(util_1.ensureHexString(result));
  }

  async getBlockHashByNumber(blockNumber) {
    const response = await this.sendAsyncPromise(Object.assign(Object.assign({}, JSONRPC_TEMPLATE), {
      method: "eth_getBlockByNumber",
      params: [util_1.hexStringFromIntNumber(blockNumber), false]
    }));

    if (response.result && typeof response.result.hash === "string") {
      return util_1.ensureHexString(response.result.hash);
    }

    return null;
  }

}

exports.FilterPolyfill = FilterPolyfill;

function filterFromParam(param) {
  return {
    fromBlock: intBlockHeightFromHexBlockHeight(param.fromBlock),
    toBlock: intBlockHeightFromHexBlockHeight(param.toBlock),
    addresses: param.address === undefined ? null : Array.isArray(param.address) ? param.address : [param.address],
    topics: param.topics || []
  };
}

exports.filterFromParam = filterFromParam;

function paramFromFilter(filter) {
  const param = {
    fromBlock: hexBlockHeightFromIntBlockHeight(filter.fromBlock),
    toBlock: hexBlockHeightFromIntBlockHeight(filter.toBlock),
    topics: filter.topics
  };

  if (filter.addresses !== null) {
    param.address = filter.addresses;
  }

  return param;
}

function intBlockHeightFromHexBlockHeight(value) {
  if (value === undefined || value === "latest" || value === "pending") {
    return "latest";
  } else if (value === "earliest") {
    return types_1.IntNumber(0);
  } else if (util_1.isHexString(value)) {
    return util_1.intNumberFromHexString(value);
  }

  throw new Error(`Invalid block option: ${value}`);
}

function hexBlockHeightFromIntBlockHeight(value) {
  if (value === "latest") {
    return value;
  }

  return util_1.hexStringFromIntNumber(value);
}

function filterNotFoundError() {
  return Object.assign(Object.assign({}, JSONRPC_TEMPLATE), {
    error: {
      code: -32000,
      message: "filter not found"
    }
  });
}

function emptyResult() {
  return Object.assign(Object.assign({}, JSONRPC_TEMPLATE), {
    result: []
  });
}
},{"../types":"../node_modules/walletlink/dist/types.js","../util":"../node_modules/walletlink/dist/util.js"}],"../node_modules/walletlink/dist/provider/JSONRPC.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSONRPCMethod = void 0;
var JSONRPCMethod;

(function (JSONRPCMethod) {
  // synchronous or asynchronous
  JSONRPCMethod["eth_accounts"] = "eth_accounts";
  JSONRPCMethod["eth_coinbase"] = "eth_coinbase";
  JSONRPCMethod["net_version"] = "net_version";
  JSONRPCMethod["eth_chainId"] = "eth_chainId";
  JSONRPCMethod["eth_uninstallFilter"] = "eth_uninstallFilter"; // asynchronous only

  JSONRPCMethod["eth_requestAccounts"] = "eth_requestAccounts";
  JSONRPCMethod["eth_sign"] = "eth_sign";
  JSONRPCMethod["eth_ecRecover"] = "eth_ecRecover";
  JSONRPCMethod["personal_sign"] = "personal_sign";
  JSONRPCMethod["personal_ecRecover"] = "personal_ecRecover";
  JSONRPCMethod["eth_signTransaction"] = "eth_signTransaction";
  JSONRPCMethod["eth_sendRawTransaction"] = "eth_sendRawTransaction";
  JSONRPCMethod["eth_sendTransaction"] = "eth_sendTransaction";
  JSONRPCMethod["eth_signTypedData_v1"] = "eth_signTypedData_v1";
  JSONRPCMethod["eth_signTypedData_v2"] = "eth_signTypedData_v2";
  JSONRPCMethod["eth_signTypedData_v3"] = "eth_signTypedData_v3";
  JSONRPCMethod["eth_signTypedData_v4"] = "eth_signTypedData_v4";
  JSONRPCMethod["eth_signTypedData"] = "eth_signTypedData";
  JSONRPCMethod["walletlink_arbitrary"] = "walletlink_arbitrary";
  JSONRPCMethod["wallet_addEthereumChain"] = "wallet_addEthereumChain";
  JSONRPCMethod["wallet_switchEthereumChain"] = "wallet_switchEthereumChain"; // asynchronous pub/sub

  JSONRPCMethod["eth_subscribe"] = "eth_subscribe";
  JSONRPCMethod["eth_unsubscribe"] = "eth_unsubscribe"; // asynchronous filter methods

  JSONRPCMethod["eth_newFilter"] = "eth_newFilter";
  JSONRPCMethod["eth_newBlockFilter"] = "eth_newBlockFilter";
  JSONRPCMethod["eth_newPendingTransactionFilter"] = "eth_newPendingTransactionFilter";
  JSONRPCMethod["eth_getFilterChanges"] = "eth_getFilterChanges";
  JSONRPCMethod["eth_getFilterLogs"] = "eth_getFilterLogs";
})(JSONRPCMethod = exports.JSONRPCMethod || (exports.JSONRPCMethod = {}));
},{}],"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/classes.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthereumProviderError = exports.EthereumRpcError = void 0;
const fast_safe_stringify_1 = require("fast-safe-stringify");
/**
 * Error subclass implementing JSON RPC 2.0 errors and Ethereum RPC errors
 * per EIP-1474.
 * Permits any integer error code.
 */
class EthereumRpcError extends Error {
    constructor(code, message, data) {
        if (!Number.isInteger(code)) {
            throw new Error('"code" must be an integer.');
        }
        if (!message || typeof message !== 'string') {
            throw new Error('"message" must be a nonempty string.');
        }
        super(message);
        this.code = code;
        if (data !== undefined) {
            this.data = data;
        }
    }
    /**
     * Returns a plain object with all public class properties.
     */
    serialize() {
        const serialized = {
            code: this.code,
            message: this.message,
        };
        if (this.data !== undefined) {
            serialized.data = this.data;
        }
        if (this.stack) {
            serialized.stack = this.stack;
        }
        return serialized;
    }
    /**
     * Return a string representation of the serialized error, omitting
     * any circular references.
     */
    toString() {
        return fast_safe_stringify_1.default(this.serialize(), stringifyReplacer, 2);
    }
}
exports.EthereumRpcError = EthereumRpcError;
/**
 * Error subclass implementing Ethereum Provider errors per EIP-1193.
 * Permits integer error codes in the [ 1000 <= 4999 ] range.
 */
class EthereumProviderError extends EthereumRpcError {
    /**
     * Create an Ethereum Provider JSON-RPC error.
     * `code` must be an integer in the 1000 <= 4999 range.
     */
    constructor(code, message, data) {
        if (!isValidEthProviderCode(code)) {
            throw new Error('"code" must be an integer such that: 1000 <= code <= 4999');
        }
        super(code, message, data);
    }
}
exports.EthereumProviderError = EthereumProviderError;
// Internal
function isValidEthProviderCode(code) {
    return Number.isInteger(code) && code >= 1000 && code <= 4999;
}
function stringifyReplacer(_, value) {
    if (value === '[Circular]') {
        return undefined;
    }
    return value;
}

},{"fast-safe-stringify":"../node_modules/fast-safe-stringify/index.js"}],"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/error-constants.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorValues = exports.errorCodes = void 0;
exports.errorCodes = {
    rpc: {
        invalidInput: -32000,
        resourceNotFound: -32001,
        resourceUnavailable: -32002,
        transactionRejected: -32003,
        methodNotSupported: -32004,
        limitExceeded: -32005,
        parse: -32700,
        invalidRequest: -32600,
        methodNotFound: -32601,
        invalidParams: -32602,
        internal: -32603,
    },
    provider: {
        userRejectedRequest: 4001,
        unauthorized: 4100,
        unsupportedMethod: 4200,
        disconnected: 4900,
        chainDisconnected: 4901,
    },
};
exports.errorValues = {
    '-32700': {
        standard: 'JSON RPC 2.0',
        message: 'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
    },
    '-32600': {
        standard: 'JSON RPC 2.0',
        message: 'The JSON sent is not a valid Request object.',
    },
    '-32601': {
        standard: 'JSON RPC 2.0',
        message: 'The method does not exist / is not available.',
    },
    '-32602': {
        standard: 'JSON RPC 2.0',
        message: 'Invalid method parameter(s).',
    },
    '-32603': {
        standard: 'JSON RPC 2.0',
        message: 'Internal JSON-RPC error.',
    },
    '-32000': {
        standard: 'EIP-1474',
        message: 'Invalid input.',
    },
    '-32001': {
        standard: 'EIP-1474',
        message: 'Resource not found.',
    },
    '-32002': {
        standard: 'EIP-1474',
        message: 'Resource unavailable.',
    },
    '-32003': {
        standard: 'EIP-1474',
        message: 'Transaction rejected.',
    },
    '-32004': {
        standard: 'EIP-1474',
        message: 'Method not supported.',
    },
    '-32005': {
        standard: 'EIP-1474',
        message: 'Request limit exceeded.',
    },
    '4001': {
        standard: 'EIP-1193',
        message: 'User rejected the request.',
    },
    '4100': {
        standard: 'EIP-1193',
        message: 'The requested account and/or method has not been authorized by the user.',
    },
    '4200': {
        standard: 'EIP-1193',
        message: 'The requested method is not supported by this Ethereum provider.',
    },
    '4900': {
        standard: 'EIP-1193',
        message: 'The provider is disconnected from all chains.',
    },
    '4901': {
        standard: 'EIP-1193',
        message: 'The provider is disconnected from the specified chain.',
    },
};

},{}],"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/utils.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeError = exports.isValidCode = exports.getMessageFromCode = exports.JSON_RPC_SERVER_ERROR_MESSAGE = void 0;
const error_constants_1 = require("./error-constants");
const classes_1 = require("./classes");
const FALLBACK_ERROR_CODE = error_constants_1.errorCodes.rpc.internal;
const FALLBACK_MESSAGE = 'Unspecified error message. This is a bug, please report it.';
const FALLBACK_ERROR = {
    code: FALLBACK_ERROR_CODE,
    message: getMessageFromCode(FALLBACK_ERROR_CODE),
};
exports.JSON_RPC_SERVER_ERROR_MESSAGE = 'Unspecified server error.';
/**
 * Gets the message for a given code, or a fallback message if the code has
 * no corresponding message.
 */
function getMessageFromCode(code, fallbackMessage = FALLBACK_MESSAGE) {
    if (Number.isInteger(code)) {
        const codeString = code.toString();
        if (hasKey(error_constants_1.errorValues, codeString)) {
            return error_constants_1.errorValues[codeString].message;
        }
        if (isJsonRpcServerError(code)) {
            return exports.JSON_RPC_SERVER_ERROR_MESSAGE;
        }
    }
    return fallbackMessage;
}
exports.getMessageFromCode = getMessageFromCode;
/**
 * Returns whether the given code is valid.
 * A code is only valid if it has a message.
 */
function isValidCode(code) {
    if (!Number.isInteger(code)) {
        return false;
    }
    const codeString = code.toString();
    if (error_constants_1.errorValues[codeString]) {
        return true;
    }
    if (isJsonRpcServerError(code)) {
        return true;
    }
    return false;
}
exports.isValidCode = isValidCode;
/**
 * Serializes the given error to an Ethereum JSON RPC-compatible error object.
 * Merely copies the given error's values if it is already compatible.
 * If the given error is not fully compatible, it will be preserved on the
 * returned object's data.originalError property.
 */
function serializeError(error, { fallbackError = FALLBACK_ERROR, shouldIncludeStack = false, } = {}) {
    var _a, _b;
    if (!fallbackError ||
        !Number.isInteger(fallbackError.code) ||
        typeof fallbackError.message !== 'string') {
        throw new Error('Must provide fallback error with integer number code and string message.');
    }
    if (error instanceof classes_1.EthereumRpcError) {
        return error.serialize();
    }
    const serialized = {};
    if (error &&
        typeof error === 'object' &&
        !Array.isArray(error) &&
        hasKey(error, 'code') &&
        isValidCode(error.code)) {
        const _error = error;
        serialized.code = _error.code;
        if (_error.message && typeof _error.message === 'string') {
            serialized.message = _error.message;
            if (hasKey(_error, 'data')) {
                serialized.data = _error.data;
            }
        }
        else {
            serialized.message = getMessageFromCode(serialized.code);
            serialized.data = { originalError: assignOriginalError(error) };
        }
    }
    else {
        serialized.code = fallbackError.code;
        const message = (_a = error) === null || _a === void 0 ? void 0 : _a.message;
        serialized.message = (message && typeof message === 'string'
            ? message
            : fallbackError.message);
        serialized.data = { originalError: assignOriginalError(error) };
    }
    const stack = (_b = error) === null || _b === void 0 ? void 0 : _b.stack;
    if (shouldIncludeStack && error && stack && typeof stack === 'string') {
        serialized.stack = stack;
    }
    return serialized;
}
exports.serializeError = serializeError;
// Internal
function isJsonRpcServerError(code) {
    return code >= -32099 && code <= -32000;
}
function assignOriginalError(error) {
    if (error && typeof error === 'object' && !Array.isArray(error)) {
        return Object.assign({}, error);
    }
    return error;
}
function hasKey(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

},{"./error-constants":"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/error-constants.js","./classes":"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/classes.js"}],"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/errors.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ethErrors = void 0;
const classes_1 = require("./classes");
const utils_1 = require("./utils");
const error_constants_1 = require("./error-constants");
exports.ethErrors = {
    rpc: {
        /**
         * Get a JSON RPC 2.0 Parse (-32700) error.
         */
        parse: (arg) => getEthJsonRpcError(error_constants_1.errorCodes.rpc.parse, arg),
        /**
         * Get a JSON RPC 2.0 Invalid Request (-32600) error.
         */
        invalidRequest: (arg) => getEthJsonRpcError(error_constants_1.errorCodes.rpc.invalidRequest, arg),
        /**
         * Get a JSON RPC 2.0 Invalid Params (-32602) error.
         */
        invalidParams: (arg) => getEthJsonRpcError(error_constants_1.errorCodes.rpc.invalidParams, arg),
        /**
         * Get a JSON RPC 2.0 Method Not Found (-32601) error.
         */
        methodNotFound: (arg) => getEthJsonRpcError(error_constants_1.errorCodes.rpc.methodNotFound, arg),
        /**
         * Get a JSON RPC 2.0 Internal (-32603) error.
         */
        internal: (arg) => getEthJsonRpcError(error_constants_1.errorCodes.rpc.internal, arg),
        /**
         * Get a JSON RPC 2.0 Server error.
         * Permits integer error codes in the [ -32099 <= -32005 ] range.
         * Codes -32000 through -32004 are reserved by EIP-1474.
         */
        server: (opts) => {
            if (!opts || typeof opts !== 'object' || Array.isArray(opts)) {
                throw new Error('Ethereum RPC Server errors must provide single object argument.');
            }
            const { code } = opts;
            if (!Number.isInteger(code) || code > -32005 || code < -32099) {
                throw new Error('"code" must be an integer such that: -32099 <= code <= -32005');
            }
            return getEthJsonRpcError(code, opts);
        },
        /**
         * Get an Ethereum JSON RPC Invalid Input (-32000) error.
         */
        invalidInput: (arg) => getEthJsonRpcError(error_constants_1.errorCodes.rpc.invalidInput, arg),
        /**
         * Get an Ethereum JSON RPC Resource Not Found (-32001) error.
         */
        resourceNotFound: (arg) => getEthJsonRpcError(error_constants_1.errorCodes.rpc.resourceNotFound, arg),
        /**
         * Get an Ethereum JSON RPC Resource Unavailable (-32002) error.
         */
        resourceUnavailable: (arg) => getEthJsonRpcError(error_constants_1.errorCodes.rpc.resourceUnavailable, arg),
        /**
         * Get an Ethereum JSON RPC Transaction Rejected (-32003) error.
         */
        transactionRejected: (arg) => getEthJsonRpcError(error_constants_1.errorCodes.rpc.transactionRejected, arg),
        /**
         * Get an Ethereum JSON RPC Method Not Supported (-32004) error.
         */
        methodNotSupported: (arg) => getEthJsonRpcError(error_constants_1.errorCodes.rpc.methodNotSupported, arg),
        /**
         * Get an Ethereum JSON RPC Limit Exceeded (-32005) error.
         */
        limitExceeded: (arg) => getEthJsonRpcError(error_constants_1.errorCodes.rpc.limitExceeded, arg),
    },
    provider: {
        /**
         * Get an Ethereum Provider User Rejected Request (4001) error.
         */
        userRejectedRequest: (arg) => {
            return getEthProviderError(error_constants_1.errorCodes.provider.userRejectedRequest, arg);
        },
        /**
         * Get an Ethereum Provider Unauthorized (4100) error.
         */
        unauthorized: (arg) => {
            return getEthProviderError(error_constants_1.errorCodes.provider.unauthorized, arg);
        },
        /**
         * Get an Ethereum Provider Unsupported Method (4200) error.
         */
        unsupportedMethod: (arg) => {
            return getEthProviderError(error_constants_1.errorCodes.provider.unsupportedMethod, arg);
        },
        /**
         * Get an Ethereum Provider Not Connected (4900) error.
         */
        disconnected: (arg) => {
            return getEthProviderError(error_constants_1.errorCodes.provider.disconnected, arg);
        },
        /**
         * Get an Ethereum Provider Chain Not Connected (4901) error.
         */
        chainDisconnected: (arg) => {
            return getEthProviderError(error_constants_1.errorCodes.provider.chainDisconnected, arg);
        },
        /**
         * Get a custom Ethereum Provider error.
         */
        custom: (opts) => {
            if (!opts || typeof opts !== 'object' || Array.isArray(opts)) {
                throw new Error('Ethereum Provider custom errors must provide single object argument.');
            }
            const { code, message, data } = opts;
            if (!message || typeof message !== 'string') {
                throw new Error('"message" must be a nonempty string');
            }
            return new classes_1.EthereumProviderError(code, message, data);
        },
    },
};
// Internal
function getEthJsonRpcError(code, arg) {
    const [message, data] = parseOpts(arg);
    return new classes_1.EthereumRpcError(code, message || utils_1.getMessageFromCode(code), data);
}
function getEthProviderError(code, arg) {
    const [message, data] = parseOpts(arg);
    return new classes_1.EthereumProviderError(code, message || utils_1.getMessageFromCode(code), data);
}
function parseOpts(arg) {
    if (arg) {
        if (typeof arg === 'string') {
            return [arg];
        }
        else if (typeof arg === 'object' && !Array.isArray(arg)) {
            const { message, data } = arg;
            if (message && typeof message !== 'string') {
                throw new Error('Must specify string message.');
            }
            return [message || undefined, data];
        }
    }
    return [];
}

},{"./classes":"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/classes.js","./utils":"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/utils.js","./error-constants":"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/error-constants.js"}],"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageFromCode = exports.serializeError = exports.EthereumProviderError = exports.EthereumRpcError = exports.ethErrors = exports.errorCodes = void 0;
const classes_1 = require("./classes");
Object.defineProperty(exports, "EthereumRpcError", { enumerable: true, get: function () { return classes_1.EthereumRpcError; } });
Object.defineProperty(exports, "EthereumProviderError", { enumerable: true, get: function () { return classes_1.EthereumProviderError; } });
const utils_1 = require("./utils");
Object.defineProperty(exports, "serializeError", { enumerable: true, get: function () { return utils_1.serializeError; } });
Object.defineProperty(exports, "getMessageFromCode", { enumerable: true, get: function () { return utils_1.getMessageFromCode; } });
const errors_1 = require("./errors");
Object.defineProperty(exports, "ethErrors", { enumerable: true, get: function () { return errors_1.ethErrors; } });
const error_constants_1 = require("./error-constants");
Object.defineProperty(exports, "errorCodes", { enumerable: true, get: function () { return error_constants_1.errorCodes; } });

},{"./classes":"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/classes.js","./utils":"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/utils.js","./errors":"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/errors.js","./error-constants":"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/error-constants.js"}],"../node_modules/walletlink/dist/provider/SubscriptionManager.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SubscriptionManager = void 0;

const PollingBlockTracker = require("eth-block-tracker");

const createSubscriptionManager = require("eth-json-rpc-filters/subscriptionManager");

const noop = () => {};

class SubscriptionManager {
  constructor(provider) {
    const blockTracker = new PollingBlockTracker({
      provider,
      pollingInterval: 15 * 1000,
      setSkipCacheFlag: true
    });
    const {
      events,
      middleware
    } = createSubscriptionManager({
      blockTracker,
      provider
    });
    this.events = events;
    this.subscriptionMiddleware = middleware;
  }

  async handleRequest(request) {
    const result = {};
    await this.subscriptionMiddleware(request, result, noop, noop);
    return result;
  }

  destroy() {
    this.subscriptionMiddleware.destroy();
  }

}

exports.SubscriptionManager = SubscriptionManager;
},{"eth-block-tracker":"../node_modules/eth-block-tracker/src/polling.js","eth-json-rpc-filters/subscriptionManager":"../node_modules/eth-json-rpc-filters/subscriptionManager.js"}],"../node_modules/walletlink/dist/EthereumChain.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EthereumChain = void 0;
var EthereumChain;

(function (EthereumChain) {
  // mainnets
  EthereumChain[EthereumChain["ETHEREUM_MAINNET"] = 1] = "ETHEREUM_MAINNET";
  EthereumChain[EthereumChain["OPTIMISM_MAINNET"] = 10] = "OPTIMISM_MAINNET";
  EthereumChain[EthereumChain["POLYGON_MAINNET"] = 137] = "POLYGON_MAINNET";
  EthereumChain[EthereumChain["ETHEREUM_CLASSIC_MAINNET"] = 61] = "ETHEREUM_CLASSIC_MAINNET";
  EthereumChain[EthereumChain["BSC_MAINNET"] = 56] = "BSC_MAINNET";
  EthereumChain[EthereumChain["FANTOM_MAINNET"] = 250] = "FANTOM_MAINNET";
  EthereumChain[EthereumChain["ARBITRUM_MAINNET"] = 42161] = "ARBITRUM_MAINNET";
  EthereumChain[EthereumChain["XDAI_MAINNET"] = 100] = "XDAI_MAINNET";
  EthereumChain[EthereumChain["AVALANCHE_MAINNET"] = 43114] = "AVALANCHE_MAINNET"; // testnets

  EthereumChain[EthereumChain["ROPSTEN"] = 3] = "ROPSTEN";
  EthereumChain[EthereumChain["RINKEBY"] = 4] = "RINKEBY";
  EthereumChain[EthereumChain["GOERLI"] = 5] = "GOERLI";
  EthereumChain[EthereumChain["KOVAN"] = 42] = "KOVAN";
  EthereumChain[EthereumChain["OPTIMISM_KOVAN"] = 69] = "OPTIMISM_KOVAN";
  EthereumChain[EthereumChain["POLYGON_TESTNET"] = 80001] = "POLYGON_TESTNET";
  EthereumChain[EthereumChain["BSC_TESTNET"] = 97] = "BSC_TESTNET";
  EthereumChain[EthereumChain["FANTOM_TESTNET"] = 4002] = "FANTOM_TESTNET";
  EthereumChain[EthereumChain["ARBITRUM_TESTNET"] = 421611] = "ARBITRUM_TESTNET";
  EthereumChain[EthereumChain["AVALANCHE_FUJI"] = 43113] = "AVALANCHE_FUJI";
})(EthereumChain = exports.EthereumChain || (exports.EthereumChain = {}));

(function (EthereumChain) {
  function rpcUrl(thiz) {
    switch (thiz) {
      case EthereumChain.ETHEREUM_MAINNET:
        return "https://mainnet-infura.wallet.coinbase.com";

      case EthereumChain.ROPSTEN:
        return "https://ropsten-infura.wallet.coinbase.com";

      case EthereumChain.RINKEBY:
        return "https://rinkeby-infura.wallet.coinbase.com";

      case EthereumChain.KOVAN:
        return "https://kovan-infura.wallet.coinbase.com";

      case EthereumChain.GOERLI:
        return "https://goerli-node.wallet.coinbase.com";

      case EthereumChain.OPTIMISM_KOVAN:
        return "https://optimism-node.wallet.coinbase.com";

      case EthereumChain.OPTIMISM_MAINNET:
        return "https://optimism-mainnet.wallet.coinbase.com";

      case EthereumChain.POLYGON_MAINNET:
        return "https://polygon-mainnet-infura.wallet.coinbase.com";

      case EthereumChain.POLYGON_TESTNET:
        return "https://polygon-mumbai-infura.wallet.coinbase.com";

      case EthereumChain.BSC_MAINNET:
        return "https://bsc-dataseed.binance.org";

      case EthereumChain.BSC_TESTNET:
        return "https://data-seed-prebsc-1-s1.binance.org:8545";

      case EthereumChain.FANTOM_MAINNET:
        return "https://rpcapi.fantom.network";

      case EthereumChain.FANTOM_TESTNET:
        return "https://rpc.testnet.fantom.network";

      case EthereumChain.ARBITRUM_MAINNET:
        return "https://l2-mainnet.wallet.coinbase.com?targetName=arbitrum";

      case EthereumChain.ARBITRUM_TESTNET:
        return "https://rinkeby.arbitrum.io/rpc";

      case EthereumChain.XDAI_MAINNET:
        return "https://rpc.xdaichain.com";

      case EthereumChain.AVALANCHE_MAINNET:
        return "https://api.avax.network/ext/bc/C/rpc";

      case EthereumChain.AVALANCHE_FUJI:
        return "https://api.avax-test.network/ext/bc/C/rpc";

      default:
        return undefined;
    }
  }

  EthereumChain.rpcUrl = rpcUrl;

  function fromChainId(chainId) {
    switch (Number(chainId)) {
      // mainnets
      case EthereumChain.ETHEREUM_MAINNET.valueOf():
        return EthereumChain.ETHEREUM_MAINNET;

      case EthereumChain.OPTIMISM_MAINNET.valueOf():
        return EthereumChain.OPTIMISM_MAINNET;

      case EthereumChain.POLYGON_MAINNET.valueOf():
        return EthereumChain.POLYGON_MAINNET;

      case EthereumChain.ETHEREUM_CLASSIC_MAINNET.valueOf():
        return EthereumChain.ETHEREUM_CLASSIC_MAINNET;

      case EthereumChain.BSC_MAINNET.valueOf():
        return EthereumChain.BSC_MAINNET;

      case EthereumChain.FANTOM_MAINNET.valueOf():
        return EthereumChain.FANTOM_MAINNET;

      case EthereumChain.ARBITRUM_MAINNET.valueOf():
        return EthereumChain.ARBITRUM_MAINNET;

      case EthereumChain.AVALANCHE_MAINNET.valueOf():
        return EthereumChain.AVALANCHE_MAINNET;

      case EthereumChain.XDAI_MAINNET.valueOf():
        return EthereumChain.XDAI_MAINNET;
      // testnets

      case EthereumChain.ROPSTEN.valueOf():
        return EthereumChain.ROPSTEN;

      case EthereumChain.RINKEBY.valueOf():
        return EthereumChain.RINKEBY;

      case EthereumChain.GOERLI.valueOf():
        return EthereumChain.GOERLI;

      case EthereumChain.KOVAN.valueOf():
        return EthereumChain.KOVAN;

      case EthereumChain.OPTIMISM_KOVAN.valueOf():
        return EthereumChain.OPTIMISM_KOVAN;

      case EthereumChain.POLYGON_TESTNET.valueOf():
        return EthereumChain.POLYGON_TESTNET;

      case EthereumChain.BSC_TESTNET.valueOf():
        return EthereumChain.BSC_TESTNET;

      case EthereumChain.FANTOM_TESTNET.valueOf():
        return EthereumChain.FANTOM_TESTNET;

      case EthereumChain.ARBITRUM_TESTNET.valueOf():
        return EthereumChain.ARBITRUM_TESTNET;

      case EthereumChain.AVALANCHE_FUJI.valueOf():
        return EthereumChain.AVALANCHE_FUJI;

      default:
        return undefined;
    }
  }

  EthereumChain.fromChainId = fromChainId;
})(EthereumChain = exports.EthereumChain || (exports.EthereumChain = {}));
},{}],"../node_modules/walletlink/dist/provider/WalletLinkProvider.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WalletLinkProvider = void 0;

const bn_js_1 = __importDefault(require("bn.js"));

const util_1 = require("../util");

const eth_eip712_util_1 = __importDefault(require("../vendor-js/eth-eip712-util"));

const FilterPolyfill_1 = require("./FilterPolyfill");

const JSONRPC_1 = require("./JSONRPC");

const eth_rpc_errors_1 = require("eth-rpc-errors");

const safe_event_emitter_1 = __importDefault(require("@metamask/safe-event-emitter"));

const SubscriptionManager_1 = require("./SubscriptionManager");

const EthereumChain_1 = require("../EthereumChain");

const LOCAL_STORAGE_ADDRESSES_KEY = "Addresses";
const DEFAULT_CHAIN_ID_KEY = "DefaultChainId"; // Indicates chain has been switched by switchEthereumChain or addEthereumChain request

const HAS_CHAIN_BEEN_SWITCHED_KEY = "HasChainBeenSwitched";

class WalletLinkProvider extends safe_event_emitter_1.default {
  constructor(options) {
    super();
    this._filterPolyfill = new FilterPolyfill_1.FilterPolyfill(this);
    this._subscriptionManager = new SubscriptionManager_1.SubscriptionManager(this);
    this._relay = null;
    this._addresses = [];
    this.hasMadeFirstChainChangedEmission = false; // true if mobile client has sent message to override jsonRpcUrl+chainId

    this.isChainOverridden = false;
    this._send = this.send;
    this._sendAsync = this.sendAsync;
    this.setProviderInfo = this.setProviderInfo.bind(this);
    this.updateProviderInfo = this.updateProviderInfo.bind(this);
    this.getChainId = this.getChainId.bind(this);
    this.setAppInfo = this.setAppInfo.bind(this);
    this.enable = this.enable.bind(this);
    this.close = this.close.bind(this);
    this.send = this.send.bind(this);
    this.sendAsync = this.sendAsync.bind(this);
    this.request = this.request.bind(this);
    this._setAddresses = this._setAddresses.bind(this);
    this.scanQRCode = this.scanQRCode.bind(this);
    this.arbitraryRequest = this.arbitraryRequest.bind(this);
    this.childRequestEthereumAccounts = this.childRequestEthereumAccounts.bind(this);
    this._jsonRpcUrl = options.jsonRpcUrl;
    this._overrideIsMetaMask = options.overrideIsMetaMask;
    this._relayProvider = options.relayProvider;
    this._storage = options.storage;
    this._relayEventManager = options.relayEventManager;
    const chainId = this.getChainId();
    const chainIdStr = util_1.prepend0x(chainId.toString(16)); // indicate that we've connected, for EIP-1193 compliance

    this.emit("connect", {
      chainIdStr
    });

    const cachedAddresses = this._storage.getItem(LOCAL_STORAGE_ADDRESSES_KEY);

    if (cachedAddresses) {
      const addresses = cachedAddresses.split(" ");

      if (addresses[0] !== "") {
        this._addresses = addresses;
        this.emit("accountsChanged", addresses);
      }
    }

    this._subscriptionManager.events.on("notification", notification => {
      this.emit("message", {
        type: notification.method,
        data: notification.params
      });
    });

    if (this._addresses.length > 0) {
      this.initializeRelay();
    }
  }

  get selectedAddress() {
    return this._addresses[0] || undefined;
  }

  get networkVersion() {
    return this.getChainId().toString(10);
  }

  get chainId() {
    return util_1.prepend0x(this.getChainId().toString(16));
  }

  get isWalletLink() {
    return true;
  }
  /**
   * Some DApps (i.e. Alpha Homora) seem to require the window.ethereum object return
   * true for this method.
   */


  get isMetaMask() {
    return this._overrideIsMetaMask;
  }

  get host() {
    return this._jsonRpcUrl;
  }

  get connected() {
    return true;
  }

  isConnected() {
    return true;
  } // @ts-ignore


  setProviderInfo(jsonRpcUrl, chainId) {
    if (this.isChainOverridden) return;
    this.updateProviderInfo(jsonRpcUrl, this.getChainId(), false);
  }

  updateProviderInfo(jsonRpcUrl, chainId, fromRelay) {
    const hasChainSwitched = this._storage.getItem(HAS_CHAIN_BEEN_SWITCHED_KEY) === "true";
    if (hasChainSwitched && fromRelay) return;

    if (fromRelay) {
      this.isChainOverridden = true;
    }

    this._jsonRpcUrl = jsonRpcUrl; // emit chainChanged event if necessary

    const originalChainId = this.getChainId();

    this._storage.setItem(DEFAULT_CHAIN_ID_KEY, chainId.toString(10));

    const chainChanged = util_1.ensureIntNumber(chainId) !== originalChainId;

    if (chainChanged || !this.hasMadeFirstChainChangedEmission) {
      this.emit("chainChanged", this.getChainId());
      this.hasMadeFirstChainChangedEmission = true;
    }
  }

  async switchEthereumChain(rpcUrl, chainId) {
    if (util_1.ensureIntNumber(chainId) === this.getChainId()) {
      return;
    }

    const relay = await this.initializeRelay();
    const res = await relay.switchEthereumChain(chainId.toString(10));

    if (res.result === true) {
      this._storage.setItem(HAS_CHAIN_BEEN_SWITCHED_KEY, "true");

      this.updateProviderInfo(rpcUrl, chainId, false);
    }
  }

  setAppInfo(appName, appLogoUrl) {
    this.initializeRelay().then(relay => relay.setAppInfo(appName, appLogoUrl));
  }

  async enable() {
    if (this._addresses.length > 0) {
      return this._addresses;
    }

    return await this._send(JSONRPC_1.JSONRPCMethod.eth_requestAccounts);
  }

  close() {
    this.initializeRelay().then(relay => relay.resetAndReload());
  }

  send(requestOrMethod, callbackOrParams) {
    // send<T>(method, params): Promise<T>
    if (typeof requestOrMethod === "string") {
      const method = requestOrMethod;
      const params = Array.isArray(callbackOrParams) ? callbackOrParams : callbackOrParams !== undefined ? [callbackOrParams] : [];
      const request = {
        jsonrpc: "2.0",
        id: 0,
        method,
        params
      };
      return this._sendRequestAsync(request).then(res => res.result);
    } // send(JSONRPCRequest | JSONRPCRequest[], callback): void


    if (typeof callbackOrParams === "function") {
      const request = requestOrMethod;
      const callback = callbackOrParams;
      return this._sendAsync(request, callback);
    } // send(JSONRPCRequest[]): JSONRPCResponse[]


    if (Array.isArray(requestOrMethod)) {
      const requests = requestOrMethod;
      return requests.map(r => this._sendRequest(r));
    } // send(JSONRPCRequest): JSONRPCResponse


    const req = requestOrMethod;
    return this._sendRequest(req);
  }

  sendAsync(request, callback) {
    if (typeof callback !== "function") {
      throw new Error("callback is required");
    } // send(JSONRPCRequest[], callback): void


    if (Array.isArray(request)) {
      const arrayCb = callback;

      this._sendMultipleRequestsAsync(request).then(responses => arrayCb(null, responses)).catch(err => arrayCb(err, null));

      return;
    } // send(JSONRPCRequest, callback): void


    const cb = callback;

    this._sendRequestAsync(request).then(response => cb(null, response)).catch(err => cb(err, null));
  }

  async request(args) {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
      throw eth_rpc_errors_1.ethErrors.rpc.invalidRequest({
        message: "Expected a single, non-array, object argument.",
        data: args
      });
    }

    const {
      method,
      params
    } = args;

    if (typeof method !== "string" || method.length === 0) {
      throw eth_rpc_errors_1.ethErrors.rpc.invalidRequest({
        message: "'args.method' must be a non-empty string.",
        data: args
      });
    }

    if (params !== undefined && !Array.isArray(params) && (typeof params !== "object" || params === null)) {
      throw eth_rpc_errors_1.ethErrors.rpc.invalidRequest({
        message: "'args.params' must be an object or array if provided.",
        data: args
      });
    }

    const newParams = params === undefined ? [] : params; // WalletLink Requests

    const id = this._relayEventManager.makeRequestId();

    const result = await this._sendRequestAsync({
      method,
      params: newParams,
      jsonrpc: "2.0",
      id
    });
    return result.result;
  }

  async scanQRCode(match) {
    const relay = await this.initializeRelay();
    const res = await relay.scanQRCode(util_1.ensureRegExpString(match));

    if (typeof res.result !== "string") {
      throw new Error("result was not a string");
    }

    return res.result;
  }

  async arbitraryRequest(data) {
    const relay = await this.initializeRelay();
    const res = await relay.arbitraryRequest(data);

    if (typeof res.result !== "string") {
      throw new Error("result was not a string");
    }

    return res.result;
  }

  async childRequestEthereumAccounts(childSessionId, childSessionSecret, dappName, dappLogoURL, dappURL) {
    const relay = await this.initializeRelay();
    await relay.childRequestEthereumAccounts(childSessionId, childSessionSecret, dappName, dappLogoURL, dappURL);
    return true;
  }

  supportsSubscriptions() {
    return false;
  }

  subscribe() {
    throw new Error("Subscriptions are not supported");
  }

  unsubscribe() {
    throw new Error("Subscriptions are not supported");
  }

  disconnect() {
    return true;
  }

  _sendRequest(request) {
    const response = {
      jsonrpc: "2.0",
      id: request.id
    };
    const {
      method
    } = request;
    response.result = this._handleSynchronousMethods(request);

    if (response.result === undefined) {
      throw new Error(`WalletLink does not support calling ${method} synchronously without ` + `a callback. Please provide a callback parameter to call ${method} ` + `asynchronously.`);
    }

    return response;
  }

  _setAddresses(addresses) {
    if (!Array.isArray(addresses)) {
      throw new Error("addresses is not an array");
    }

    const newAddresses = addresses.map(address => util_1.ensureAddressString(address));

    if (JSON.stringify(newAddresses) === JSON.stringify(this._addresses)) {
      return;
    }

    this._addresses = newAddresses;
    this.emit("accountsChanged", this._addresses);

    this._storage.setItem(LOCAL_STORAGE_ADDRESSES_KEY, addresses.join(" "));

    window.dispatchEvent(new CustomEvent("walletlink:addresses", {
      detail: this._addresses
    }));
  }

  _sendRequestAsync(request) {
    return new Promise((resolve, reject) => {
      try {
        const syncResult = this._handleSynchronousMethods(request);

        if (syncResult !== undefined) {
          return resolve({
            jsonrpc: "2.0",
            id: request.id,
            result: syncResult
          });
        }

        const filterPromise = this._handleAsynchronousFilterMethods(request);

        if (filterPromise !== undefined) {
          filterPromise.then(res => resolve(Object.assign(Object.assign({}, res), {
            id: request.id
          }))).catch(err => reject(err));
          return;
        }

        const subscriptionPromise = this._handleSubscriptionMethods(request);

        if (subscriptionPromise !== undefined) {
          subscriptionPromise.then(res => resolve({
            jsonrpc: "2.0",
            id: request.id,
            result: res.result
          })).catch(err => reject(err));
          return;
        }
      } catch (err) {
        return reject(err);
      }

      this._handleAsynchronousMethods(request).then(res => resolve(Object.assign(Object.assign({}, res), {
        id: request.id
      }))).catch(err => reject(err));
    });
  }

  _sendMultipleRequestsAsync(requests) {
    return Promise.all(requests.map(r => this._sendRequestAsync(r)));
  }

  _handleSynchronousMethods(request) {
    const {
      method
    } = request;
    const params = request.params || [];

    switch (method) {
      case JSONRPC_1.JSONRPCMethod.eth_accounts:
        return this._eth_accounts();

      case JSONRPC_1.JSONRPCMethod.eth_coinbase:
        return this._eth_coinbase();

      case JSONRPC_1.JSONRPCMethod.eth_uninstallFilter:
        return this._eth_uninstallFilter(params);

      case JSONRPC_1.JSONRPCMethod.net_version:
        return this._net_version();

      case JSONRPC_1.JSONRPCMethod.eth_chainId:
        return this._eth_chainId();

      default:
        return undefined;
    }
  }

  _handleAsynchronousMethods(request) {
    const {
      method
    } = request;
    const params = request.params || [];

    switch (method) {
      case JSONRPC_1.JSONRPCMethod.eth_requestAccounts:
        return this._eth_requestAccounts();

      case JSONRPC_1.JSONRPCMethod.eth_sign:
        return this._eth_sign(params);

      case JSONRPC_1.JSONRPCMethod.eth_ecRecover:
        return this._eth_ecRecover(params);

      case JSONRPC_1.JSONRPCMethod.personal_sign:
        return this._personal_sign(params);

      case JSONRPC_1.JSONRPCMethod.personal_ecRecover:
        return this._personal_ecRecover(params);

      case JSONRPC_1.JSONRPCMethod.eth_signTransaction:
        return this._eth_signTransaction(params);

      case JSONRPC_1.JSONRPCMethod.eth_sendRawTransaction:
        return this._eth_sendRawTransaction(params);

      case JSONRPC_1.JSONRPCMethod.eth_sendTransaction:
        return this._eth_sendTransaction(params);

      case JSONRPC_1.JSONRPCMethod.eth_signTypedData_v1:
        return this._eth_signTypedData_v1(params);

      case JSONRPC_1.JSONRPCMethod.eth_signTypedData_v2:
        return this._throwUnsupportedMethodError();

      case JSONRPC_1.JSONRPCMethod.eth_signTypedData_v3:
        return this._eth_signTypedData_v3(params);

      case JSONRPC_1.JSONRPCMethod.eth_signTypedData_v4:
      case JSONRPC_1.JSONRPCMethod.eth_signTypedData:
        return this._eth_signTypedData_v4(params);

      case JSONRPC_1.JSONRPCMethod.walletlink_arbitrary:
        return this._walletlink_arbitrary(params);

      case JSONRPC_1.JSONRPCMethod.wallet_addEthereumChain:
        return this._wallet_addEthereumChain(params);

      case JSONRPC_1.JSONRPCMethod.wallet_switchEthereumChain:
        return this._wallet_switchEthereumChain(params);
    }

    if (!this._jsonRpcUrl) throw Error("Error: No jsonRpcUrl provided");
    return window.fetch(this._jsonRpcUrl, {
      method: "POST",
      body: JSON.stringify(request),
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => res.json()).then(json => {
      if (!json) {
        throw eth_rpc_errors_1.ethErrors.rpc.parse({});
      }

      const response = json;
      const {
        error
      } = response;

      if (error) {
        throw eth_rpc_errors_1.serializeError(error);
      }

      return response;
    });
  }

  _handleAsynchronousFilterMethods(request) {
    const {
      method
    } = request;
    const params = request.params || [];

    switch (method) {
      case JSONRPC_1.JSONRPCMethod.eth_newFilter:
        return this._eth_newFilter(params);

      case JSONRPC_1.JSONRPCMethod.eth_newBlockFilter:
        return this._eth_newBlockFilter();

      case JSONRPC_1.JSONRPCMethod.eth_newPendingTransactionFilter:
        return this._eth_newPendingTransactionFilter();

      case JSONRPC_1.JSONRPCMethod.eth_getFilterChanges:
        return this._eth_getFilterChanges(params);

      case JSONRPC_1.JSONRPCMethod.eth_getFilterLogs:
        return this._eth_getFilterLogs(params);
    }

    return undefined;
  }

  _handleSubscriptionMethods(request) {
    switch (request.method) {
      case JSONRPC_1.JSONRPCMethod.eth_subscribe:
      case JSONRPC_1.JSONRPCMethod.eth_unsubscribe:
        return this._subscriptionManager.handleRequest(request);
    }

    return undefined;
  }

  _isKnownAddress(addressString) {
    try {
      const address = util_1.ensureAddressString(addressString);
      return this._addresses.includes(address);
    } catch (_a) {}

    return false;
  }

  _ensureKnownAddress(addressString) {
    if (!this._isKnownAddress(addressString)) {
      throw new Error("Unknown Ethereum address");
    }
  }

  _prepareTransactionParams(tx) {
    const fromAddress = tx.from ? util_1.ensureAddressString(tx.from) : this.selectedAddress;

    if (!fromAddress) {
      throw new Error("Ethereum address is unavailable");
    }

    this._ensureKnownAddress(fromAddress);

    const toAddress = tx.to ? util_1.ensureAddressString(tx.to) : null;
    const weiValue = tx.value != null ? util_1.ensureBN(tx.value) : new bn_js_1.default(0);
    const data = tx.data ? util_1.ensureBuffer(tx.data) : Buffer.alloc(0);
    const nonce = tx.nonce != null ? util_1.ensureIntNumber(tx.nonce) : null;
    const gasPriceInWei = tx.gasPrice != null ? util_1.ensureBN(tx.gasPrice) : null;
    const maxFeePerGas = tx.maxFeePerGas != null ? util_1.ensureBN(tx.maxFeePerGas) : null;
    const maxPriorityFeePerGas = tx.maxPriorityFeePerGas != null ? util_1.ensureBN(tx.maxPriorityFeePerGas) : null;
    const gasLimit = tx.gas != null ? util_1.ensureBN(tx.gas) : null;
    const chainId = this.getChainId();
    return {
      fromAddress,
      toAddress,
      weiValue,
      data,
      nonce,
      gasPriceInWei,
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasLimit,
      chainId
    };
  }

  _requireAuthorization() {
    if (this._addresses.length === 0) {
      throw eth_rpc_errors_1.ethErrors.provider.unauthorized({});
    }
  }

  _throwUnsupportedMethodError() {
    throw eth_rpc_errors_1.ethErrors.provider.unsupportedMethod({});
  }

  async _signEthereumMessage(message, address, addPrefix, typedDataJson) {
    this._ensureKnownAddress(address);

    try {
      const relay = await this.initializeRelay();
      const res = await relay.signEthereumMessage(message, address, addPrefix, typedDataJson);
      return {
        jsonrpc: "2.0",
        id: 0,
        result: res.result
      };
    } catch (err) {
      if (typeof err.message === "string" && err.message.match(/(denied|rejected)/i)) {
        throw eth_rpc_errors_1.ethErrors.provider.userRejectedRequest("User denied message signature");
      }

      throw err;
    }
  }

  async _ethereumAddressFromSignedMessage(message, signature, addPrefix) {
    const relay = await this.initializeRelay();
    const res = await relay.ethereumAddressFromSignedMessage(message, signature, addPrefix);
    return {
      jsonrpc: "2.0",
      id: 0,
      result: res.result
    };
  }

  _eth_accounts() {
    return this._addresses;
  }

  _eth_coinbase() {
    return this.selectedAddress || null;
  }

  _net_version() {
    return this.getChainId().toString(10);
  }

  _eth_chainId() {
    return util_1.hexStringFromIntNumber(this.getChainId());
  }

  getChainId() {
    const chainIdStr = this._storage.getItem(DEFAULT_CHAIN_ID_KEY) || "1";
    const chainId = parseInt(chainIdStr, 10);
    return util_1.ensureIntNumber(chainId);
  }

  async _eth_requestAccounts() {
    if (this._addresses.length > 0) {
      return Promise.resolve({
        jsonrpc: "2.0",
        id: 0,
        result: this._addresses
      });
    }

    let res;

    try {
      const relay = await this.initializeRelay();
      res = await relay.requestEthereumAccounts();
    } catch (err) {
      if (typeof err.message === "string" && err.message.match(/(denied|rejected)/i)) {
        throw eth_rpc_errors_1.ethErrors.provider.userRejectedRequest("User denied account authorization");
      }

      throw err;
    }

    if (!res.result) {
      throw new Error("accounts received is empty");
    }

    this._setAddresses(res.result);

    return {
      jsonrpc: "2.0",
      id: 0,
      result: this._addresses
    };
  }

  _eth_sign(params) {
    this._requireAuthorization();

    const address = util_1.ensureAddressString(params[0]);
    const message = util_1.ensureBuffer(params[1]);
    return this._signEthereumMessage(message, address, false);
  }

  _eth_ecRecover(params) {
    const message = util_1.ensureBuffer(params[0]);
    const signature = util_1.ensureBuffer(params[1]);
    return this._ethereumAddressFromSignedMessage(message, signature, false);
  }

  _personal_sign(params) {
    this._requireAuthorization();

    const message = util_1.ensureBuffer(params[0]);
    const address = util_1.ensureAddressString(params[1]);
    return this._signEthereumMessage(message, address, true);
  }

  _personal_ecRecover(params) {
    const message = util_1.ensureBuffer(params[0]);
    const signature = util_1.ensureBuffer(params[1]);
    return this._ethereumAddressFromSignedMessage(message, signature, true);
  }

  async _eth_signTransaction(params) {
    this._requireAuthorization();

    const tx = this._prepareTransactionParams(params[0] || {});

    try {
      const relay = await this.initializeRelay();
      const res = await relay.signEthereumTransaction(tx);
      return {
        jsonrpc: "2.0",
        id: 0,
        result: res.result
      };
    } catch (err) {
      if (typeof err.message === "string" && err.message.match(/(denied|rejected)/i)) {
        throw eth_rpc_errors_1.ethErrors.provider.userRejectedRequest("User denied transaction signature");
      }

      throw err;
    }
  }

  async _eth_sendRawTransaction(params) {
    const signedTransaction = util_1.ensureBuffer(params[0]);
    const relay = await this.initializeRelay();
    const res = await relay.submitEthereumTransaction(signedTransaction, this.getChainId());
    return {
      jsonrpc: "2.0",
      id: 0,
      result: res.result
    };
  }

  async _eth_sendTransaction(params) {
    this._requireAuthorization();

    const tx = this._prepareTransactionParams(params[0] || {});

    try {
      const relay = await this.initializeRelay();
      const res = await relay.signAndSubmitEthereumTransaction(tx);
      return {
        jsonrpc: "2.0",
        id: 0,
        result: res.result
      };
    } catch (err) {
      if (typeof err.message === "string" && err.message.match(/(denied|rejected)/i)) {
        throw eth_rpc_errors_1.ethErrors.provider.userRejectedRequest("User denied transaction signature");
      }

      throw err;
    }
  }

  async _eth_signTypedData_v1(params) {
    this._requireAuthorization();

    const typedData = util_1.ensureParsedJSONObject(params[0]);
    const address = util_1.ensureAddressString(params[1]);

    this._ensureKnownAddress(address);

    const message = eth_eip712_util_1.default.hashForSignTypedDataLegacy({
      data: typedData
    });
    const typedDataJSON = JSON.stringify(typedData, null, 2);
    return this._signEthereumMessage(message, address, false, typedDataJSON);
  }

  async _eth_signTypedData_v3(params) {
    this._requireAuthorization();

    const address = util_1.ensureAddressString(params[0]);
    const typedData = util_1.ensureParsedJSONObject(params[1]);

    this._ensureKnownAddress(address);

    const message = eth_eip712_util_1.default.hashForSignTypedData_v3({
      data: typedData
    });
    const typedDataJSON = JSON.stringify(typedData, null, 2);
    return this._signEthereumMessage(message, address, false, typedDataJSON);
  }

  async _eth_signTypedData_v4(params) {
    this._requireAuthorization();

    const address = util_1.ensureAddressString(params[0]);
    const typedData = util_1.ensureParsedJSONObject(params[1]);

    this._ensureKnownAddress(address);

    const message = eth_eip712_util_1.default.hashForSignTypedData_v4({
      data: typedData
    });
    const typedDataJSON = JSON.stringify(typedData, null, 2);
    return this._signEthereumMessage(message, address, false, typedDataJSON);
  }

  async _walletlink_arbitrary(params) {
    const data = params[0];

    if (typeof data !== "string") {
      throw new Error("parameter must be a string");
    }

    const result = await this.arbitraryRequest(data);
    return {
      jsonrpc: "2.0",
      id: 0,
      result
    };
  }

  async _wallet_addEthereumChain(params) {
    const request = params[0];
    const chainIdNumber = parseInt(request.chainId, 16);
    const ethereumChain = EthereumChain_1.EthereumChain.fromChainId(BigInt(chainIdNumber));

    if (ethereumChain === undefined) {
      return {
        jsonrpc: '2.0',
        id: 0,
        error: {
          code: 2,
          message: `chainId ${request.chainId} not supported`
        }
      };
    }

    const rpcUrl = EthereumChain_1.EthereumChain.rpcUrl(ethereumChain); // @ts-ignore

    await this.switchEthereumChain(rpcUrl, parseInt(request.chainId, 16));
    return {
      jsonrpc: '2.0',
      id: 0,
      result: null
    };
  }

  async _wallet_switchEthereumChain(params) {
    const request = params[0];
    const chainIdNumber = parseInt(request.chainId, 16);
    const ethereumChain = EthereumChain_1.EthereumChain.fromChainId(BigInt(chainIdNumber));

    if (ethereumChain === undefined) {
      return {
        jsonrpc: '2.0',
        id: 0,
        error: {
          code: 2,
          message: `chainId ${request.chainId} not supported`
        }
      };
    }

    const rpcUrl = EthereumChain_1.EthereumChain.rpcUrl(ethereumChain); // @ts-ignore

    await this.switchEthereumChain(rpcUrl, parseInt(request.chainId, 16));
    return {
      jsonrpc: "2.0",
      id: 0,
      result: null
    };
  }

  _eth_uninstallFilter(params) {
    const filterId = util_1.ensureHexString(params[0]);
    return this._filterPolyfill.uninstallFilter(filterId);
  }

  async _eth_newFilter(params) {
    const param = params[0];
    const filterId = await this._filterPolyfill.newFilter(param);
    return {
      jsonrpc: "2.0",
      id: 0,
      result: filterId
    };
  }

  async _eth_newBlockFilter() {
    const filterId = await this._filterPolyfill.newBlockFilter();
    return {
      jsonrpc: "2.0",
      id: 0,
      result: filterId
    };
  }

  async _eth_newPendingTransactionFilter() {
    const filterId = await this._filterPolyfill.newPendingTransactionFilter();
    return {
      jsonrpc: "2.0",
      id: 0,
      result: filterId
    };
  }

  _eth_getFilterChanges(params) {
    const filterId = util_1.ensureHexString(params[0]);
    return this._filterPolyfill.getFilterChanges(filterId);
  }

  _eth_getFilterLogs(params) {
    const filterId = util_1.ensureHexString(params[0]);
    return this._filterPolyfill.getFilterLogs(filterId);
  }

  initializeRelay() {
    if (this._relay) {
      return Promise.resolve(this._relay);
    }

    return this._relayProvider().then(relay => {
      relay.setAccountsCallback(accounts => this._setAddresses(accounts));
      relay.setChainIdCallback(chainId => {
        this.updateProviderInfo(this._jsonRpcUrl, parseInt(chainId, 10), true);
      });
      relay.setJsonRpcUrlCallback(jsonRpcUrl => {
        this.updateProviderInfo(jsonRpcUrl, this.getChainId(), true);
      });
      this._relay = relay;
      return relay;
    });
  }

}

exports.WalletLinkProvider = WalletLinkProvider;
},{"bn.js":"../node_modules/walletlink/node_modules/bn.js/lib/bn.js","../util":"../node_modules/walletlink/dist/util.js","../vendor-js/eth-eip712-util":"../node_modules/walletlink/dist/vendor-js/eth-eip712-util/index.js","./FilterPolyfill":"../node_modules/walletlink/dist/provider/FilterPolyfill.js","./JSONRPC":"../node_modules/walletlink/dist/provider/JSONRPC.js","eth-rpc-errors":"../node_modules/walletlink/node_modules/eth-rpc-errors/dist/index.js","@metamask/safe-event-emitter":"../node_modules/@metamask/safe-event-emitter/index.js","./SubscriptionManager":"../node_modules/walletlink/dist/provider/SubscriptionManager.js","../EthereumChain":"../node_modules/walletlink/dist/EthereumChain.js","buffer":"../node_modules/node-libs-browser/node_modules/buffer/index.js"}],"../node_modules/walletlink/dist/lib/ScopedLocalStorage.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScopedLocalStorage = void 0;

class ScopedLocalStorage {
  constructor(scope) {
    this.scope = scope;
  }

  setItem(key, value) {
    localStorage.setItem(this.scopedKey(key), value);
  }

  getItem(key) {
    return localStorage.getItem(this.scopedKey(key));
  }

  removeItem(key) {
    localStorage.removeItem(this.scopedKey(key));
  }

  clear() {
    const prefix = this.scopedKey("");
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (typeof key === "string" && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  scopedKey(key) {
    return `${this.scope}:${key}`;
  }

}

exports.ScopedLocalStorage = ScopedLocalStorage;
},{}],"../node_modules/walletlink/dist/provider/WalletLinkUI.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WalletLinkUI = void 0;

class WalletLinkUI {
  constructor(_) {}
  /**
   * We want to disable showing the qr code for in-page walletlink if the dapp hasn't provided a json rpc url
   */


  setConnectDisabled(_) {}

}

exports.WalletLinkUI = WalletLinkUI;
},{}],"../node_modules/walletlink/dist/lib/cssReset-css.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `@namespace svg "http://www.w3.org/2000/svg";.-walletlink-css-reset,.-walletlink-css-reset *{animation:none;animation-delay:0;animation-direction:normal;animation-duration:0;animation-fill-mode:none;animation-iteration-count:1;animation-name:none;animation-play-state:running;animation-timing-function:ease;backface-visibility:visible;background:0;background-attachment:scroll;background-clip:border-box;background-color:transparent;background-image:none;background-origin:padding-box;background-position:0 0;background-position-x:0;background-position-y:0;background-repeat:repeat;background-size:auto auto;border:0;border-style:none;border-width:medium;border-color:inherit;border-bottom:0;border-bottom-color:inherit;border-bottom-left-radius:0;border-bottom-right-radius:0;border-bottom-style:none;border-bottom-width:medium;border-collapse:separate;border-image:none;border-left:0;border-left-color:inherit;border-left-style:none;border-left-width:medium;border-radius:0;border-right:0;border-right-color:inherit;border-right-style:none;border-right-width:medium;border-spacing:0;border-top:0;border-top-color:inherit;border-top-left-radius:0;border-top-right-radius:0;border-top-style:none;border-top-width:medium;bottom:auto;box-shadow:none;box-sizing:border-box;caption-side:top;clear:none;clip:auto;color:inherit;columns:auto;column-count:auto;column-fill:balance;column-gap:normal;column-rule:medium none currentColor;column-rule-color:currentColor;column-rule-style:none;column-rule-width:none;column-span:1;column-width:auto;content:normal;counter-increment:none;counter-reset:none;cursor:auto;direction:ltr;display:block;empty-cells:show;float:none;font:normal;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif;font-size:medium;font-style:normal;font-variant:normal;font-weight:normal;height:auto;hyphens:none;left:auto;letter-spacing:normal;line-height:normal;list-style:none;list-style-image:none;list-style-position:outside;list-style-type:disc;margin:0;margin-bottom:0;margin-left:0;margin-right:0;margin-top:0;max-height:none;max-width:none;min-height:0;min-width:0;opacity:1;orphans:0;outline:0;outline-color:invert;outline-style:none;outline-width:medium;overflow:visible;overflow-x:visible;overflow-y:visible;padding:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;page-break-after:auto;page-break-before:auto;page-break-inside:auto;perspective:none;perspective-origin:50% 50%;pointer-events:auto;position:static;quotes:"\\201C" "\\201D" "\\2018" "\\2019";right:auto;tab-size:8;table-layout:auto;text-align:inherit;text-align-last:auto;text-decoration:none;text-decoration-color:inherit;text-decoration-line:none;text-decoration-style:solid;text-indent:0;text-shadow:none;text-transform:none;top:auto;transform:none;transform-style:flat;transition:none;transition-delay:0s;transition-duration:0s;transition-property:none;transition-timing-function:ease;unicode-bidi:normal;vertical-align:baseline;visibility:visible;white-space:normal;widows:0;width:auto;word-spacing:normal;z-index:auto}.-walletlink-css-reset *{box-sizing:border-box;display:initial;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif;line-height:1}.-walletlink-css-reset [class*=container]{margin:0;padding:0}.-walletlink-css-reset style{display:none}`;
},{}],"../node_modules/walletlink/dist/lib/cssReset.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectCssReset = void 0;

const cssReset_css_1 = __importDefault(require("./cssReset-css"));

function injectCssReset() {
  const styleEl = document.createElement("style");
  styleEl.type = "text/css";
  styleEl.appendChild(document.createTextNode(cssReset_css_1.default));
  document.documentElement.appendChild(styleEl);
}

exports.injectCssReset = injectCssReset;
},{"./cssReset-css":"../node_modules/walletlink/dist/lib/cssReset-css.js"}],"../node_modules/preact/dist/preact.module.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Component = _;
exports.Fragment = d;
exports.cloneElement = B;
exports.createContext = D;
exports.h = exports.createElement = v;
exports.createRef = p;
exports.hydrate = q;
exports.options = exports.isValidElement = void 0;
exports.render = S;
exports.toChildArray = A;
var n,
    l,
    u,
    i,
    t,
    r,
    o,
    f,
    e = {},
    c = [],
    s = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
exports.isValidElement = i;
exports.options = l;

function a(n, l) {
  for (var u in l) n[u] = l[u];

  return n;
}

function h(n) {
  var l = n.parentNode;
  l && l.removeChild(n);
}

function v(l, u, i) {
  var t,
      r,
      o,
      f = {};

  for (o in u) "key" == o ? t = u[o] : "ref" == o ? r = u[o] : f[o] = u[o];

  if (arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : i), "function" == typeof l && null != l.defaultProps) for (o in l.defaultProps) void 0 === f[o] && (f[o] = l.defaultProps[o]);
  return y(l, f, t, r, null);
}

function y(n, i, t, r, o) {
  var f = {
    type: n,
    props: i,
    key: t,
    ref: r,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __d: void 0,
    __c: null,
    __h: null,
    constructor: void 0,
    __v: null == o ? ++u : o
  };
  return null == o && null != l.vnode && l.vnode(f), f;
}

function p() {
  return {
    current: null
  };
}

function d(n) {
  return n.children;
}

function _(n, l) {
  this.props = n, this.context = l;
}

function k(n, l) {
  if (null == l) return n.__ ? k(n.__, n.__.__k.indexOf(n) + 1) : null;

  for (var u; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) return u.__e;

  return "function" == typeof n.type ? k(n) : null;
}

function b(n) {
  var l, u;

  if (null != (n = n.__) && null != n.__c) {
    for (n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) {
      n.__e = n.__c.base = u.__e;
      break;
    }

    return b(n);
  }
}

function m(n) {
  (!n.__d && (n.__d = !0) && t.push(n) && !g.__r++ || o !== l.debounceRendering) && ((o = l.debounceRendering) || r)(g);
}

function g() {
  for (var n; g.__r = t.length;) n = t.sort(function (n, l) {
    return n.__v.__b - l.__v.__b;
  }), t = [], n.some(function (n) {
    var l, u, i, t, r, o;
    n.__d && (r = (t = (l = n).__v).__e, (o = l.__P) && (u = [], (i = a({}, t)).__v = t.__v + 1, j(o, t, i, l.__n, void 0 !== o.ownerSVGElement, null != t.__h ? [r] : null, u, null == r ? k(t) : r, t.__h), z(u, t), t.__e != r && b(t)));
  });
}

function w(n, l, u, i, t, r, o, f, s, a) {
  var h,
      v,
      p,
      _,
      b,
      m,
      g,
      w = i && i.__k || c,
      A = w.length;

  for (u.__k = [], h = 0; h < l.length; h++) if (null != (_ = u.__k[h] = null == (_ = l[h]) || "boolean" == typeof _ ? null : "string" == typeof _ || "number" == typeof _ || "bigint" == typeof _ ? y(null, _, null, null, _) : Array.isArray(_) ? y(d, {
    children: _
  }, null, null, null) : _.__b > 0 ? y(_.type, _.props, _.key, null, _.__v) : _)) {
    if (_.__ = u, _.__b = u.__b + 1, null === (p = w[h]) || p && _.key == p.key && _.type === p.type) w[h] = void 0;else for (v = 0; v < A; v++) {
      if ((p = w[v]) && _.key == p.key && _.type === p.type) {
        w[v] = void 0;
        break;
      }

      p = null;
    }
    j(n, _, p = p || e, t, r, o, f, s, a), b = _.__e, (v = _.ref) && p.ref != v && (g || (g = []), p.ref && g.push(p.ref, null, _), g.push(v, _.__c || b, _)), null != b ? (null == m && (m = b), "function" == typeof _.type && _.__k === p.__k ? _.__d = s = x(_, s, n) : s = P(n, _, p, w, b, s), "function" == typeof u.type && (u.__d = s)) : s && p.__e == s && s.parentNode != n && (s = k(p));
  }

  for (u.__e = m, h = A; h--;) null != w[h] && ("function" == typeof u.type && null != w[h].__e && w[h].__e == u.__d && (u.__d = k(i, h + 1)), N(w[h], w[h]));

  if (g) for (h = 0; h < g.length; h++) M(g[h], g[++h], g[++h]);
}

function x(n, l, u) {
  for (var i, t = n.__k, r = 0; t && r < t.length; r++) (i = t[r]) && (i.__ = n, l = "function" == typeof i.type ? x(i, l, u) : P(u, i, i, t, i.__e, l));

  return l;
}

function A(n, l) {
  return l = l || [], null == n || "boolean" == typeof n || (Array.isArray(n) ? n.some(function (n) {
    A(n, l);
  }) : l.push(n)), l;
}

function P(n, l, u, i, t, r) {
  var o, f, e;
  if (void 0 !== l.__d) o = l.__d, l.__d = void 0;else if (null == u || t != r || null == t.parentNode) n: if (null == r || r.parentNode !== n) n.appendChild(t), o = null;else {
    for (f = r, e = 0; (f = f.nextSibling) && e < i.length; e += 2) if (f == t) break n;

    n.insertBefore(t, r), o = r;
  }
  return void 0 !== o ? o : t.nextSibling;
}

function C(n, l, u, i, t) {
  var r;

  for (r in u) "children" === r || "key" === r || r in l || H(n, r, null, u[r], i);

  for (r in l) t && "function" != typeof l[r] || "children" === r || "key" === r || "value" === r || "checked" === r || u[r] === l[r] || H(n, r, l[r], u[r], i);
}

function $(n, l, u) {
  "-" === l[0] ? n.setProperty(l, u) : n[l] = null == u ? "" : "number" != typeof u || s.test(l) ? u : u + "px";
}

function H(n, l, u, i, t) {
  var r;

  n: if ("style" === l) {
    if ("string" == typeof u) n.style.cssText = u;else {
      if ("string" == typeof i && (n.style.cssText = i = ""), i) for (l in i) u && l in u || $(n.style, l, "");
      if (u) for (l in u) i && u[l] === i[l] || $(n.style, l, u[l]);
    }
  } else if ("o" === l[0] && "n" === l[1]) r = l !== (l = l.replace(/Capture$/, "")), l = l.toLowerCase() in n ? l.toLowerCase().slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + r] = u, u ? i || n.addEventListener(l, r ? T : I, r) : n.removeEventListener(l, r ? T : I, r);else if ("dangerouslySetInnerHTML" !== l) {
    if (t) l = l.replace(/xlink[H:h]/, "h").replace(/sName$/, "s");else if ("href" !== l && "list" !== l && "form" !== l && "tabIndex" !== l && "download" !== l && l in n) try {
      n[l] = null == u ? "" : u;
      break n;
    } catch (n) {}
    "function" == typeof u || (null != u && (!1 !== u || "a" === l[0] && "r" === l[1]) ? n.setAttribute(l, u) : n.removeAttribute(l));
  }
}

function I(n) {
  this.l[n.type + !1](l.event ? l.event(n) : n);
}

function T(n) {
  this.l[n.type + !0](l.event ? l.event(n) : n);
}

function j(n, u, i, t, r, o, f, e, c) {
  var s,
      h,
      v,
      y,
      p,
      k,
      b,
      m,
      g,
      x,
      A,
      P = u.type;
  if (void 0 !== u.constructor) return null;
  null != i.__h && (c = i.__h, e = u.__e = i.__e, u.__h = null, o = [e]), (s = l.__b) && s(u);

  try {
    n: if ("function" == typeof P) {
      if (m = u.props, g = (s = P.contextType) && t[s.__c], x = s ? g ? g.props.value : s.__ : t, i.__c ? b = (h = u.__c = i.__c).__ = h.__E : ("prototype" in P && P.prototype.render ? u.__c = h = new P(m, x) : (u.__c = h = new _(m, x), h.constructor = P, h.render = O), g && g.sub(h), h.props = m, h.state || (h.state = {}), h.context = x, h.__n = t, v = h.__d = !0, h.__h = []), null == h.__s && (h.__s = h.state), null != P.getDerivedStateFromProps && (h.__s == h.state && (h.__s = a({}, h.__s)), a(h.__s, P.getDerivedStateFromProps(m, h.__s))), y = h.props, p = h.state, v) null == P.getDerivedStateFromProps && null != h.componentWillMount && h.componentWillMount(), null != h.componentDidMount && h.__h.push(h.componentDidMount);else {
        if (null == P.getDerivedStateFromProps && m !== y && null != h.componentWillReceiveProps && h.componentWillReceiveProps(m, x), !h.__e && null != h.shouldComponentUpdate && !1 === h.shouldComponentUpdate(m, h.__s, x) || u.__v === i.__v) {
          h.props = m, h.state = h.__s, u.__v !== i.__v && (h.__d = !1), h.__v = u, u.__e = i.__e, u.__k = i.__k, u.__k.forEach(function (n) {
            n && (n.__ = u);
          }), h.__h.length && f.push(h);
          break n;
        }

        null != h.componentWillUpdate && h.componentWillUpdate(m, h.__s, x), null != h.componentDidUpdate && h.__h.push(function () {
          h.componentDidUpdate(y, p, k);
        });
      }
      h.context = x, h.props = m, h.state = h.__s, (s = l.__r) && s(u), h.__d = !1, h.__v = u, h.__P = n, s = h.render(h.props, h.state, h.context), h.state = h.__s, null != h.getChildContext && (t = a(a({}, t), h.getChildContext())), v || null == h.getSnapshotBeforeUpdate || (k = h.getSnapshotBeforeUpdate(y, p)), A = null != s && s.type === d && null == s.key ? s.props.children : s, w(n, Array.isArray(A) ? A : [A], u, i, t, r, o, f, e, c), h.base = u.__e, u.__h = null, h.__h.length && f.push(h), b && (h.__E = h.__ = null), h.__e = !1;
    } else null == o && u.__v === i.__v ? (u.__k = i.__k, u.__e = i.__e) : u.__e = L(i.__e, u, i, t, r, o, f, c);

    (s = l.diffed) && s(u);
  } catch (n) {
    u.__v = null, (c || null != o) && (u.__e = e, u.__h = !!c, o[o.indexOf(e)] = null), l.__e(n, u, i);
  }
}

function z(n, u) {
  l.__c && l.__c(u, n), n.some(function (u) {
    try {
      n = u.__h, u.__h = [], n.some(function (n) {
        n.call(u);
      });
    } catch (n) {
      l.__e(n, u.__v);
    }
  });
}

function L(l, u, i, t, r, o, f, c) {
  var s,
      a,
      v,
      y = i.props,
      p = u.props,
      d = u.type,
      _ = 0;
  if ("svg" === d && (r = !0), null != o) for (; _ < o.length; _++) if ((s = o[_]) && (s === l || (d ? s.localName == d : 3 == s.nodeType))) {
    l = s, o[_] = null;
    break;
  }

  if (null == l) {
    if (null === d) return document.createTextNode(p);
    l = r ? document.createElementNS("http://www.w3.org/2000/svg", d) : document.createElement(d, p.is && p), o = null, c = !1;
  }

  if (null === d) y === p || c && l.data === p || (l.data = p);else {
    if (o = o && n.call(l.childNodes), a = (y = i.props || e).dangerouslySetInnerHTML, v = p.dangerouslySetInnerHTML, !c) {
      if (null != o) for (y = {}, _ = 0; _ < l.attributes.length; _++) y[l.attributes[_].name] = l.attributes[_].value;
      (v || a) && (v && (a && v.__html == a.__html || v.__html === l.innerHTML) || (l.innerHTML = v && v.__html || ""));
    }

    if (C(l, p, y, r, c), v) u.__k = [];else if (_ = u.props.children, w(l, Array.isArray(_) ? _ : [_], u, i, t, r && "foreignObject" !== d, o, f, o ? o[0] : i.__k && k(i, 0), c), null != o) for (_ = o.length; _--;) null != o[_] && h(o[_]);
    c || ("value" in p && void 0 !== (_ = p.value) && (_ !== l.value || "progress" === d && !_) && H(l, "value", _, y.value, !1), "checked" in p && void 0 !== (_ = p.checked) && _ !== l.checked && H(l, "checked", _, y.checked, !1));
  }
  return l;
}

function M(n, u, i) {
  try {
    "function" == typeof n ? n(u) : n.current = u;
  } catch (n) {
    l.__e(n, i);
  }
}

function N(n, u, i) {
  var t, r;

  if (l.unmount && l.unmount(n), (t = n.ref) && (t.current && t.current !== n.__e || M(t, null, u)), null != (t = n.__c)) {
    if (t.componentWillUnmount) try {
      t.componentWillUnmount();
    } catch (n) {
      l.__e(n, u);
    }
    t.base = t.__P = null;
  }

  if (t = n.__k) for (r = 0; r < t.length; r++) t[r] && N(t[r], u, "function" != typeof n.type);
  i || null == n.__e || h(n.__e), n.__e = n.__d = void 0;
}

function O(n, l, u) {
  return this.constructor(n, u);
}

function S(u, i, t) {
  var r, o, f;
  l.__ && l.__(u, i), o = (r = "function" == typeof t) ? null : t && t.__k || i.__k, f = [], j(i, u = (!r && t || i).__k = v(d, null, [u]), o || e, e, void 0 !== i.ownerSVGElement, !r && t ? [t] : o ? null : i.firstChild ? n.call(i.childNodes) : null, f, !r && t ? t : o ? o.__e : i.firstChild, r), z(f, u);
}

function q(n, l) {
  S(n, l, q);
}

function B(l, u, i) {
  var t,
      r,
      o,
      f = a({}, l.props);

  for (o in u) "key" == o ? t = u[o] : "ref" == o ? r = u[o] : f[o] = u[o];

  return arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : i), y(l.type, f, t || l.key, r || l.ref, null);
}

function D(n, l) {
  var u = {
    __c: l = "__cC" + f++,
    __: n,
    Consumer: function (n, l) {
      return n.children(l);
    },
    Provider: function (n) {
      var u, i;
      return this.getChildContext || (u = [], (i = {})[l] = this, this.getChildContext = function () {
        return i;
      }, this.shouldComponentUpdate = function (n) {
        this.props.value !== n.value && u.some(m);
      }, this.sub = function (n) {
        u.push(n);
        var l = n.componentWillUnmount;

        n.componentWillUnmount = function () {
          u.splice(u.indexOf(n), 1), l && l.call(n);
        };
      }), n.children;
    }
  };
  return u.Provider.__ = u.Consumer.contextType = u;
}

n = c.slice, exports.options = l = {
  __e: function (n, l) {
    for (var u, i, t; l = l.__;) if ((u = l.__c) && !u.__) try {
      if ((i = u.constructor) && null != i.getDerivedStateFromError && (u.setState(i.getDerivedStateFromError(n)), t = u.__d), null != u.componentDidCatch && (u.componentDidCatch(n), t = u.__d), t) return u.__E = u;
    } catch (l) {
      n = l;
    }

    throw n;
  }
}, u = 0, exports.isValidElement = i = function (n) {
  return null != n && void 0 === n.constructor;
}, _.prototype.setState = function (n, l) {
  var u;
  u = null != this.__s && this.__s !== this.state ? this.__s : this.__s = a({}, this.state), "function" == typeof n && (n = n(a({}, u), this.props)), n && a(u, n), null != n && this.__v && (l && this.__h.push(l), m(this));
}, _.prototype.forceUpdate = function (n) {
  this.__v && (this.__e = !0, n && this.__h.push(n), m(this));
}, _.prototype.render = d, t = [], r = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, g.__r = 0, f = 0;
},{}],"../node_modules/clsx/dist/clsx.m.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function toVal(mix) {
  var k,
      y,
      str = '';

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (typeof mix === 'object') {
    if (Array.isArray(mix)) {
      for (k = 0; k < mix.length; k++) {
        if (mix[k]) {
          if (y = toVal(mix[k])) {
            str && (str += ' ');
            str += y;
          }
        }
      }
    } else {
      for (k in mix) {
        if (mix[k]) {
          str && (str += ' ');
          str += k;
        }
      }
    }
  }

  return str;
}

function _default() {
  var i = 0,
      tmp,
      x,
      str = '';

  while (i < arguments.length) {
    if (tmp = arguments[i++]) {
      if (x = toVal(tmp)) {
        str && (str += ' ');
        str += x;
      }
    }
  }

  return str;
}
},{}],"../node_modules/preact/hooks/dist/hooks.module.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useCallback = F;
exports.useContext = T;
exports.useDebugValue = d;
exports.useEffect = y;
exports.useErrorBoundary = q;
exports.useImperativeHandle = _;
exports.useLayoutEffect = h;
exports.useMemo = A;
exports.useReducer = p;
exports.useRef = s;
exports.useState = l;

var _preact = require("preact");

var t,
    u,
    r,
    o = 0,
    i = [],
    c = _preact.options.__b,
    f = _preact.options.__r,
    e = _preact.options.diffed,
    a = _preact.options.__c,
    v = _preact.options.unmount;

function m(t, r) {
  _preact.options.__h && _preact.options.__h(u, t, o || r), o = 0;
  var i = u.__H || (u.__H = {
    __: [],
    __h: []
  });
  return t >= i.__.length && i.__.push({}), i.__[t];
}

function l(n) {
  return o = 1, p(w, n);
}

function p(n, r, o) {
  var i = m(t++, 2);
  return i.t = n, i.__c || (i.__ = [o ? o(r) : w(void 0, r), function (n) {
    var t = i.t(i.__[0], n);
    i.__[0] !== t && (i.__ = [t, i.__[1]], i.__c.setState({}));
  }], i.__c = u), i.__;
}

function y(r, o) {
  var i = m(t++, 3);
  !_preact.options.__s && k(i.__H, o) && (i.__ = r, i.__H = o, u.__H.__h.push(i));
}

function h(r, o) {
  var i = m(t++, 4);
  !_preact.options.__s && k(i.__H, o) && (i.__ = r, i.__H = o, u.__h.push(i));
}

function s(n) {
  return o = 5, A(function () {
    return {
      current: n
    };
  }, []);
}

function _(n, t, u) {
  o = 6, h(function () {
    "function" == typeof n ? n(t()) : n && (n.current = t());
  }, null == u ? u : u.concat(n));
}

function A(n, u) {
  var r = m(t++, 7);
  return k(r.__H, u) && (r.__ = n(), r.__H = u, r.__h = n), r.__;
}

function F(n, t) {
  return o = 8, A(function () {
    return n;
  }, t);
}

function T(n) {
  var r = u.context[n.__c],
      o = m(t++, 9);
  return o.c = n, r ? (null == o.__ && (o.__ = !0, r.sub(u)), r.props.value) : n.__;
}

function d(t, u) {
  _preact.options.useDebugValue && _preact.options.useDebugValue(u ? u(t) : t);
}

function q(n) {
  var r = m(t++, 10),
      o = l();
  return r.__ = n, u.componentDidCatch || (u.componentDidCatch = function (n) {
    r.__ && r.__(n), o[1](n);
  }), [o[0], function () {
    o[1](void 0);
  }];
}

function x() {
  i.forEach(function (t) {
    if (t.__P) try {
      t.__H.__h.forEach(g), t.__H.__h.forEach(j), t.__H.__h = [];
    } catch (u) {
      t.__H.__h = [], _preact.options.__e(u, t.__v);
    }
  }), i = [];
}

_preact.options.__b = function (n) {
  u = null, c && c(n);
}, _preact.options.__r = function (n) {
  f && f(n), t = 0;
  var r = (u = n.__c).__H;
  r && (r.__h.forEach(g), r.__h.forEach(j), r.__h = []);
}, _preact.options.diffed = function (t) {
  e && e(t);
  var o = t.__c;
  o && o.__H && o.__H.__h.length && (1 !== i.push(o) && r === _preact.options.requestAnimationFrame || ((r = _preact.options.requestAnimationFrame) || function (n) {
    var t,
        u = function () {
      clearTimeout(r), b && cancelAnimationFrame(t), setTimeout(n);
    },
        r = setTimeout(u, 100);

    b && (t = requestAnimationFrame(u));
  })(x)), u = null;
}, _preact.options.__c = function (t, u) {
  u.some(function (t) {
    try {
      t.__h.forEach(g), t.__h = t.__h.filter(function (n) {
        return !n.__ || j(n);
      });
    } catch (r) {
      u.some(function (n) {
        n.__h && (n.__h = []);
      }), u = [], _preact.options.__e(r, t.__v);
    }
  }), a && a(t, u);
}, _preact.options.unmount = function (t) {
  v && v(t);
  var u = t.__c;
  if (u && u.__H) try {
    u.__H.__.forEach(g);
  } catch (t) {
    _preact.options.__e(t, u.__v);
  }
};
var b = "function" == typeof requestAnimationFrame;

function g(n) {
  var t = u;
  "function" == typeof n.__c && n.__c(), u = t;
}

function j(n) {
  var t = u;
  n.__c = n.__(), u = t;
}

function k(n, t) {
  return !n || n.length !== t.length || t.some(function (t, u) {
    return t !== n[u];
  });
}

function w(n, t) {
  return "function" == typeof t ? t(n) : t;
}
},{"preact":"../node_modules/preact/dist/preact.module.js"}],"../node_modules/walletlink/dist/components/LinkDialog-css.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `.-walletlink-css-reset .-walletlink-link-dialog{z-index:2147483647;position:fixed;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center}.-walletlink-css-reset .-walletlink-link-dialog-backdrop{z-index:2147483647;position:fixed;top:0;left:0;right:0;bottom:0;background-color:rgba(0,0,0,.33);transition:opacity .25s}.-walletlink-css-reset .-walletlink-link-dialog-backdrop-hidden{opacity:0}.-walletlink-css-reset .-walletlink-link-dialog-box{display:flex;position:relative;flex-direction:column;background-color:#f6f6f6;border-radius:16px;box-shadow:0px 16px 24px rgba(0,0,0,.1),0px 0px 8px rgba(0,0,0,.05);transform:scale(1);transition:opacity .25s,transform .25s;overflow:hidden}.-walletlink-css-reset .-walletlink-link-dialog-box-hidden{opacity:0;transform:scale(0.85)}.-walletlink-css-reset .-walletlink-link-dialog-box-content{padding:24px;text-align:center}.-walletlink-css-reset .-walletlink-link-dialog-box-content h3{display:block;margin-bottom:24px;text-align:left;text-transform:uppercase;font-size:22px;font-weight:bold;line-height:1.2;color:#000}.-walletlink-css-reset .-walletlink-link-dialog-box-content-qrcode{position:relative;display:block;margin-bottom:24px;background-color:#f6f6f6;padding:16px;border-radius:16px;box-shadow:4px 4px 8px rgba(0,0,0,.15),-8px -8px 8px #fff;overflow:hidden}.-walletlink-css-reset .-walletlink-link-dialog-box-content-qrcode-wrapper{display:block;width:232px;height:232px;padding:4px;border-radius:4px;background:#f4f4f4;margin-bottom:16px}.-walletlink-css-reset .-walletlink-link-dialog-box-content-qrcode-wrapper img{display:block;width:224px;height:224px}.-walletlink-css-reset .-walletlink-link-dialog-box-content-qrcode>p{display:block;color:gray;font-weight:bold;font-size:12px;text-align:center}.-walletlink-css-reset .-walletlink-link-dialog-box-content-qrcode-connecting{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(246,246,246,.98)}.-walletlink-css-reset .-walletlink-link-dialog-box-content-qrcode-connecting p{margin-top:16px;color:#333;font-size:12px;font-weight:bold}.-walletlink-css-reset .-walletlink-link-dialog-box-content a{text-align:center;cursor:pointer;transition:color .1s;font-size:14px}.-walletlink-css-reset .-walletlink-link-dialog-box-content a,.-walletlink-css-reset .-walletlink-link-dialog-box-content a:link,.-walletlink-css-reset .-walletlink-link-dialog-box-content a:visited{color:#999}.-walletlink-css-reset .-walletlink-link-dialog-box-content a:hover,.-walletlink-css-reset .-walletlink-link-dialog-box-content a:active{color:#666;text-decoration:underline}.-walletlink-css-reset .-walletlink-link-dialog-box-cancel{position:absolute;-webkit-appearance:none;display:flex;align-items:center;justify-content:center;top:24px;right:24px;width:24px;height:24px;border-radius:12px;background-color:#e7e7e7;cursor:pointer}.-walletlink-css-reset .-walletlink-link-dialog-box-cancel-x{position:relative;display:block}.-walletlink-css-reset .-walletlink-link-dialog-box-cancel-x::before,.-walletlink-css-reset .-walletlink-link-dialog-box-cancel-x::after{content:"";position:absolute;display:block;top:-1px;left:-7px;width:14px;height:2px;background-color:#999;transition:background-color .2s}.-walletlink-css-reset .-walletlink-link-dialog-box-cancel-x::before{transform:rotate(45deg)}.-walletlink-css-reset .-walletlink-link-dialog-box-cancel-x::after{transform:rotate(135deg)}.-walletlink-css-reset .-walletlink-link-dialog-box-cancel:hover .-walletlink-link-dialog-box-cancel-x-a,.-walletlink-css-reset .-walletlink-link-dialog-box-cancel:hover .-walletlink-link-dialog-box-cancel-x-b{background-color:#000}.-walletlink-css-reset .-walletlink-link-dialog-container{display:block}.-walletlink-css-reset .-walletlink-link-dialog-container-hidden{display:none}.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box{background-color:#2a2a2a}.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-content h3{color:#ccc}.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-content-qrcode{background-color:#2a2a2a;box-shadow:4px 4px 8px rgba(0,0,0,.5),-8px -8px 8px #343434}.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-content-qrcode>p{color:#999}.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-content-qrcode-connecting{background:rgba(42,42,42,.98)}.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-content-qrcode-connecting p{color:#ddd}.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-content a,.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-content a:link,.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-content a:visited{color:#888}.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-content a:hover,.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-content a:active{color:#aaa}.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-cancel{background-color:#333}.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-cancel-x::before,.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-cancel-x::after{background-color:#aaa}.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-cancel:hover .-walletlink-link-dialog-box-cancel-x::before,.-walletlink-css-reset .-walletlink-link-dialog-container-dark .-walletlink-link-dialog-box-cancel:hover .-walletlink-link-dialog-box-cancel-x::after{background-color:#eee}`;
},{}],"../node_modules/walletlink/dist/vendor-js/qrcode-svg/index.js":[function(require,module,exports) {
/**
 * @fileoverview
 * - modified davidshimjs/qrcodejs library for use in node.js
 * - Using the 'QRCode for Javascript library'
 * - Fixed dataset of 'QRCode for Javascript library' for support full-spec.
 * - this library has no dependencies.
 *
 * @version 0.9.1 (2016-02-12)
 * @author davidshimjs, papnkukn
 * @see <a href="http://www.d-project.com/" target="_blank">http://www.d-project.com/</a>
 * @see <a href="http://jeromeetienne.github.com/jquery-qrcode/" target="_blank">http://jeromeetienne.github.com/jquery-qrcode/</a>
 * @see <a href="https://github.com/davidshimjs/qrcodejs" target="_blank">https://github.com/davidshimjs/qrcodejs</a>
 */
//---------------------------------------------------------------------
// QRCode for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//   http://www.opensource.org/licenses/mit-license.php
//
// The word "QR Code" is registered trademark of
// DENSO WAVE INCORPORATED
//   http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------
function QR8bitByte(data) {
  this.mode = QRMode.MODE_8BIT_BYTE;
  this.data = data;
  this.parsedData = []; // Added to support UTF-8 Characters

  for (var i = 0, l = this.data.length; i < l; i++) {
    var byteArray = [];
    var code = this.data.charCodeAt(i);

    if (code > 0x10000) {
      byteArray[0] = 0xF0 | (code & 0x1C0000) >>> 18;
      byteArray[1] = 0x80 | (code & 0x3F000) >>> 12;
      byteArray[2] = 0x80 | (code & 0xFC0) >>> 6;
      byteArray[3] = 0x80 | code & 0x3F;
    } else if (code > 0x800) {
      byteArray[0] = 0xE0 | (code & 0xF000) >>> 12;
      byteArray[1] = 0x80 | (code & 0xFC0) >>> 6;
      byteArray[2] = 0x80 | code & 0x3F;
    } else if (code > 0x80) {
      byteArray[0] = 0xC0 | (code & 0x7C0) >>> 6;
      byteArray[1] = 0x80 | code & 0x3F;
    } else {
      byteArray[0] = code;
    }

    this.parsedData.push(byteArray);
  }

  this.parsedData = Array.prototype.concat.apply([], this.parsedData);

  if (this.parsedData.length != this.data.length) {
    this.parsedData.unshift(191);
    this.parsedData.unshift(187);
    this.parsedData.unshift(239);
  }
}

QR8bitByte.prototype = {
  getLength: function (buffer) {
    return this.parsedData.length;
  },
  write: function (buffer) {
    for (var i = 0, l = this.parsedData.length; i < l; i++) {
      buffer.put(this.parsedData[i], 8);
    }
  }
};

function QRCodeModel(typeNumber, errorCorrectLevel) {
  this.typeNumber = typeNumber;
  this.errorCorrectLevel = errorCorrectLevel;
  this.modules = null;
  this.moduleCount = 0;
  this.dataCache = null;
  this.dataList = [];
}

QRCodeModel.prototype = {
  addData: function (data) {
    var newData = new QR8bitByte(data);
    this.dataList.push(newData);
    this.dataCache = null;
  },
  isDark: function (row, col) {
    if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
      throw new Error(row + "," + col);
    }

    return this.modules[row][col];
  },
  getModuleCount: function () {
    return this.moduleCount;
  },
  make: function () {
    this.makeImpl(false, this.getBestMaskPattern());
  },
  makeImpl: function (test, maskPattern) {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = new Array(this.moduleCount);

    for (var row = 0; row < this.moduleCount; row++) {
      this.modules[row] = new Array(this.moduleCount);

      for (var col = 0; col < this.moduleCount; col++) {
        this.modules[row][col] = null;
      }
    }

    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);

    if (this.typeNumber >= 7) {
      this.setupTypeNumber(test);
    }

    if (this.dataCache == null) {
      this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
    }

    this.mapData(this.dataCache, maskPattern);
  },
  setupPositionProbePattern: function (row, col) {
    for (var r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;

      for (var c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;

        if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  },
  getBestMaskPattern: function () {
    var minLostPoint = 0;
    var pattern = 0;

    for (var i = 0; i < 8; i++) {
      this.makeImpl(true, i);
      var lostPoint = QRUtil.getLostPoint(this);

      if (i == 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = i;
      }
    }

    return pattern;
  },
  createMovieClip: function (target_mc, instance_name, depth) {
    var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
    var cs = 1;
    this.make();

    for (var row = 0; row < this.modules.length; row++) {
      var y = row * cs;

      for (var col = 0; col < this.modules[row].length; col++) {
        var x = col * cs;
        var dark = this.modules[row][col];

        if (dark) {
          qr_mc.beginFill(0, 100);
          qr_mc.moveTo(x, y);
          qr_mc.lineTo(x + cs, y);
          qr_mc.lineTo(x + cs, y + cs);
          qr_mc.lineTo(x, y + cs);
          qr_mc.endFill();
        }
      }
    }

    return qr_mc;
  },
  setupTimingPattern: function () {
    for (var r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] != null) {
        continue;
      }

      this.modules[r][6] = r % 2 == 0;
    }

    for (var c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] != null) {
        continue;
      }

      this.modules[6][c] = c % 2 == 0;
    }
  },
  setupPositionAdjustPattern: function () {
    var pos = QRUtil.getPatternPosition(this.typeNumber);

    for (var i = 0; i < pos.length; i++) {
      for (var j = 0; j < pos.length; j++) {
        var row = pos[i];
        var col = pos[j];

        if (this.modules[row][col] != null) {
          continue;
        }

        for (var r = -2; r <= 2; r++) {
          for (var c = -2; c <= 2; c++) {
            if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  },
  setupTypeNumber: function (test) {
    var bits = QRUtil.getBCHTypeNumber(this.typeNumber);

    for (var i = 0; i < 18; i++) {
      var mod = !test && (bits >> i & 1) == 1;
      this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
    }

    for (var i = 0; i < 18; i++) {
      var mod = !test && (bits >> i & 1) == 1;
      this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  },
  setupTypeInfo: function (test, maskPattern) {
    var data = this.errorCorrectLevel << 3 | maskPattern;
    var bits = QRUtil.getBCHTypeInfo(data);

    for (var i = 0; i < 15; i++) {
      var mod = !test && (bits >> i & 1) == 1;

      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }
    }

    for (var i = 0; i < 15; i++) {
      var mod = !test && (bits >> i & 1) == 1;

      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }

    this.modules[this.moduleCount - 8][8] = !test;
  },
  mapData: function (data, maskPattern) {
    var inc = -1;
    var row = this.moduleCount - 1;
    var bitIndex = 7;
    var byteIndex = 0;

    for (var col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col == 6) col--;

      while (true) {
        for (var c = 0; c < 2; c++) {
          if (this.modules[row][col - c] == null) {
            var dark = false;

            if (byteIndex < data.length) {
              dark = (data[byteIndex] >>> bitIndex & 1) == 1;
            }

            var mask = QRUtil.getMask(maskPattern, row, col - c);

            if (mask) {
              dark = !dark;
            }

            this.modules[row][col - c] = dark;
            bitIndex--;

            if (bitIndex == -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }

        row += inc;

        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }
};
QRCodeModel.PAD0 = 0xEC;
QRCodeModel.PAD1 = 0x11;

QRCodeModel.createData = function (typeNumber, errorCorrectLevel, dataList) {
  var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
  var buffer = new QRBitBuffer();

  for (var i = 0; i < dataList.length; i++) {
    var data = dataList[i];
    buffer.put(data.mode, 4);
    buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
    data.write(buffer);
  }

  var totalDataCount = 0;

  for (var i = 0; i < rsBlocks.length; i++) {
    totalDataCount += rsBlocks[i].dataCount;
  }

  if (buffer.getLengthInBits() > totalDataCount * 8) {
    throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")");
  }

  if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
    buffer.put(0, 4);
  }

  while (buffer.getLengthInBits() % 8 != 0) {
    buffer.putBit(false);
  }

  while (true) {
    if (buffer.getLengthInBits() >= totalDataCount * 8) {
      break;
    }

    buffer.put(QRCodeModel.PAD0, 8);

    if (buffer.getLengthInBits() >= totalDataCount * 8) {
      break;
    }

    buffer.put(QRCodeModel.PAD1, 8);
  }

  return QRCodeModel.createBytes(buffer, rsBlocks);
};

QRCodeModel.createBytes = function (buffer, rsBlocks) {
  var offset = 0;
  var maxDcCount = 0;
  var maxEcCount = 0;
  var dcdata = new Array(rsBlocks.length);
  var ecdata = new Array(rsBlocks.length);

  for (var r = 0; r < rsBlocks.length; r++) {
    var dcCount = rsBlocks[r].dataCount;
    var ecCount = rsBlocks[r].totalCount - dcCount;
    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);
    dcdata[r] = new Array(dcCount);

    for (var i = 0; i < dcdata[r].length; i++) {
      dcdata[r][i] = 0xff & buffer.buffer[i + offset];
    }

    offset += dcCount;
    var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
    var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
    var modPoly = rawPoly.mod(rsPoly);
    ecdata[r] = new Array(rsPoly.getLength() - 1);

    for (var i = 0; i < ecdata[r].length; i++) {
      var modIndex = i + modPoly.getLength() - ecdata[r].length;
      ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
    }
  }

  var totalCodeCount = 0;

  for (var i = 0; i < rsBlocks.length; i++) {
    totalCodeCount += rsBlocks[i].totalCount;
  }

  var data = new Array(totalCodeCount);
  var index = 0;

  for (var i = 0; i < maxDcCount; i++) {
    for (var r = 0; r < rsBlocks.length; r++) {
      if (i < dcdata[r].length) {
        data[index++] = dcdata[r][i];
      }
    }
  }

  for (var i = 0; i < maxEcCount; i++) {
    for (var r = 0; r < rsBlocks.length; r++) {
      if (i < ecdata[r].length) {
        data[index++] = ecdata[r][i];
      }
    }
  }

  return data;
};

var QRMode = {
  MODE_NUMBER: 1 << 0,
  MODE_ALPHA_NUM: 1 << 1,
  MODE_8BIT_BYTE: 1 << 2,
  MODE_KANJI: 1 << 3
};
var QRErrorCorrectLevel = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2
};
var QRMaskPattern = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7
};
var QRUtil = {
  PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],
  G15: 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0,
  G18: 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0,
  G15_MASK: 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1,
  getBCHTypeInfo: function (data) {
    var d = data << 10;

    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
      d ^= QRUtil.G15 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15);
    }

    return (data << 10 | d) ^ QRUtil.G15_MASK;
  },
  getBCHTypeNumber: function (data) {
    var d = data << 12;

    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
      d ^= QRUtil.G18 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18);
    }

    return data << 12 | d;
  },
  getBCHDigit: function (data) {
    var digit = 0;

    while (data != 0) {
      digit++;
      data >>>= 1;
    }

    return digit;
  },
  getPatternPosition: function (typeNumber) {
    return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
  },
  getMask: function (maskPattern, i, j) {
    switch (maskPattern) {
      case QRMaskPattern.PATTERN000:
        return (i + j) % 2 == 0;

      case QRMaskPattern.PATTERN001:
        return i % 2 == 0;

      case QRMaskPattern.PATTERN010:
        return j % 3 == 0;

      case QRMaskPattern.PATTERN011:
        return (i + j) % 3 == 0;

      case QRMaskPattern.PATTERN100:
        return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;

      case QRMaskPattern.PATTERN101:
        return i * j % 2 + i * j % 3 == 0;

      case QRMaskPattern.PATTERN110:
        return (i * j % 2 + i * j % 3) % 2 == 0;

      case QRMaskPattern.PATTERN111:
        return (i * j % 3 + (i + j) % 2) % 2 == 0;

      default:
        throw new Error("bad maskPattern:" + maskPattern);
    }
  },
  getErrorCorrectPolynomial: function (errorCorrectLength) {
    var a = new QRPolynomial([1], 0);

    for (var i = 0; i < errorCorrectLength; i++) {
      a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
    }

    return a;
  },
  getLengthInBits: function (mode, type) {
    if (1 <= type && type < 10) {
      switch (mode) {
        case QRMode.MODE_NUMBER:
          return 10;

        case QRMode.MODE_ALPHA_NUM:
          return 9;

        case QRMode.MODE_8BIT_BYTE:
          return 8;

        case QRMode.MODE_KANJI:
          return 8;

        default:
          throw new Error("mode:" + mode);
      }
    } else if (type < 27) {
      switch (mode) {
        case QRMode.MODE_NUMBER:
          return 12;

        case QRMode.MODE_ALPHA_NUM:
          return 11;

        case QRMode.MODE_8BIT_BYTE:
          return 16;

        case QRMode.MODE_KANJI:
          return 10;

        default:
          throw new Error("mode:" + mode);
      }
    } else if (type < 41) {
      switch (mode) {
        case QRMode.MODE_NUMBER:
          return 14;

        case QRMode.MODE_ALPHA_NUM:
          return 13;

        case QRMode.MODE_8BIT_BYTE:
          return 16;

        case QRMode.MODE_KANJI:
          return 12;

        default:
          throw new Error("mode:" + mode);
      }
    } else {
      throw new Error("type:" + type);
    }
  },
  getLostPoint: function (qrCode) {
    var moduleCount = qrCode.getModuleCount();
    var lostPoint = 0;

    for (var row = 0; row < moduleCount; row++) {
      for (var col = 0; col < moduleCount; col++) {
        var sameCount = 0;
        var dark = qrCode.isDark(row, col);

        for (var r = -1; r <= 1; r++) {
          if (row + r < 0 || moduleCount <= row + r) {
            continue;
          }

          for (var c = -1; c <= 1; c++) {
            if (col + c < 0 || moduleCount <= col + c) {
              continue;
            }

            if (r == 0 && c == 0) {
              continue;
            }

            if (dark == qrCode.isDark(row + r, col + c)) {
              sameCount++;
            }
          }
        }

        if (sameCount > 5) {
          lostPoint += 3 + sameCount - 5;
        }
      }
    }

    for (var row = 0; row < moduleCount - 1; row++) {
      for (var col = 0; col < moduleCount - 1; col++) {
        var count = 0;
        if (qrCode.isDark(row, col)) count++;
        if (qrCode.isDark(row + 1, col)) count++;
        if (qrCode.isDark(row, col + 1)) count++;
        if (qrCode.isDark(row + 1, col + 1)) count++;

        if (count == 0 || count == 4) {
          lostPoint += 3;
        }
      }
    }

    for (var row = 0; row < moduleCount; row++) {
      for (var col = 0; col < moduleCount - 6; col++) {
        if (qrCode.isDark(row, col) && !qrCode.isDark(row, col + 1) && qrCode.isDark(row, col + 2) && qrCode.isDark(row, col + 3) && qrCode.isDark(row, col + 4) && !qrCode.isDark(row, col + 5) && qrCode.isDark(row, col + 6)) {
          lostPoint += 40;
        }
      }
    }

    for (var col = 0; col < moduleCount; col++) {
      for (var row = 0; row < moduleCount - 6; row++) {
        if (qrCode.isDark(row, col) && !qrCode.isDark(row + 1, col) && qrCode.isDark(row + 2, col) && qrCode.isDark(row + 3, col) && qrCode.isDark(row + 4, col) && !qrCode.isDark(row + 5, col) && qrCode.isDark(row + 6, col)) {
          lostPoint += 40;
        }
      }
    }

    var darkCount = 0;

    for (var col = 0; col < moduleCount; col++) {
      for (var row = 0; row < moduleCount; row++) {
        if (qrCode.isDark(row, col)) {
          darkCount++;
        }
      }
    }

    var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
    lostPoint += ratio * 10;
    return lostPoint;
  }
};
var QRMath = {
  glog: function (n) {
    if (n < 1) {
      throw new Error("glog(" + n + ")");
    }

    return QRMath.LOG_TABLE[n];
  },
  gexp: function (n) {
    while (n < 0) {
      n += 255;
    }

    while (n >= 256) {
      n -= 255;
    }

    return QRMath.EXP_TABLE[n];
  },
  EXP_TABLE: new Array(256),
  LOG_TABLE: new Array(256)
};

for (var i = 0; i < 8; i++) {
  QRMath.EXP_TABLE[i] = 1 << i;
}

for (var i = 8; i < 256; i++) {
  QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
}

for (var i = 0; i < 255; i++) {
  QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
}

function QRPolynomial(num, shift) {
  if (num.length == undefined) {
    throw new Error(num.length + "/" + shift);
  }

  var offset = 0;

  while (offset < num.length && num[offset] == 0) {
    offset++;
  }

  this.num = new Array(num.length - offset + shift);

  for (var i = 0; i < num.length - offset; i++) {
    this.num[i] = num[i + offset];
  }
}

QRPolynomial.prototype = {
  get: function (index) {
    return this.num[index];
  },
  getLength: function () {
    return this.num.length;
  },
  multiply: function (e) {
    var num = new Array(this.getLength() + e.getLength() - 1);

    for (var i = 0; i < this.getLength(); i++) {
      for (var j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
      }
    }

    return new QRPolynomial(num, 0);
  },
  mod: function (e) {
    if (this.getLength() - e.getLength() < 0) {
      return this;
    }

    var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
    var num = new Array(this.getLength());

    for (var i = 0; i < this.getLength(); i++) {
      num[i] = this.get(i);
    }

    for (var i = 0; i < e.getLength(); i++) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
    }

    return new QRPolynomial(num, 0).mod(e);
  }
};

function QRRSBlock(totalCount, dataCount) {
  this.totalCount = totalCount;
  this.dataCount = dataCount;
}

QRRSBlock.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];

QRRSBlock.getRSBlocks = function (typeNumber, errorCorrectLevel) {
  var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);

  if (rsBlock == undefined) {
    throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
  }

  var length = rsBlock.length / 3;
  var list = [];

  for (var i = 0; i < length; i++) {
    var count = rsBlock[i * 3 + 0];
    var totalCount = rsBlock[i * 3 + 1];
    var dataCount = rsBlock[i * 3 + 2];

    for (var j = 0; j < count; j++) {
      list.push(new QRRSBlock(totalCount, dataCount));
    }
  }

  return list;
};

QRRSBlock.getRsBlockTable = function (typeNumber, errorCorrectLevel) {
  switch (errorCorrectLevel) {
    case QRErrorCorrectLevel.L:
      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];

    case QRErrorCorrectLevel.M:
      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];

    case QRErrorCorrectLevel.Q:
      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];

    case QRErrorCorrectLevel.H:
      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];

    default:
      return undefined;
  }
};

function QRBitBuffer() {
  this.buffer = [];
  this.length = 0;
}

QRBitBuffer.prototype = {
  get: function (index) {
    var bufIndex = Math.floor(index / 8);
    return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
  },
  put: function (num, length) {
    for (var i = 0; i < length; i++) {
      this.putBit((num >>> length - i - 1 & 1) == 1);
    }
  },
  getLengthInBits: function () {
    return this.length;
  },
  putBit: function (bit) {
    var bufIndex = Math.floor(this.length / 8);

    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }

    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> this.length % 8;
    }

    this.length++;
  }
};
var QRCodeLimitLength = [[17, 14, 11, 7], [32, 26, 20, 14], [53, 42, 32, 24], [78, 62, 46, 34], [106, 84, 60, 44], [134, 106, 74, 58], [154, 122, 86, 64], [192, 152, 108, 84], [230, 180, 130, 98], [271, 213, 151, 119], [321, 251, 177, 137], [367, 287, 203, 155], [425, 331, 241, 177], [458, 362, 258, 194], [520, 412, 292, 220], [586, 450, 322, 250], [644, 504, 364, 280], [718, 560, 394, 310], [792, 624, 442, 338], [858, 666, 482, 382], [929, 711, 509, 403], [1003, 779, 565, 439], [1091, 857, 611, 461], [1171, 911, 661, 511], [1273, 997, 715, 535], [1367, 1059, 751, 593], [1465, 1125, 805, 625], [1528, 1190, 868, 658], [1628, 1264, 908, 698], [1732, 1370, 982, 742], [1840, 1452, 1030, 790], [1952, 1538, 1112, 842], [2068, 1628, 1168, 898], [2188, 1722, 1228, 958], [2303, 1809, 1283, 983], [2431, 1911, 1351, 1051], [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219], [2953, 2331, 1663, 1273]];
/** Constructor */

function QRCode(options) {
  var instance = this; //Default options

  this.options = {
    padding: 4,
    width: 256,
    height: 256,
    typeNumber: 4,
    color: "#000000",
    background: "#ffffff",
    ecl: "M",
    image: {
      svg: "",
      width: 0,
      height: 0
    }
  }; //In case the options is string

  if (typeof options === 'string') {
    options = {
      content: options
    };
  } //Merge options


  if (options) {
    for (var i in options) {
      this.options[i] = options[i];
    }
  }

  if (typeof this.options.content !== 'string') {
    throw new Error("Expected 'content' as string!");
  }

  if (this.options.content.length === 0
  /* || this.options.content.length > 7089 */
  ) {
    throw new Error("Expected 'content' to be non-empty!");
  }

  if (!(this.options.padding >= 0)) {
    throw new Error("Expected 'padding' value to be non-negative!");
  }

  if (!(this.options.width > 0) || !(this.options.height > 0)) {
    throw new Error("Expected 'width' or 'height' value to be higher than zero!");
  } //Gets the error correction level


  function _getErrorCorrectLevel(ecl) {
    switch (ecl) {
      case "L":
        return QRErrorCorrectLevel.L;

      case "M":
        return QRErrorCorrectLevel.M;

      case "Q":
        return QRErrorCorrectLevel.Q;

      case "H":
        return QRErrorCorrectLevel.H;

      default:
        throw new Error("Unknwon error correction level: " + ecl);
    }
  } //Get type number


  function _getTypeNumber(content, ecl) {
    var length = _getUTF8Length(content);

    var type = 1;
    var limit = 0;

    for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
      var table = QRCodeLimitLength[i];

      if (!table) {
        throw new Error("Content too long: expected " + limit + " but got " + length);
      }

      switch (ecl) {
        case "L":
          limit = table[0];
          break;

        case "M":
          limit = table[1];
          break;

        case "Q":
          limit = table[2];
          break;

        case "H":
          limit = table[3];
          break;

        default:
          throw new Error("Unknwon error correction level: " + ecl);
      }

      if (length <= limit) {
        break;
      }

      type++;
    }

    if (type > QRCodeLimitLength.length) {
      throw new Error("Content too long");
    }

    return type;
  } //Gets text length


  function _getUTF8Length(content) {
    var result = encodeURI(content).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
    return result.length + (result.length != content ? 3 : 0);
  } //Generate QR Code matrix


  var content = this.options.content;

  var type = _getTypeNumber(content, this.options.ecl);

  var ecl = _getErrorCorrectLevel(this.options.ecl);

  this.qrcode = new QRCodeModel(type, ecl);
  this.qrcode.addData(content);
  this.qrcode.make();
}
/** Generates QR Code as SVG image */


QRCode.prototype.svg = function (opt) {
  var options = this.options || {};
  var modules = this.qrcode.modules;

  if (typeof opt == "undefined") {
    opt = {
      container: options.container || "svg"
    };
  } //Apply new lines and indents in SVG?


  var pretty = typeof options.pretty != "undefined" ? !!options.pretty : true;
  var indent = pretty ? '  ' : '';
  var EOL = pretty ? '\r\n' : '';
  var width = options.width;
  var height = options.height;
  var length = modules.length;
  var xsize = width / (length + 2 * options.padding);
  var ysize = height / (length + 2 * options.padding); //Join (union, merge) rectangles into one shape?

  var join = typeof options.join != "undefined" ? !!options.join : false; //Swap the X and Y modules, pull request #2

  var swap = typeof options.swap != "undefined" ? !!options.swap : false; //Apply <?xml...?> declaration in SVG?

  var xmlDeclaration = typeof options.xmlDeclaration != "undefined" ? !!options.xmlDeclaration : true; //Populate with predefined shape instead of "rect" elements, thanks to @kkocdko

  var predefined = typeof options.predefined != "undefined" ? !!options.predefined : false;
  var defs = predefined ? indent + '<defs><path id="qrmodule" d="M0 0 h' + ysize + ' v' + xsize + ' H0 z" style="fill:' + options.color + ';shape-rendering:crispEdges;" /></defs>' + EOL : ''; //Background rectangle

  var bgrect = indent + '<rect x="0" y="0" width="' + width + '" height="' + height + '" style="fill:' + options.background + ';shape-rendering:crispEdges;"/>' + EOL; //Rectangles representing modules

  var modrect = '';
  var pathdata = '';

  for (var y = 0; y < length; y++) {
    for (var x = 0; x < length; x++) {
      var module = modules[x][y];

      if (module) {
        var px = x * xsize + options.padding * xsize;
        var py = y * ysize + options.padding * ysize; //Some users have had issues with the QR Code, thanks to @danioso for the solution

        if (swap) {
          var t = px;
          px = py;
          py = t;
        }

        if (join) {
          //Module as a part of svg path data, thanks to @danioso
          var w = xsize + px;
          var h = ysize + py;
          px = Number.isInteger(px) ? Number(px) : px.toFixed(2);
          py = Number.isInteger(py) ? Number(py) : py.toFixed(2);
          w = Number.isInteger(w) ? Number(w) : w.toFixed(2);
          h = Number.isInteger(h) ? Number(h) : h.toFixed(2);
          pathdata += 'M' + px + ',' + py + ' V' + h + ' H' + w + ' V' + py + ' H' + px + ' Z ';
        } else if (predefined) {
          //Module as a predefined shape, thanks to @kkocdko
          modrect += indent + '<use x="' + px.toString() + '" y="' + py.toString() + '" href="#qrmodule" />' + EOL;
        } else {
          //Module as rectangle element
          modrect += indent + '<rect x="' + px.toString() + '" y="' + py.toString() + '" width="' + xsize + '" height="' + ysize + '" style="fill:' + options.color + ';shape-rendering:crispEdges;"/>' + EOL;
        }
      }
    }
  }

  if (join) {
    modrect = indent + '<path x="0" y="0" style="fill:' + options.color + ';shape-rendering:crispEdges;" d="' + pathdata + '" />';
  }

  let imgSvg = "";

  if (this.options.image !== undefined && this.options.image.svg) {
    const imgWidth = width * this.options.image.width / 100;
    const imgHeight = height * this.options.image.height / 100;
    const imgX = width / 2 - imgWidth / 2;
    const imgY = height / 2 - imgHeight / 2;
    imgSvg += `<svg x="${imgX}" y="${imgY}" width="${imgWidth}" height="${imgHeight}" viewBox="0 0 100 100" preserveAspectRatio="xMinYMin meet">`;
    imgSvg += this.options.image.svg + EOL;
    imgSvg += '</svg>';
  }

  var svg = "";

  switch (opt.container) {
    //Wrapped in SVG document
    case "svg":
      if (xmlDeclaration) {
        svg += '<?xml version="1.0" standalone="yes"?>' + EOL;
      }

      svg += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '">' + EOL;
      svg += defs + bgrect + modrect;
      svg += imgSvg;
      svg += '</svg>';
      break;
    //Viewbox for responsive use in a browser, thanks to @danioso

    case "svg-viewbox":
      if (xmlDeclaration) {
        svg += '<?xml version="1.0" standalone="yes"?>' + EOL;
      }

      svg += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ' + width + ' ' + height + '">' + EOL;
      svg += defs + bgrect + modrect;
      svg += imgSvg;
      svg += '</svg>';
      break;
    //Wrapped in group element

    case "g":
      svg += '<g width="' + width + '" height="' + height + '">' + EOL;
      svg += defs + bgrect + modrect;
      svg += imgSvg;
      svg += '</g>';
      break;
    //Without a container

    default:
      svg += (defs + bgrect + modrect + imgSvg).replace(/^\s+/, ""); //Clear indents on each line

      break;
  }

  return svg;
};

module.exports = QRCode;
},{}],"../node_modules/walletlink/dist/components/QRCode.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QRCode = void 0;

const preact_1 = require("preact");

const hooks_1 = require("preact/hooks");

const qrcode_svg_1 = __importDefault(require("../vendor-js/qrcode-svg"));

const QRCode = props => {
  const [svg, setSvg] = hooks_1.useState("");
  hooks_1.useEffect(() => {
    var _a, _b;

    const qrcode = new qrcode_svg_1.default({
      content: props.content,
      background: props.bgColor || "#ffffff",
      color: props.fgColor || "#000000",
      container: "svg",
      ecl: "M",
      width: (_a = props.width) !== null && _a !== void 0 ? _a : 256,
      height: (_b = props.height) !== null && _b !== void 0 ? _b : 256,
      padding: 0,
      image: props.image
    });
    const base64 = Buffer.from(qrcode.svg(), "utf8").toString("base64");
    setSvg(`data:image/svg+xml;base64,${base64}`);
  });
  return svg ? preact_1.h("img", {
    src: svg,
    alt: "QR Code"
  }) : null;
};

exports.QRCode = QRCode;
},{"preact":"../node_modules/preact/dist/preact.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","../vendor-js/qrcode-svg":"../node_modules/walletlink/dist/vendor-js/qrcode-svg/index.js","buffer":"../node_modules/node-libs-browser/node_modules/buffer/index.js"}],"../node_modules/walletlink/dist/components/Spinner-css.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `.-walletlink-css-reset .-walletlink-spinner{display:inline-block}.-walletlink-css-reset .-walletlink-spinner svg{display:inline-block;animation:2s linear infinite -walletlink-spinner-svg}.-walletlink-css-reset .-walletlink-spinner svg circle{animation:1.9s ease-in-out infinite both -walletlink-spinner-circle;display:block;fill:transparent;stroke-dasharray:283;stroke-dashoffset:280;stroke-linecap:round;stroke-width:10px;transform-origin:50% 50%}@keyframes -walletlink-spinner-svg{0%{transform:rotateZ(0deg)}100%{transform:rotateZ(360deg)}}@keyframes -walletlink-spinner-circle{0%,25%{stroke-dashoffset:280;transform:rotate(0)}50%,75%{stroke-dashoffset:75;transform:rotate(45deg)}100%{stroke-dashoffset:280;transform:rotate(360deg)}}`;
},{}],"../node_modules/walletlink/dist/components/Spinner.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Spinner = void 0;

const preact_1 = require("preact");

const Spinner_css_1 = __importDefault(require("./Spinner-css"));

const Spinner = props => {
  var _a;

  const size = (_a = props.size) !== null && _a !== void 0 ? _a : 64;
  const color = props.color || "#000";
  return preact_1.h("div", {
    class: "-walletlink-spinner"
  }, preact_1.h("style", null, Spinner_css_1.default), preact_1.h("svg", {
    viewBox: "0 0 100 100",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      width: size,
      height: size
    }
  }, preact_1.h("circle", {
    style: {
      cx: 50,
      cy: 50,
      r: 45,
      stroke: color
    }
  })));
};

exports.Spinner = Spinner;
},{"preact":"../node_modules/preact/dist/preact.module.js","./Spinner-css":"../node_modules/walletlink/dist/components/Spinner-css.js"}],"../node_modules/walletlink/dist/components/LinkDialog.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinkDialog = void 0;

const clsx_1 = __importDefault(require("clsx"));

const preact_1 = require("preact");

const hooks_1 = require("preact/hooks");

const LinkDialog_css_1 = __importDefault(require("./LinkDialog-css"));

const QRCode_1 = require("./QRCode");

const Spinner_1 = require("./Spinner");

const LinkDialog = props => {
  const [isContainerHidden, setContainerHidden] = hooks_1.useState(!props.isOpen);
  const [isDialogHidden, setDialogHidden] = hooks_1.useState(!props.isOpen);
  hooks_1.useEffect(() => {
    const {
      isOpen
    } = props;
    const timers = [window.setTimeout(() => {
      setDialogHidden(!isOpen);
    }, 10)];

    if (isOpen) {
      setContainerHidden(false);
    } else {
      timers.push(window.setTimeout(() => {
        setContainerHidden(true);
      }, 360));
    }

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [props.isOpen]);
  return preact_1.h("div", {
    class: clsx_1.default("-walletlink-link-dialog-container", props.darkMode && "-walletlink-link-dialog-container-dark", isContainerHidden && "-walletlink-link-dialog-container-hidden")
  }, preact_1.h("style", null, LinkDialog_css_1.default), preact_1.h("div", {
    class: clsx_1.default("-walletlink-link-dialog-backdrop", isDialogHidden && "-walletlink-link-dialog-backdrop-hidden")
  }), preact_1.h("div", {
    class: "-walletlink-link-dialog"
  }, preact_1.h("div", {
    class: clsx_1.default("-walletlink-link-dialog-box", isDialogHidden && "-walletlink-link-dialog-box-hidden")
  }, preact_1.h(ScanQRCode, {
    darkMode: props.darkMode,
    version: props.version,
    sessionId: props.sessionId,
    sessionSecret: props.sessionSecret,
    walletLinkUrl: props.walletLinkUrl,
    isConnected: props.isConnected,
    isParentConnection: props.isParentConnection
  }), props.onCancel && preact_1.h(CancelButton, {
    onClick: props.onCancel
  }))));
};

exports.LinkDialog = LinkDialog;

const ScanQRCode = props => {
  const serverUrl = window.encodeURIComponent(props.walletLinkUrl);
  const sessionIdKey = props.isParentConnection ? "parent-id" : "id";
  const qrUrl = `${props.walletLinkUrl}/#/link?${sessionIdKey}=${props.sessionId}&secret=${props.sessionSecret}&server=${serverUrl}&v=1`;
  return preact_1.h("div", {
    class: "-walletlink-link-dialog-box-content"
  }, preact_1.h("h3", null, "Scan to", preact_1.h("br", null), " Connect"), preact_1.h("div", {
    class: "-walletlink-link-dialog-box-content-qrcode"
  }, preact_1.h("div", {
    class: "-walletlink-link-dialog-box-content-qrcode-wrapper"
  }, preact_1.h(QRCode_1.QRCode, {
    content: qrUrl,
    width: 224,
    height: 224,
    fgColor: "#000",
    bgColor: "transparent"
  })), preact_1.h("input", {
    type: "hidden",
    value: qrUrl
  }), !props.isConnected && preact_1.h("div", {
    class: "-walletlink-link-dialog-box-content-qrcode-connecting"
  }, preact_1.h(Spinner_1.Spinner, {
    size: 128,
    color: props.darkMode ? "#fff" : "#000"
  }), preact_1.h("p", null, "Connecting...")), preact_1.h("p", {
    title: `WalletLink v${props.version}`
  }, "Powered by WalletLink")), preact_1.h("a", {
    href: `${props.walletLinkUrl}/#/wallets`,
    target: "_blank",
    rel: "noopener"
  }, "Don\u2019t have a wallet app?"));
};

const CancelButton = props => preact_1.h("button", {
  class: "-walletlink-link-dialog-box-cancel",
  onClick: props.onClick
}, preact_1.h("div", {
  class: "-walletlink-link-dialog-box-cancel-x"
}));
},{"clsx":"../node_modules/clsx/dist/clsx.m.js","preact":"../node_modules/preact/dist/preact.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","./LinkDialog-css":"../node_modules/walletlink/dist/components/LinkDialog-css.js","./QRCode":"../node_modules/walletlink/dist/components/QRCode.js","./Spinner":"../node_modules/walletlink/dist/components/Spinner.js"}],"../node_modules/walletlink/dist/components/TryExtensionLinkDialog-css.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `.-walletlink-css-reset .-walletlink-extension-dialog{z-index:2147483647;position:fixed;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center}.-walletlink-css-reset .-walletlink-extension-dialog-backdrop{z-index:2147483647;position:fixed;top:0;left:0;right:0;bottom:0;background-color:rgba(0,0,0,.5);transition:opacity .25s}.-walletlink-css-reset .-walletlink-extension-dialog-backdrop-hidden{opacity:0}.-walletlink-css-reset .-walletlink-extension-dialog-box{display:flex;position:relative;max-width:500px;flex-direction:column;transform:scale(1);transition:opacity .25s,transform .25s}.-walletlink-css-reset .-walletlink-extension-dialog-box-hidden{opacity:0;transform:scale(0.85)}.-walletlink-css-reset .-walletlink-extension-dialog-box-top{display:flex;flex-direction:row;background-color:#fff;border-radius:8px;overflow:hidden;min-height:300px}.-walletlink-css-reset .-walletlink-extension-dialog-box-top-install-region{display:flex;flex-basis:50%;flex-direction:column;justify-content:center;padding:32px}.-walletlink-css-reset .-walletlink-extension-dialog-box-top-install-region button{display:block;border-radius:8px;background-color:#1652f0;color:#fff;width:90%;min-width:fit-content;height:44px;margin-top:16px;font-size:16px;padding-left:16px;padding-right:16px;cursor:pointer;font-weight:500;text-align:center}.-walletlink-css-reset .-walletlink-extension-dialog-box-top-info-region{display:flex;flex-basis:50%;flex-direction:column;justify-content:center;background-color:#fafbfc}.-walletlink-css-reset .-walletlink-extension-dialog-box-top-description{display:flex;flex-direction:row;align-items:center;padding-top:14px;padding-bottom:14px;padding-left:24px;padding-right:32px}.-walletlink-css-reset .-walletlink-extension-dialog-box-top-description-icon-wrapper{display:block;position:relative;width:40px;height:40px;flex-shrink:0;flex-grow:0;border-radius:20px;background-color:#fff;box-shadow:0px 0px 8px rgba(0,0,0,.04),0px 16px 24px rgba(0,0,0,.06)}.-walletlink-css-reset .-walletlink-extension-dialog-box-top-description-icon-wrapper img{position:absolute;top:0;bottom:0;left:0;right:0;margin:auto}.-walletlink-css-reset .-walletlink-extension-dialog-box-top-description-text{margin-left:16px;flex-grow:1;font-size:13px;line-height:19px;color:#000;align-self:center}.-walletlink-css-reset .-walletlink-extension-dialog-box-bottom{display:flex;flex-direction:row;overflow:hidden;border-radius:8px;background-color:#fff;margin-top:8px}.-walletlink-css-reset .-walletlink-extension-dialog-box-bottom-description-region{display:flex;flex-direction:column;justify-content:center;padding:32px;flex-grow:1}.-walletlink-css-reset .-walletlink-extension-dialog-box-bottom-description{font-size:13px;line-height:19px;margin-top:12px;color:#aaa}.-walletlink-css-reset .-walletlink-extension-dialog-box-bottom-description a{font-size:inherit;line-height:inherit;color:#1652f0;cursor:pointer}.-walletlink-css-reset .-walletlink-extension-dialog-box-bottom-qr-region{position:relative;flex-shrink:0;display:flex;flex-direction:column;justify-content:center;padding-left:24px;padding-right:24px;padding-top:16px;padding-bottom:16px}.-walletlink-css-reset .-walletlink-extension-dialog-box-bottom-qr-wrapper{position:relative;display:block;padding:8px;border-radius:8px;box-shadow:0px 4px 12px rgba(0,0,0,.1)}.-walletlink-css-reset .-walletlink-extension-dialog-box-bottom-qr-wrapper img{display:block}.-walletlink-css-reset .-walletlink-extension-dialog-box-bottom-qr-connecting{position:absolute;top:0;bottom:0;left:0;right:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background-color:rgba(255,255,255,.95)}.-walletlink-css-reset .-walletlink-extension-dialog-box-bottom-qr-connecting>p{font-size:12px;font-weight:bold;color:#000;margin-top:16px}.-walletlink-css-reset .-walletlink-extension-dialog-box-cancel{position:absolute;-webkit-appearance:none;display:flex;align-items:center;justify-content:center;top:16px;right:16px;width:24px;height:24px;border-radius:12px;background-color:#fafbfc;cursor:pointer}.-walletlink-css-reset .-walletlink-extension-dialog-box-cancel-x{position:relative;display:block;cursor:pointer}.-walletlink-css-reset .-walletlink-extension-dialog-box-cancel-x::before,.-walletlink-css-reset .-walletlink-extension-dialog-box-cancel-x::after{content:"";position:absolute;display:block;top:-1px;left:-7px;width:14px;height:1px;background-color:#000;transition:background-color .2s}.-walletlink-css-reset .-walletlink-extension-dialog-box-cancel-x::before{transform:rotate(45deg)}.-walletlink-css-reset .-walletlink-extension-dialog-box-cancel-x::after{transform:rotate(135deg)}.-walletlink-css-reset .-walletlink-extension-dialog-box-cancel:hover .-walletlink-link-dialog-box-cancel-x-a,.-walletlink-css-reset .-walletlink-extension-dialog-box-cancel:hover .-walletlink-link-dialog-box-cancel-x-b{background-color:#000}.-walletlink-css-reset .-walletlink-extension-dialog-container{display:block}.-walletlink-css-reset .-walletlink-extension-dialog-container-hidden{display:none}.-walletlink-css-reset .-walletlink-extension-dialog h2{display:block;text-align:left;font-size:22px;font-weight:600;line-height:28px;color:#000}`;
},{}],"../node_modules/walletlink/dist/components/icons/link-icon-svg.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTciIGhlaWdodD0iMTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE1LjYzNSAyLjExN2EzLjg4OSAzLjg4OSAwIDAwLTUuNTIxIDBMNi44OSA1LjMzNWEzLjg5NCAzLjg5NCAwIDAwLTEuMDkgMy40MDRjLjA4My41MDYuMjY4IDEuMDExLjU1MyAxLjQ2Ni4xNTEuMjUzLjMzNi40NzIuNTM3LjY5MWwuNjIxLjYyNCAxLjE0MS0xLjE0Ni0uNjItLjYyNGEyLjEwNSAyLjEwNSAwIDAxLS40ODctLjc0MSAyLjM0IDIuMzQgMCAwMS41MDMtMi41MWwzLjIwNi0zLjIyYTIuMjkzIDIuMjkzIDAgMDEzLjIzOSAwYy44OS44OTQuODkgMi4zNDMgMCAzLjI1M2wtMS41MjcgMS41MzNjLjIzNC42NC4zMzUgMS4zMzEuMzAyIDIuMDA1bDIuMzgzLTIuMzkyYzEuNTEtMS41MzQgMS40OTMtNC4wMjgtLjAxNy01LjU2MXoiIGZpbGw9IiMxNjUyRjAiLz48cGF0aCBkPSJNMTEuMjcxIDcuNzQ1YTMuMTMgMy4xMyAwIDAwLS41NTQtLjY5bC0uNjItLjYyNC0xLjE0MiAxLjE0Ni42MjEuNjIzYy4yMTguMjIuMzg2LjQ4OS40ODcuNzU4LjMzNS44MjYuMTY3IDEuODItLjUwNCAyLjQ5NGwtMy4yMDUgMy4yMTlhMi4yOTMgMi4yOTMgMCAwMS0zLjI0IDAgMi4zMTYgMi4zMTYgMCAwMTAtMy4yNTJsMS41MjgtMS41MzRhNC44MTUgNC44MTUgMCAwMS0uMjg1LTIuMDA1bC0yLjM4MyAyLjM5M2EzLjkyNyAzLjkyNyAwIDAwMCA1LjU0NCAzLjkwOSAzLjkwOSAwIDAwNS41MzggMGwzLjIwNS0zLjIxOWEzLjk1OCAzLjk1OCAwIDAwMS4wOTEtMy40MDQgNC4yMTEgNC4yMTEgMCAwMC0uNTM3LTEuNDQ5eiIgZmlsbD0iIzE2NTJGMCIvPjwvc3ZnPg==`;
},{}],"../node_modules/walletlink/dist/components/icons/globe-icon-svg.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOHMzLjU4IDggOCA4IDgtMy41OCA4LTgtMy41OC04LTgtOHptNS45MSA3aC0xLjk0Yy0uMS0xLjU3LS40Mi0zLS45MS00LjE1IDEuNDguODggMi41NSAyLjM4IDIuODUgNC4xNXpNOCAxNGMtLjQ1IDAtMS43Mi0xLjc3LTEuOTUtNWgzLjljLS4yMyAzLjIzLTEuNSA1LTEuOTUgNXpNNi4wNSA3QzYuMjggMy43NyA3LjU1IDIgOCAyYy40NSAwIDEuNzIgMS43NyAxLjk1IDVoLTMuOXpNNC45NCAyLjg1QzQuNDYgNCA0LjEzIDUuNDMgNC4wMyA3SDIuMDljLjMtMS43NyAxLjM3LTMuMjcgMi44NS00LjE1ek0yLjA5IDloMS45NGMuMSAxLjU3LjQyIDMgLjkxIDQuMTVBNS45OTggNS45OTggMCAwMTIuMDkgOXptOC45NyA0LjE1Yy40OC0xLjE1LjgxLTIuNTguOTEtNC4xNWgxLjk0YTUuOTk4IDUuOTk4IDAgMDEtMi44NSA0LjE1eiIgZmlsbD0iIzE2NTJGMCIvPjwvc3ZnPg==`;
},{}],"../node_modules/walletlink/dist/components/icons/lock-icon-svg.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgN3Y5aDE0VjdIMXptNy41IDQuMzlWMTRoLTF2LTIuNjFjLS40NC0uMTktLjc1LS42My0uNzUtMS4xNGExLjI1IDEuMjUgMCAwMTIuNSAwYzAgLjUxLS4zMS45NS0uNzUgMS4xNHpNNS42NyA2VjQuMzNDNS42NyAzLjA1IDYuNzEgMiA4IDJzMi4zMyAxLjA1IDIuMzMgMi4zM1Y2aDJWNC4zM0MxMi4zMyAxLjk0IDEwLjM5IDAgOCAwUzMuNjcgMS45NCAzLjY3IDQuMzNWNmgyeiIgZmlsbD0iIzE2NTJGMCIvPjwvc3ZnPg==`;
},{}],"../node_modules/walletlink/dist/components/icons/QRLogo.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="50" cy="50" r="50" fill="white"/>
<circle cx="49.9996" cy="49.9996" r="43.6363" fill="#1B53E4"/>
<circle cx="49.9996" cy="49.9996" r="43.6363" stroke="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M19.3379 49.9484C19.3379 66.8508 33.04 80.553 49.9425 80.553C66.8449 80.553 80.5471 66.8508 80.5471 49.9484C80.5471 33.0459 66.8449 19.3438 49.9425 19.3438C33.04 19.3438 19.3379 33.0459 19.3379 49.9484ZM44.0817 40.0799C41.8725 40.0799 40.0817 41.8708 40.0817 44.0799V55.8029C40.0817 58.012 41.8725 59.8029 44.0817 59.8029H55.8046C58.0138 59.8029 59.8046 58.012 59.8046 55.8029V44.0799C59.8046 41.8708 58.0138 40.0799 55.8046 40.0799H44.0817Z" fill="white"/>
</svg>

`;
},{}],"../node_modules/walletlink/dist/components/TryExtensionLinkDialog.js":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TryExtensionLinkDialog = void 0;

const clsx_1 = __importDefault(require("clsx"));

const TryExtensionLinkDialog_css_1 = __importDefault(require("./TryExtensionLinkDialog-css"));

const link_icon_svg_1 = __importDefault(require("./icons/link-icon-svg"));

const globe_icon_svg_1 = __importDefault(require("./icons/globe-icon-svg"));

const lock_icon_svg_1 = __importDefault(require("./icons/lock-icon-svg"));

const QRLogo_1 = __importDefault(require("./icons/QRLogo"));

const preact_1 = require("preact");

const hooks_1 = require("preact/hooks");

const QRCode_1 = require("./QRCode");

const Spinner_1 = require("./Spinner");

const TryExtensionLinkDialog = props => {
  const [isContainerHidden, setContainerHidden] = hooks_1.useState(!props.isOpen);
  const [isDialogHidden, setDialogHidden] = hooks_1.useState(!props.isOpen);
  hooks_1.useEffect(() => {
    const {
      isOpen
    } = props;
    const timers = [window.setTimeout(() => {
      setDialogHidden(!isOpen);
    }, 10)];

    if (isOpen) {
      setContainerHidden(false);
    } else {
      timers.push(window.setTimeout(() => {
        setContainerHidden(true);
      }, 360));
    }

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [props.isOpen]);
  return preact_1.h("div", {
    class: clsx_1.default("-walletlink-extension-dialog-container", isContainerHidden && "-walletlink-extension-dialog-container-hidden")
  }, preact_1.h("style", null, TryExtensionLinkDialog_css_1.default), preact_1.h("div", {
    class: clsx_1.default("-walletlink-extension-dialog-backdrop", isDialogHidden && "-walletlink-extension-dialog-backdrop-hidden")
  }), preact_1.h("div", {
    class: "-walletlink-extension-dialog"
  }, preact_1.h("div", {
    class: clsx_1.default("-walletlink-extension-dialog-box", isDialogHidden && "-walletlink-extension-dialog-box-hidden")
  }, preact_1.h(TryExtensionBox, {
    onInstallClick: () => {
      window.open("https://api.wallet.coinbase.com/rpc/v2/desktop/chrome", "_blank");
    }
  }), !props.connectDisabled ? preact_1.h(ScanQRBox, {
    darkMode: props.darkMode,
    version: props.version,
    sessionId: props.sessionId,
    sessionSecret: props.sessionSecret,
    walletLinkUrl: props.walletLinkUrl,
    isConnected: props.isConnected,
    isParentConnection: props.isParentConnection
  }) : null, props.onCancel && preact_1.h(CancelButton, {
    onClick: props.onCancel
  }))));
};

exports.TryExtensionLinkDialog = TryExtensionLinkDialog;

const TryExtensionBox = props => {
  return preact_1.h("div", {
    class: "-walletlink-extension-dialog-box-top"
  }, preact_1.h("div", {
    class: "-walletlink-extension-dialog-box-top-install-region"
  }, preact_1.h("h2", null, "Try Coinbase Wallet extension"), preact_1.h("button", {
    onClick: props.onInstallClick
  }, "Install")), preact_1.h("div", {
    class: "-walletlink-extension-dialog-box-top-info-region"
  }, preact_1.h(DescriptionItem, {
    icon: link_icon_svg_1.default,
    text: "Connect to crypto apps with one click"
  }), preact_1.h(DescriptionItem, {
    icon: lock_icon_svg_1.default,
    text: "Private keys remain secure on mobile app"
  }), preact_1.h(DescriptionItem, {
    icon: globe_icon_svg_1.default,
    text: "Compatible with all crypto apps"
  })));
};

const ScanQRBox = props => {
  const serverUrl = window.encodeURIComponent(props.walletLinkUrl);
  const sessionIdKey = props.isParentConnection ? "parent-id" : "id";
  const qrUrl = `${props.walletLinkUrl}/#/link?${sessionIdKey}=${props.sessionId}&secret=${props.sessionSecret}&server=${serverUrl}&v=1`;
  return preact_1.h("div", {
    class: "-walletlink-extension-dialog-box-bottom"
  }, preact_1.h("div", {
    class: "-walletlink-extension-dialog-box-bottom-description-region"
  }, preact_1.h("h2", null, "Or scan to connect"), preact_1.h("body", {
    class: "-walletlink-extension-dialog-box-bottom-description"
  }, "Open ", preact_1.h("a", {
    href: "https://wallet.coinbase.com/"
  }, "Coinbase Wallet"), " on your mobile phone and scan")), preact_1.h("div", {
    class: "-walletlink-extension-dialog-box-bottom-qr-region"
  }, preact_1.h("div", {
    class: "-walletlink-extension-dialog-box-bottom-qr-wrapper"
  }, preact_1.h(QRCode_1.QRCode, {
    content: qrUrl,
    width: 150,
    height: 150,
    fgColor: "#000",
    bgColor: "transparent",
    image: {
      svg: QRLogo_1.default,
      width: 34,
      height: 34
    }
  })), preact_1.h("input", {
    type: "hidden",
    value: qrUrl
  }), !props.isConnected && preact_1.h("div", {
    class: "-walletlink-extension-dialog-box-bottom-qr-connecting"
  }, preact_1.h(Spinner_1.Spinner, {
    size: 36,
    color: "#000"
  }), preact_1.h("p", null, "Connecting..."))));
};

const DescriptionItem = props => {
  return preact_1.h("div", {
    class: "-walletlink-extension-dialog-box-top-description"
  }, preact_1.h("div", {
    class: "-walletlink-extension-dialog-box-top-description-icon-wrapper"
  }, preact_1.h("img", {
    src: props.icon
  })), preact_1.h("body", {
    class: "-walletlink-extension-dialog-box-top-description-text"
  }, props.text));
};

const CancelButton = props => preact_1.h("button", {
  class: "-walletlink-extension-dialog-box-cancel",
  onClick: props.onClick
}, preact_1.h("div", {
  class: "-walletlink-extension-dialog-box-cancel-x"
}));
},{"clsx":"../node_modules/clsx/dist/clsx.m.js","./TryExtensionLinkDialog-css":"../node_modules/walletlink/dist/components/TryExtensionLinkDialog-css.js","./icons/link-icon-svg":"../node_modules/walletlink/dist/components/icons/link-icon-svg.js","./icons/globe-icon-svg":"../node_modules/walletlink/dist/components/icons/globe-icon-svg.js","./icons/lock-icon-svg":"../node_modules/walletlink/dist/components/icons/lock-icon-svg.js","./icons/QRLogo":"../node_modules/walletlink/dist/components/icons/QRLogo.js","preact":"../node_modules/preact/dist/preact.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","./QRCode":"../node_modules/walletlink/dist/components/QRCode.js","./Spinner":"../node_modules/walletlink/dist/components/Spinner.js"}],"../node_modules/walletlink/dist/components/LinkFlow.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinkFlow = void 0;

const preact_1 = require("preact");

const rxjs_1 = require("rxjs");

const LinkDialog_1 = require("./LinkDialog");

const operators_1 = require("rxjs/operators");

const TryExtensionLinkDialog_1 = require("./TryExtensionLinkDialog");

class LinkFlow {
  constructor(options) {
    this.extensionUI$ = new rxjs_1.BehaviorSubject({});
    this.subscriptions = new rxjs_1.Subscription();
    this.isConnected = false;
    this.isOpen = false;
    this.onCancel = null;
    this.root = null; // if true, hide QR code in LinkFlow (which happens if no jsonRpcUrl is provided)

    this.connectDisabled = false;
    this.darkMode = options.darkMode;
    this.version = options.version;
    this.sessionId = options.sessionId;
    this.sessionSecret = options.sessionSecret;
    this.walletLinkUrl = options.walletLinkUrl;
    this.isParentConnection = options.isParentConnection;
    this.connected$ = options.connected$; // Check if extension UI is enabled

    fetch("https://api.wallet.coinbase.com/rpc/v2/getFeatureFlags").then(res => res.json()).then(json => {
      const enabled = json.result.desktop.extension_ui;

      if (typeof enabled === "undefined") {
        this.extensionUI$.next({
          value: false
        });
      } else {
        this.extensionUI$.next({
          value: enabled
        });
      }
    }).catch(_ => {
      this.extensionUI$.next({
        value: false
      });
    });
  }

  attach(el) {
    this.root = document.createElement("div");
    this.root.className = "-walletlink-link-flow-root";
    el.appendChild(this.root);
    this.render();
    this.subscriptions.add(this.connected$.subscribe(v => {
      if (this.isConnected !== v) {
        this.isConnected = v;
        this.render();
      }
    }));
  }

  detach() {
    var _a;

    if (!this.root) {
      return;
    }

    this.subscriptions.unsubscribe();
    preact_1.render(null, this.root);
    (_a = this.root.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(this.root);
  }

  setConnectDisabled(connectDisabled) {
    this.connectDisabled = connectDisabled;
  }

  open(options) {
    this.isOpen = true;
    this.onCancel = options.onCancel;
    this.render();
  }

  close() {
    this.isOpen = false;
    this.onCancel = null;
    this.render();
  }

  render() {
    if (!this.root) {
      return;
    }

    const subscription = this.extensionUI$.pipe(operators_1.first(enabled => enabled.value !== undefined)) // wait for a valid value before rendering
    .subscribe(enabled => {
      if (!this.root) {
        return;
      }

      preact_1.render(enabled.value ? preact_1.h(TryExtensionLinkDialog_1.TryExtensionLinkDialog, {
        darkMode: this.darkMode,
        version: this.version,
        sessionId: this.sessionId,
        sessionSecret: this.sessionSecret,
        walletLinkUrl: this.walletLinkUrl,
        isOpen: this.isOpen,
        isConnected: this.isConnected,
        isParentConnection: this.isParentConnection,
        onCancel: this.onCancel,
        connectDisabled: this.connectDisabled
      }) : preact_1.h(LinkDialog_1.LinkDialog, {
        darkMode: this.darkMode,
        version: this.version,
        sessionId: this.sessionId,
        sessionSecret: this.sessionSecret,
        walletLinkUrl: this.walletLinkUrl,
        isOpen: this.isOpen,
        isConnected: this.isConnected,
        isParentConnection: this.isParentConnection,
        onCancel: this.onCancel
      }), this.root);
    });
    this.subscriptions.add(subscription);
  }

}

exports.LinkFlow = LinkFlow;
},{"preact":"../node_modules/preact/dist/preact.module.js","rxjs":"../node_modules/rxjs/_esm5/index.js","./LinkDialog":"../node_modules/walletlink/dist/components/LinkDialog.js","rxjs/operators":"../node_modules/rxjs/_esm5/operators/index.js","./TryExtensionLinkDialog":"../node_modules/walletlink/dist/components/TryExtensionLinkDialog.js"}],"../node_modules/walletlink/dist/components/Snackbar-css.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `.-walletlink-css-reset .-gear-container{margin-left:16px !important;margin-right:9px !important;display:flex;align-items:center;justify-content:center;width:24px;height:24px;transition:opacity .25s}.-walletlink-css-reset .-gear-container *{user-select:none}.-walletlink-css-reset .-gear-container svg{opacity:0;position:absolute}.-walletlink-css-reset .-gear-icon{height:12px;width:12px;z-index:10000}.-walletlink-css-reset .-walletlink-snackbar{align-items:flex-end;display:flex;flex-direction:column;position:fixed;right:0;top:0;z-index:2147483647}.-walletlink-css-reset .-walletlink-snackbar *{user-select:none}.-walletlink-css-reset .-walletlink-snackbar-instance{display:flex;flex-direction:column;margin:8px 16px 0 16px;overflow:visible;text-align:left;transform:translateX(0);transition:opacity .25s,transform .25s}.-walletlink-css-reset .-walletlink-snackbar-instance-header:hover .-gear-container svg{opacity:1}.-walletlink-css-reset .-walletlink-snackbar-instance-header{display:flex;align-items:center;background:#fff;overflow:hidden;border:1px solid #e7ebee;box-sizing:border-box;border-radius:8px;cursor:pointer}.-walletlink-css-reset .-walletlink-snackbar-instance-header-cblogo{margin:8px 8px 8px 8px}.-walletlink-css-reset .-walletlink-snackbar-instance-header *{cursor:pointer}.-walletlink-css-reset .-walletlink-snackbar-instance-header-message{color:#000;font-size:13px;line-height:1.5;user-select:none}.-walletlink-css-reset .-walletlink-snackbar-instance-menu{background:#fff;transition:opacity .25s ease-in-out,transform .25s linear,visibility 0s;visibility:hidden;border:1px solid #e7ebee;box-sizing:border-box;border-radius:8px;opacity:0;flex-direction:column;padding-left:8px;padding-right:8px}.-walletlink-css-reset .-walletlink-snackbar-instance-menu-item:last-child{margin-bottom:8px !important}.-walletlink-css-reset .-walletlink-snackbar-instance-menu-item:hover{background:#f5f7f8;border-radius:6px;transition:background .25s}.-walletlink-css-reset .-walletlink-snackbar-instance-menu-item:hover span{color:#050f19;transition:color .25s}.-walletlink-css-reset .-walletlink-snackbar-instance-menu-item:hover svg path{fill:#000;transition:fill .25s}.-walletlink-css-reset .-walletlink-snackbar-instance-menu-item{visibility:inherit;height:35px;margin-top:8px;margin-bottom:0;display:flex;flex-direction:row;align-items:center;padding:8px;cursor:pointer}.-walletlink-css-reset .-walletlink-snackbar-instance-menu-item *{visibility:inherit;cursor:pointer}.-walletlink-css-reset .-walletlink-snackbar-instance-menu-item-is-red:hover{background:rgba(223,95,103,.2);transition:background .25s}.-walletlink-css-reset .-walletlink-snackbar-instance-menu-item-is-red:hover *{cursor:pointer}.-walletlink-css-reset .-walletlink-snackbar-instance-menu-item-is-red:hover svg path{fill:#df5f67;transition:fill .25s}.-walletlink-css-reset .-walletlink-snackbar-instance-menu-item-is-red:hover span{color:#df5f67;transition:color .25s}.-walletlink-css-reset .-walletlink-snackbar-instance-menu-item-info{color:#aaa;font-size:13px;margin:0 8px 0 32px;position:absolute}.-walletlink-css-reset .-walletlink-snackbar-instance-hidden{opacity:0;text-align:left;transform:translateX(25%);transition:opacity .5s linear}.-walletlink-css-reset .-walletlink-snackbar-instance-expanded .-walletlink-snackbar-instance-menu{opacity:1;display:flex;transform:translateY(8px);visibility:visible}`;
},{}],"../node_modules/walletlink/dist/components/Snackbar.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Snackbar = void 0;

const clsx_1 = __importDefault(require("clsx"));

const preact_1 = require("preact");

const hooks_1 = require("preact/hooks");

const Snackbar_css_1 = __importDefault(require("./Snackbar-css"));

const cblogo = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDkyIDEwLjQxOWE4LjkzIDguOTMgMCAwMTguOTMtOC45M2gxMS4xNjNhOC45MyA4LjkzIDAgMDE4LjkzIDguOTN2MTEuMTYzYTguOTMgOC45MyAwIDAxLTguOTMgOC45M0gxMC40MjJhOC45MyA4LjkzIDAgMDEtOC45My04LjkzVjEwLjQxOXoiIGZpbGw9IiMxNjUyRjAiLz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTEwLjQxOSAwSDIxLjU4QzI3LjMzNSAwIDMyIDQuNjY1IDMyIDEwLjQxOVYyMS41OEMzMiAyNy4zMzUgMjcuMzM1IDMyIDIxLjU4MSAzMkgxMC40MkM0LjY2NSAzMiAwIDI3LjMzNSAwIDIxLjU4MVYxMC40MkMwIDQuNjY1IDQuNjY1IDAgMTAuNDE5IDB6bTAgMS40ODhhOC45MyA4LjkzIDAgMDAtOC45MyA4LjkzdjExLjE2M2E4LjkzIDguOTMgMCAwMDguOTMgOC45M0gyMS41OGE4LjkzIDguOTMgMCAwMDguOTMtOC45M1YxMC40MmE4LjkzIDguOTMgMCAwMC04LjkzLTguOTNIMTAuNDJ6IiBmaWxsPSIjZmZmIi8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNS45OTggMjYuMDQ5Yy01LjU0OSAwLTEwLjA0Ny00LjQ5OC0xMC4wNDctMTAuMDQ3IDAtNS41NDggNC40OTgtMTAuMDQ2IDEwLjA0Ny0xMC4wNDYgNS41NDggMCAxMC4wNDYgNC40OTggMTAuMDQ2IDEwLjA0NiAwIDUuNTQ5LTQuNDk4IDEwLjA0Ny0xMC4wNDYgMTAuMDQ3eiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xMi43NjIgMTQuMjU0YzAtLjgyMi42NjctMS40ODkgMS40ODktMS40ODloMy40OTdjLjgyMiAwIDEuNDg4LjY2NiAxLjQ4OCAxLjQ4OXYzLjQ5N2MwIC44MjItLjY2NiAxLjQ4OC0xLjQ4OCAxLjQ4OGgtMy40OTdhMS40ODggMS40ODggMCAwMS0xLjQ4OS0xLjQ4OHYtMy40OTh6IiBmaWxsPSIjMTY1MkYwIi8+PC9zdmc+`;
const gearIcon = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDYuNzV2LTEuNWwtMS43Mi0uNTdjLS4wOC0uMjctLjE5LS41Mi0uMzItLjc3bC44MS0xLjYyLTEuMDYtMS4wNi0xLjYyLjgxYy0uMjQtLjEzLS41LS4yNC0uNzctLjMyTDYuNzUgMGgtMS41bC0uNTcgMS43MmMtLjI3LjA4LS41My4xOS0uNzcuMzJsLTEuNjItLjgxLTEuMDYgMS4wNi44MSAxLjYyYy0uMTMuMjQtLjI0LjUtLjMyLjc3TDAgNS4yNXYxLjVsMS43Mi41N2MuMDguMjcuMTkuNTMuMzIuNzdsLS44MSAxLjYyIDEuMDYgMS4wNiAxLjYyLS44MWMuMjQuMTMuNS4yMy43Ny4zMkw1LjI1IDEyaDEuNWwuNTctMS43MmMuMjctLjA4LjUyLS4xOS43Ny0uMzJsMS42Mi44MSAxLjA2LTEuMDYtLjgxLTEuNjJjLjEzLS4yNC4yMy0uNS4zMi0uNzdMMTIgNi43NXpNNiA4LjVhMi41IDIuNSAwIDAxMC01IDIuNSAyLjUgMCAwMTAgNXoiIGZpbGw9IiMwNTBGMTkiLz48L3N2Zz4=`;

class Snackbar {
  constructor(options) {
    this.items = new Map();
    this.nextItemKey = 0;
    this.root = null;
    this.darkMode = options.darkMode;
  }

  attach(el) {
    this.root = document.createElement("div");
    this.root.className = "-walletlink-snackbar-root";
    el.appendChild(this.root);
    this.render();
  }

  presentItem(itemProps) {
    const key = this.nextItemKey++;
    this.items.set(key, itemProps);
    this.render();
    return () => {
      this.items.delete(key);
      this.render();
    };
  }

  clear() {
    this.items.clear();
    this.render();
  }

  render() {
    if (!this.root) {
      return;
    }

    preact_1.render(preact_1.h("div", null, preact_1.h(SnackbarContainer, {
      darkMode: this.darkMode
    }, Array.from(this.items.entries()).map(([key, itemProps]) => preact_1.h(SnackbarInstance, Object.assign({}, itemProps, {
      key: key
    }))))), this.root);
  }

}

exports.Snackbar = Snackbar;

const SnackbarContainer = props => preact_1.h("div", {
  class: clsx_1.default("-walletlink-snackbar-container")
}, preact_1.h("style", null, Snackbar_css_1.default), preact_1.h("div", {
  class: "-walletlink-snackbar"
}, props.children));

const SnackbarInstance = ({
  message,
  menuItems
}) => {
  const [hidden, setHidden] = hooks_1.useState(true);
  const [expanded, setExpanded] = hooks_1.useState(false);
  hooks_1.useEffect(() => {
    const timers = [window.setTimeout(() => {
      setHidden(false);
    }, 1), window.setTimeout(() => {
      setExpanded(true);
    }, 10000)];
    return () => {
      timers.forEach(window.clearTimeout);
    };
  });

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return preact_1.h("div", {
    class: clsx_1.default("-walletlink-snackbar-instance", hidden && "-walletlink-snackbar-instance-hidden", expanded && "-walletlink-snackbar-instance-expanded")
  }, preact_1.h("div", {
    class: "-walletlink-snackbar-instance-header",
    onClick: toggleExpanded
  }, preact_1.h("img", {
    src: cblogo,
    class: "-walletlink-snackbar-instance-header-cblogo"
  }), preact_1.h("div", {
    class: "-walletlink-snackbar-instance-header-message"
  }, message), preact_1.h("div", {
    class: "-gear-container"
  }, !expanded && preact_1.h("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, preact_1.h("circle", {
    cx: "12",
    cy: "12",
    r: "12",
    fill: "#F5F7F8"
  })), preact_1.h("img", {
    src: gearIcon,
    class: "-gear-icon",
    title: "Expand"
  }))), menuItems && menuItems.length > 0 && preact_1.h("div", {
    class: "-walletlink-snackbar-instance-menu"
  }, menuItems.map((action, i) => preact_1.h("div", {
    class: clsx_1.default("-walletlink-snackbar-instance-menu-item", action.isRed && "-walletlink-snackbar-instance-menu-item-is-red"),
    onClick: action.onClick,
    key: i
  }, preact_1.h("svg", {
    width: action.svgWidth,
    height: action.svgHeight,
    viewBox: "0 0 10 11",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, preact_1.h("path", {
    "fill-rule": action.defaultFillRule,
    "clip-rule": action.defaultClipRule,
    d: action.path,
    fill: "#AAAAAA"
  })), preact_1.h("span", {
    class: clsx_1.default("-walletlink-snackbar-instance-menu-item-info", action.isRed && "-walletlink-snackbar-instance-menu-item-info-is-red")
  }, action.info)))));
};
},{"clsx":"../node_modules/clsx/dist/clsx.m.js","preact":"../node_modules/preact/dist/preact.module.js","preact/hooks":"../node_modules/preact/hooks/dist/hooks.module.js","./Snackbar-css":"../node_modules/walletlink/dist/components/Snackbar-css.js"}],"../node_modules/walletlink/dist/provider/WalletLinkSdkUI.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WalletLinkSdkUI = void 0;

const WalletLinkUI_1 = require("./WalletLinkUI");

const cssReset_1 = require("../lib/cssReset");

const LinkFlow_1 = require("../components/LinkFlow");

const Snackbar_1 = require("../components/Snackbar");

class WalletLinkSdkUI extends WalletLinkUI_1.WalletLinkUI {
  constructor(options) {
    super(options);
    this.attached = false;
    this.snackbar = new Snackbar_1.Snackbar({
      darkMode: options.darkMode
    });
    this.linkFlow = new LinkFlow_1.LinkFlow({
      darkMode: options.darkMode,
      version: options.version,
      sessionId: options.session.id,
      sessionSecret: options.session.secret,
      walletLinkUrl: options.walletLinkUrl,
      connected$: options.connected$,
      isParentConnection: false
    });
  }

  attach() {
    if (this.attached) {
      throw new Error("WalletLinkUI is already attached");
    }

    const el = document.documentElement;
    const container = document.createElement("div");
    container.className = "-walletlink-css-reset";
    el.appendChild(container);
    this.linkFlow.attach(container);
    this.snackbar.attach(container);
    this.attached = true;
    cssReset_1.injectCssReset();
  }

  setConnectDisabled(connectDisabled) {
    this.linkFlow.setConnectDisabled(connectDisabled);
  } // @ts-ignore


  switchEthereumChain(options) {// no-op
  }

  requestEthereumAccounts(options) {
    this.linkFlow.open({
      onCancel: options.onCancel
    });
  }

  hideRequestEthereumAccounts() {
    this.linkFlow.close();
  }

  showConnecting(options) {
    const snackbarProps = {
      message: "Confirm on phone",
      menuItems: [{
        isRed: true,
        info: "Cancel transaction",
        svgWidth: "11",
        svgHeight: "11",
        path: "M10.3711 1.52346L9.21775 0.370117L5.37109 4.21022L1.52444 0.370117L0.371094 1.52346L4.2112 5.37012L0.371094 9.21677L1.52444 10.3701L5.37109 6.53001L9.21775 10.3701L10.3711 9.21677L6.53099 5.37012L10.3711 1.52346Z",
        defaultFillRule: "inherit",
        defaultClipRule: "inherit",
        onClick: options.onCancel
      }, {
        isRed: false,
        info: "Reset connection",
        svgWidth: "10",
        svgHeight: "11",
        path: "M5.00008 0.96875C6.73133 0.96875 8.23758 1.94375 9.00008 3.375L10.0001 2.375V5.5H9.53133H7.96883H6.87508L7.80633 4.56875C7.41258 3.3875 6.31258 2.53125 5.00008 2.53125C3.76258 2.53125 2.70633 3.2875 2.25633 4.36875L0.812576 3.76875C1.50008 2.125 3.11258 0.96875 5.00008 0.96875ZM2.19375 6.43125C2.5875 7.6125 3.6875 8.46875 5 8.46875C6.2375 8.46875 7.29375 7.7125 7.74375 6.63125L9.1875 7.23125C8.5 8.875 6.8875 10.0312 5 10.0312C3.26875 10.0312 1.7625 9.05625 1 7.625L0 8.625V5.5H0.46875H2.03125H3.125L2.19375 6.43125Z",
        defaultFillRule: "evenodd",
        defaultClipRule: "evenodd",
        onClick: options.onResetConnection
      }]
    };
    return this.snackbar.presentItem(snackbarProps);
  }

  reloadUI() {
    document.location.reload();
  }

  inlineAccountsResponse() {
    return false;
  }

  inlineSwitchEthereumChain() {
    return false;
  }

}

exports.WalletLinkSdkUI = WalletLinkSdkUI;
},{"./WalletLinkUI":"../node_modules/walletlink/dist/provider/WalletLinkUI.js","../lib/cssReset":"../node_modules/walletlink/dist/lib/cssReset.js","../components/LinkFlow":"../node_modules/walletlink/dist/components/LinkFlow.js","../components/Snackbar":"../node_modules/walletlink/dist/components/Snackbar.js"}],"../node_modules/bind-decorator/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants;
(function (constants) {
    constants.typeOfFunction = 'function';
    constants.boolTrue = true;
})(constants || (constants = {}));
function bind(target, propertyKey, descriptor) {
    if (!descriptor || (typeof descriptor.value !== constants.typeOfFunction)) {
        throw new TypeError("Only methods can be decorated with @bind. <" + propertyKey + "> is not a method!");
    }
    return {
        configurable: constants.boolTrue,
        get: function () {
            var bound = descriptor.value.bind(this);
            // Credits to https://github.com/andreypopp/autobind-decorator for memoizing the result of bind against a symbol on the instance.
            Object.defineProperty(this, propertyKey, {
                value: bound,
                configurable: constants.boolTrue,
                writable: constants.boolTrue
            });
            return bound;
        }
    };
}
exports.bind = bind;
exports.default = bind;

},{}],"../node_modules/walletlink/dist/connection/ClientMessage.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientMessagePublishEvent = exports.ClientMessageSetSessionConfig = exports.ClientMessageGetSessionConfig = exports.ClientMessageIsLinked = exports.ClientMessageHostSession = void 0;

function ClientMessageHostSession(params) {
  return Object.assign({
    type: "HostSession"
  }, params);
}

exports.ClientMessageHostSession = ClientMessageHostSession;

function ClientMessageIsLinked(params) {
  return Object.assign({
    type: "IsLinked"
  }, params);
}

exports.ClientMessageIsLinked = ClientMessageIsLinked;

function ClientMessageGetSessionConfig(params) {
  return Object.assign({
    type: "GetSessionConfig"
  }, params);
}

exports.ClientMessageGetSessionConfig = ClientMessageGetSessionConfig;

function ClientMessageSetSessionConfig(params) {
  return Object.assign({
    type: "SetSessionConfig"
  }, params);
}

exports.ClientMessageSetSessionConfig = ClientMessageSetSessionConfig;

function ClientMessagePublishEvent(params) {
  return Object.assign({
    type: "PublishEvent"
  }, params);
}

exports.ClientMessagePublishEvent = ClientMessagePublishEvent;
},{}],"../node_modules/walletlink/dist/connection/RxWebSocket.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RxWebSocket = exports.ConnectionState = void 0;

const rxjs_1 = require("rxjs");

const operators_1 = require("rxjs/operators");

var ConnectionState;

(function (ConnectionState) {
  ConnectionState[ConnectionState["DISCONNECTED"] = 0] = "DISCONNECTED";
  ConnectionState[ConnectionState["CONNECTING"] = 1] = "CONNECTING";
  ConnectionState[ConnectionState["CONNECTED"] = 2] = "CONNECTED";
})(ConnectionState = exports.ConnectionState || (exports.ConnectionState = {}));
/**
 * Rx-ified WebSocket
 */


class RxWebSocket {
  /**
   * Constructor
   * @param url WebSocket server URL
   * @param [WebSocketClass] Custom WebSocket implementation
   */
  constructor(url, WebSocketClass = WebSocket) {
    this.WebSocketClass = WebSocketClass;
    this.webSocket = null;
    this.connectionStateSubject = new rxjs_1.BehaviorSubject(ConnectionState.DISCONNECTED);
    this.incomingDataSubject = new rxjs_1.Subject();
    this.url = url.replace(/^http/, "ws");
  }
  /**
   * Make a websocket connection
   * @returns an Observable that completes when connected
   */


  connect() {
    if (this.webSocket) {
      return rxjs_1.throwError(new Error("webSocket object is not null"));
    }

    return new rxjs_1.Observable(obs => {
      let webSocket;

      try {
        this.webSocket = webSocket = new this.WebSocketClass(this.url);
      } catch (err) {
        obs.error(err);
        return;
      }

      this.connectionStateSubject.next(ConnectionState.CONNECTING);

      webSocket.onclose = evt => {
        this.clearWebSocket();
        obs.error(new Error(`websocket error ${evt.code}: ${evt.reason}`));
        this.connectionStateSubject.next(ConnectionState.DISCONNECTED);
      };

      webSocket.onopen = _ => {
        obs.next();
        obs.complete();
        this.connectionStateSubject.next(ConnectionState.CONNECTED);
      };

      webSocket.onmessage = evt => {
        this.incomingDataSubject.next(evt.data);
      };
    }).pipe(operators_1.take(1));
  }
  /**
   * Disconnect from server
   */


  disconnect() {
    const {
      webSocket
    } = this;

    if (!webSocket) {
      return;
    }

    this.clearWebSocket();
    this.connectionStateSubject.next(ConnectionState.DISCONNECTED);

    try {
      webSocket.close();
    } catch (_a) {}
  }
  /**
   * Emit current connection state and subsequent changes
   * @returns an Observable for the connection state
   */


  get connectionState$() {
    return this.connectionStateSubject.asObservable();
  }
  /**
   * Emit incoming data from server
   * @returns an Observable for the data received
   */


  get incomingData$() {
    return this.incomingDataSubject.asObservable();
  }
  /**
   * Emit incoming JSON data from server. non-JSON data are ignored
   * @returns an Observable for parsed JSON data
   */


  get incomingJSONData$() {
    return this.incomingData$.pipe(operators_1.flatMap(m => {
      let j;

      try {
        j = JSON.parse(m);
      } catch (err) {
        return rxjs_1.empty();
      }

      return rxjs_1.of(j);
    }));
  }
  /**
   * Send data to server
   * @param data text to send
   */


  sendData(data) {
    const {
      webSocket
    } = this;

    if (!webSocket) {
      throw new Error("websocket is not connected");
    }

    webSocket.send(data);
  }

  clearWebSocket() {
    const {
      webSocket
    } = this;

    if (!webSocket) {
      return;
    }

    this.webSocket = null;
    webSocket.onclose = null;
    webSocket.onerror = null;
    webSocket.onmessage = null;
    webSocket.onopen = null;
  }

}

exports.RxWebSocket = RxWebSocket;
},{"rxjs":"../node_modules/rxjs/_esm5/index.js","rxjs/operators":"../node_modules/rxjs/_esm5/operators/index.js"}],"../node_modules/walletlink/dist/connection/ServerMessage.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isServerMessageFail = void 0;

function isServerMessageFail(msg) {
  return msg && msg.type === "Fail" && typeof msg.id === "number" && typeof msg.sessionId === "string" && typeof msg.error === "string";
}

exports.isServerMessageFail = isServerMessageFail;
},{}],"../node_modules/walletlink/dist/connection/WalletLinkConnection.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WalletLinkConnection = void 0;

const rxjs_1 = require("rxjs");

const operators_1 = require("rxjs/operators");

const types_1 = require("../types");

const ClientMessage_1 = require("./ClientMessage");

const RxWebSocket_1 = require("./RxWebSocket");

const ServerMessage_1 = require("./ServerMessage");

const HEARTBEAT_INTERVAL = 10000;
const REQUEST_TIMEOUT = 60000;
/**
 * WalletLink Connection
 */

class WalletLinkConnection {
  /**
   * Constructor
   * @param sessionId Session ID
   * @param sessionKey Session Key
   * @param serverUrl Walletlinkd RPC URL
   * @param [WebSocketClass] Custom WebSocket implementation
   */
  constructor(sessionId, sessionKey, serverUrl, WebSocketClass = WebSocket) {
    this.sessionId = sessionId;
    this.sessionKey = sessionKey;
    this.subscriptions = new rxjs_1.Subscription();
    this.destroyed = false;
    this.lastHeartbeatResponse = 0;
    this.nextReqId = types_1.IntNumber(1);
    this.connectedSubject = new rxjs_1.BehaviorSubject(false);
    this.linkedSubject = new rxjs_1.BehaviorSubject(false);
    this.sessionConfigSubject = new rxjs_1.ReplaySubject(1);
    const ws = new RxWebSocket_1.RxWebSocket(serverUrl + "/rpc", WebSocketClass);
    this.ws = ws; // attempt to reconnect every 5 seconds when disconnected

    this.subscriptions.add(ws.connectionState$.pipe( // ignore initial DISCONNECTED state
    operators_1.skip(1), // if DISCONNECTED and not destroyed
    operators_1.filter(cs => cs === RxWebSocket_1.ConnectionState.DISCONNECTED && !this.destroyed), // wait 5 seconds
    operators_1.delay(5000), // check whether it's destroyed again
    operators_1.filter(_ => !this.destroyed), // reconnect
    operators_1.flatMap(_ => ws.connect()), operators_1.retry()).subscribe()); // perform authentication upon connection

    this.subscriptions.add(ws.connectionState$.pipe( // ignore initial DISCONNECTED and CONNECTING states
    operators_1.skip(2), operators_1.switchMap(cs => rxjs_1.iif(() => cs === RxWebSocket_1.ConnectionState.CONNECTED, // if CONNECTED, authenticate, and then check link status
    this.authenticate().pipe(operators_1.tap(_ => this.sendIsLinked()), operators_1.tap(_ => this.sendGetSessionConfig()), operators_1.map(_ => true)), // if not CONNECTED, emit false immediately
    rxjs_1.of(false))), operators_1.distinctUntilChanged(), operators_1.catchError(_ => rxjs_1.of(false))).subscribe(connected => this.connectedSubject.next(connected))); // send heartbeat every n seconds while connected

    this.subscriptions.add(ws.connectionState$.pipe( // ignore initial DISCONNECTED state
    operators_1.skip(1), operators_1.switchMap(cs => rxjs_1.iif(() => cs === RxWebSocket_1.ConnectionState.CONNECTED, // if CONNECTED, start the heartbeat timer
    rxjs_1.timer(0, HEARTBEAT_INTERVAL)))).subscribe(i => // first timer event updates lastHeartbeat timestamp
    // subsequent calls send heartbeat message
    i === 0 ? this.updateLastHeartbeat() : this.heartbeat())); // handle server's heartbeat responses

    this.subscriptions.add(ws.incomingData$.pipe(operators_1.filter(m => m === "h")).subscribe(_ => this.updateLastHeartbeat())); // handle link status updates

    this.subscriptions.add(ws.incomingJSONData$.pipe(operators_1.filter(m => ["IsLinkedOK", "Linked"].includes(m.type))).subscribe(m => {
      const msg = m;
      this.linkedSubject.next(msg.linked || msg.onlineGuests > 0);
    })); // handle session config updates

    this.subscriptions.add(ws.incomingJSONData$.pipe(operators_1.filter(m => ["GetSessionConfigOK", "SessionConfigUpdated"].includes(m.type))).subscribe(m => {
      const msg = m;
      this.sessionConfigSubject.next({
        webhookId: msg.webhookId,
        webhookUrl: msg.webhookUrl,
        metadata: msg.metadata
      });
    }));
  }
  /**
   * Make a connection to the server
   */


  connect() {
    if (this.destroyed) {
      throw new Error("instance is destroyed");
    }

    this.ws.connect().subscribe();
  }
  /**
   * Terminate connection, and mark as destroyed. To reconnect, create a new
   * instance of WalletLinkConnection
   */


  destroy() {
    this.subscriptions.unsubscribe();
    this.ws.disconnect();
    this.destroyed = true;
  }
  /**
   * Emit true if connected and authenticated, else false
   * @returns an Observable
   */


  get connected$() {
    return this.connectedSubject.asObservable();
  }
  /**
   * Emit once connected
   * @returns an Observable
   */


  get onceConnected$() {
    return this.connected$.pipe(operators_1.filter(v => v), operators_1.take(1), operators_1.map(() => void 0));
  }
  /**
   * Emit true if linked (a guest has joined before)
   * @returns an Observable
   */


  get linked$() {
    return this.linkedSubject.asObservable();
  }
  /**
   * Emit once when linked
   * @returns an Observable
   */


  get onceLinked$() {
    return this.linked$.pipe(operators_1.filter(v => v), operators_1.take(1), operators_1.map(() => void 0));
  }
  /**
   * Emit current session config if available, and subsequent updates
   * @returns an Observable for the session config
   */


  get sessionConfig$() {
    return this.sessionConfigSubject.asObservable();
  }
  /**
   * Emit incoming Event messages
   * @returns an Observable for the messages
   */


  get incomingEvent$() {
    return this.ws.incomingJSONData$.pipe(operators_1.filter(m => {
      if (m.type !== "Event") {
        return false;
      }

      const sme = m;
      return typeof sme.sessionId === "string" && typeof sme.eventId === "string" && typeof sme.event === "string" && typeof sme.data === "string";
    }), operators_1.map(m => m));
  }
  /**
   * Set session metadata in SessionConfig object
   * @param key
   * @param value
   * @returns an Observable that completes when successful
   */


  setSessionMetadata(key, value) {
    const message = ClientMessage_1.ClientMessageSetSessionConfig({
      id: types_1.IntNumber(this.nextReqId++),
      sessionId: this.sessionId,
      metadata: {
        [key]: value
      }
    });
    return this.onceConnected$.pipe(operators_1.flatMap(_ => this.makeRequest(message)), operators_1.map(res => {
      if (ServerMessage_1.isServerMessageFail(res)) {
        throw new Error(res.error || "failed to set session metadata");
      }
    }));
  }
  /**
   * Publish an event and emit event ID when successful
   * @param event event name
   * @param data event data
   * @param callWebhook whether the webhook should be invoked
   * @returns an Observable that emits event ID when successful
   */


  publishEvent(event, data, callWebhook = false) {
    const message = ClientMessage_1.ClientMessagePublishEvent({
      id: types_1.IntNumber(this.nextReqId++),
      sessionId: this.sessionId,
      event,
      data,
      callWebhook
    });
    return this.onceLinked$.pipe(operators_1.flatMap(_ => this.makeRequest(message)), operators_1.map(res => {
      if (ServerMessage_1.isServerMessageFail(res)) {
        throw new Error(res.error || "failed to publish event");
      }

      return res.eventId;
    }));
  }

  sendData(message) {
    this.ws.sendData(JSON.stringify(message));
  }

  updateLastHeartbeat() {
    this.lastHeartbeatResponse = Date.now();
  }

  heartbeat() {
    if (Date.now() - this.lastHeartbeatResponse > HEARTBEAT_INTERVAL * 2) {
      this.ws.disconnect();
      return;
    }

    try {
      this.ws.sendData("h");
    } catch (_a) {}
  }

  makeRequest(message, timeout = REQUEST_TIMEOUT) {
    const reqId = message.id;

    try {
      this.sendData(message);
    } catch (err) {
      return rxjs_1.throwError(err);
    } // await server message with corresponding id


    return this.ws.incomingJSONData$.pipe(operators_1.timeoutWith(timeout, rxjs_1.throwError(new Error(`request ${reqId} timed out`))), operators_1.filter(m => m.id === reqId), operators_1.take(1));
  }

  authenticate() {
    const msg = ClientMessage_1.ClientMessageHostSession({
      id: types_1.IntNumber(this.nextReqId++),
      sessionId: this.sessionId,
      sessionKey: this.sessionKey
    });
    return this.makeRequest(msg).pipe(operators_1.map(res => {
      if (ServerMessage_1.isServerMessageFail(res)) {
        throw new Error(res.error || "failed to authentcate");
      }
    }));
  }

  sendIsLinked() {
    const msg = ClientMessage_1.ClientMessageIsLinked({
      id: types_1.IntNumber(this.nextReqId++),
      sessionId: this.sessionId
    });
    this.sendData(msg);
  }

  sendGetSessionConfig() {
    const msg = ClientMessage_1.ClientMessageGetSessionConfig({
      id: types_1.IntNumber(this.nextReqId++),
      sessionId: this.sessionId
    });
    this.sendData(msg);
  }

}

exports.WalletLinkConnection = WalletLinkConnection;
},{"rxjs":"../node_modules/rxjs/_esm5/index.js","rxjs/operators":"../node_modules/rxjs/_esm5/operators/index.js","../types":"../node_modules/walletlink/dist/types.js","./ClientMessage":"../node_modules/walletlink/dist/connection/ClientMessage.js","./RxWebSocket":"../node_modules/walletlink/dist/connection/RxWebSocket.js","./ServerMessage":"../node_modules/walletlink/dist/connection/ServerMessage.js"}],"../node_modules/walletlink/dist/relay/aes256gcm.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decrypt = exports.encrypt = void 0;

const util_1 = require("../util");

const rxjs_1 = require("rxjs");
/**
 *
 * @param plainText string to be encrypted
 * @param secret hex representation of 32-byte secret
 * returns hex string representation of bytes in the order: initialization vector (iv),
 * auth tag, encrypted plaintext. IV is 12 bytes. Auth tag is 16 bytes. Remaining bytes are the
 * encrypted plainText.
 */


async function encrypt(plainText, secret) {
  if (secret.length !== 64) throw Error(`secret must be 256 bits`);
  const ivBytes = crypto.getRandomValues(new Uint8Array(12));
  const secretKey = await crypto.subtle.importKey("raw", util_1.hexStringToUint8Array(secret), {
    "name": "aes-gcm"
  }, false, ["encrypt", "decrypt"]);
  const enc = new TextEncoder(); // Will return encrypted plainText with auth tag (ie MAC or checksum) appended at the end

  const encryptedResult = await window.crypto.subtle.encrypt({
    name: "AES-GCM",
    iv: ivBytes
  }, secretKey, enc.encode(plainText));
  const tagLength = 16;
  const authTag = encryptedResult.slice(encryptedResult.byteLength - tagLength);
  const encryptedPlaintext = encryptedResult.slice(0, encryptedResult.byteLength - tagLength);
  const authTagBytes = new Uint8Array(authTag);
  const encryptedPlaintextBytes = new Uint8Array(encryptedPlaintext);
  const concatted = new Uint8Array([...ivBytes, ...authTagBytes, ...encryptedPlaintextBytes]);
  return util_1.uint8ArrayToHex(concatted);
}

exports.encrypt = encrypt;
/**
 *
 * @param cipherText hex string representation of bytes in the order: initialization vector (iv),
 * auth tag, encrypted plaintext. IV is 12 bytes. Auth tag is 16 bytes.
 * @param secret hex string representation of 32-byte secret
 */

function decrypt(cipherText, secret) {
  if (secret.length !== 64) throw Error(`secret must be 256 bits`);
  return new rxjs_1.Observable(subscriber => {
    (async () => {
      const secretKey = await crypto.subtle.importKey("raw", util_1.hexStringToUint8Array(secret), {
        "name": "aes-gcm"
      }, false, ["encrypt", "decrypt"]);
      const encrypted = util_1.hexStringToUint8Array(cipherText);
      const ivBytes = encrypted.slice(0, 12);
      const authTagBytes = encrypted.slice(12, 28);
      const encryptedPlaintextBytes = encrypted.slice(28);
      const concattedBytes = new Uint8Array([...encryptedPlaintextBytes, ...authTagBytes]);
      const algo = {
        name: "AES-GCM",
        iv: new Uint8Array(ivBytes)
      };
      const decrypted = await window.crypto.subtle.decrypt(algo, secretKey, concattedBytes);
      const decoder = new TextDecoder();
      subscriber.next(decoder.decode(decrypted));
      subscriber.complete();
    })();
  });
}

exports.decrypt = decrypt;
},{"../util":"../node_modules/walletlink/dist/util.js","rxjs":"../node_modules/rxjs/_esm5/index.js"}],"../node_modules/js-sha256/src/sha256.js":[function(require,module,exports) {
var process = require("process");
var global = arguments[3];
var define;
var Buffer = require("buffer").Buffer;
/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.9.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
/*jslint bitwise: true */
(function () {
  'use strict';

  var ERROR = 'input is invalid type';
  var WINDOW = typeof window === 'object';
  var root = WINDOW ? window : {};
  if (root.JS_SHA256_NO_WINDOW) {
    WINDOW = false;
  }
  var WEB_WORKER = !WINDOW && typeof self === 'object';
  var NODE_JS = !root.JS_SHA256_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
  if (NODE_JS) {
    root = global;
  } else if (WEB_WORKER) {
    root = self;
  }
  var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && typeof module === 'object' && module.exports;
  var AMD = typeof define === 'function' && define.amd;
  var ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
  var HEX_CHARS = '0123456789abcdef'.split('');
  var EXTRA = [-2147483648, 8388608, 32768, 128];
  var SHIFT = [24, 16, 8, 0];
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  var OUTPUT_TYPES = ['hex', 'array', 'digest', 'arrayBuffer'];

  var blocks = [];

  if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
    Array.isArray = function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  }

  if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
    ArrayBuffer.isView = function (obj) {
      return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
    };
  }

  var createOutputMethod = function (outputType, is224) {
    return function (message) {
      return new Sha256(is224, true).update(message)[outputType]();
    };
  };

  var createMethod = function (is224) {
    var method = createOutputMethod('hex', is224);
    if (NODE_JS) {
      method = nodeWrap(method, is224);
    }
    method.create = function () {
      return new Sha256(is224);
    };
    method.update = function (message) {
      return method.create().update(message);
    };
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createOutputMethod(type, is224);
    }
    return method;
  };

  var nodeWrap = function (method, is224) {
    var crypto = eval("require('crypto')");
    var Buffer = eval("require('buffer').Buffer");
    var algorithm = is224 ? 'sha224' : 'sha256';
    var nodeMethod = function (message) {
      if (typeof message === 'string') {
        return crypto.createHash(algorithm).update(message, 'utf8').digest('hex');
      } else {
        if (message === null || message === undefined) {
          throw new Error(ERROR);
        } else if (message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        }
      }
      if (Array.isArray(message) || ArrayBuffer.isView(message) ||
        message.constructor === Buffer) {
        return crypto.createHash(algorithm).update(new Buffer(message)).digest('hex');
      } else {
        return method(message);
      }
    };
    return nodeMethod;
  };

  var createHmacOutputMethod = function (outputType, is224) {
    return function (key, message) {
      return new HmacSha256(key, is224, true).update(message)[outputType]();
    };
  };

  var createHmacMethod = function (is224) {
    var method = createHmacOutputMethod('hex', is224);
    method.create = function (key) {
      return new HmacSha256(key, is224);
    };
    method.update = function (key, message) {
      return method.create(key).update(message);
    };
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createHmacOutputMethod(type, is224);
    }
    return method;
  };

  function Sha256(is224, sharedMemory) {
    if (sharedMemory) {
      blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      this.blocks = blocks;
    } else {
      this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    if (is224) {
      this.h0 = 0xc1059ed8;
      this.h1 = 0x367cd507;
      this.h2 = 0x3070dd17;
      this.h3 = 0xf70e5939;
      this.h4 = 0xffc00b31;
      this.h5 = 0x68581511;
      this.h6 = 0x64f98fa7;
      this.h7 = 0xbefa4fa4;
    } else { // 256
      this.h0 = 0x6a09e667;
      this.h1 = 0xbb67ae85;
      this.h2 = 0x3c6ef372;
      this.h3 = 0xa54ff53a;
      this.h4 = 0x510e527f;
      this.h5 = 0x9b05688c;
      this.h6 = 0x1f83d9ab;
      this.h7 = 0x5be0cd19;
    }

    this.block = this.start = this.bytes = this.hBytes = 0;
    this.finalized = this.hashed = false;
    this.first = true;
    this.is224 = is224;
  }

  Sha256.prototype.update = function (message) {
    if (this.finalized) {
      return;
    }
    var notString, type = typeof message;
    if (type !== 'string') {
      if (type === 'object') {
        if (message === null) {
          throw new Error(ERROR);
        } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        } else if (!Array.isArray(message)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
            throw new Error(ERROR);
          }
        }
      } else {
        throw new Error(ERROR);
      }
      notString = true;
    }
    var code, index = 0, i, length = message.length, blocks = this.blocks;

    while (index < length) {
      if (this.hashed) {
        this.hashed = false;
        blocks[0] = this.block;
        blocks[16] = blocks[1] = blocks[2] = blocks[3] =
          blocks[4] = blocks[5] = blocks[6] = blocks[7] =
          blocks[8] = blocks[9] = blocks[10] = blocks[11] =
          blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      }

      if (notString) {
        for (i = this.start; index < length && i < 64; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.start; index < length && i < 64; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          }
        }
      }

      this.lastByteIndex = i;
      this.bytes += i - this.start;
      if (i >= 64) {
        this.block = blocks[16];
        this.start = i - 64;
        this.hash();
        this.hashed = true;
      } else {
        this.start = i;
      }
    }
    if (this.bytes > 4294967295) {
      this.hBytes += this.bytes / 4294967296 << 0;
      this.bytes = this.bytes % 4294967296;
    }
    return this;
  };

  Sha256.prototype.finalize = function () {
    if (this.finalized) {
      return;
    }
    this.finalized = true;
    var blocks = this.blocks, i = this.lastByteIndex;
    blocks[16] = this.block;
    blocks[i >> 2] |= EXTRA[i & 3];
    this.block = blocks[16];
    if (i >= 56) {
      if (!this.hashed) {
        this.hash();
      }
      blocks[0] = this.block;
      blocks[16] = blocks[1] = blocks[2] = blocks[3] =
        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
    }
    blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
    blocks[15] = this.bytes << 3;
    this.hash();
  };

  Sha256.prototype.hash = function () {
    var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6,
      h = this.h7, blocks = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;

    for (j = 16; j < 64; ++j) {
      // rightrotate
      t1 = blocks[j - 15];
      s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
      t1 = blocks[j - 2];
      s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
      blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
    }

    bc = b & c;
    for (j = 0; j < 64; j += 4) {
      if (this.first) {
        if (this.is224) {
          ab = 300032;
          t1 = blocks[0] - 1413257819;
          h = t1 - 150054599 << 0;
          d = t1 + 24177077 << 0;
        } else {
          ab = 704751109;
          t1 = blocks[0] - 210244248;
          h = t1 - 1521486534 << 0;
          d = t1 + 143694565 << 0;
        }
        this.first = false;
      } else {
        s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        ab = a & b;
        maj = ab ^ (a & c) ^ bc;
        ch = (e & f) ^ (~e & g);
        t1 = h + s1 + ch + K[j] + blocks[j];
        t2 = s0 + maj;
        h = d + t1 << 0;
        d = t1 + t2 << 0;
      }
      s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
      s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
      da = d & a;
      maj = da ^ (d & b) ^ ab;
      ch = (h & e) ^ (~h & f);
      t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
      t2 = s0 + maj;
      g = c + t1 << 0;
      c = t1 + t2 << 0;
      s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
      s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
      cd = c & d;
      maj = cd ^ (c & a) ^ da;
      ch = (g & h) ^ (~g & e);
      t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
      t2 = s0 + maj;
      f = b + t1 << 0;
      b = t1 + t2 << 0;
      s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
      s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
      bc = b & c;
      maj = bc ^ (b & d) ^ cd;
      ch = (f & g) ^ (~f & h);
      t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
      t2 = s0 + maj;
      e = a + t1 << 0;
      a = t1 + t2 << 0;
    }

    this.h0 = this.h0 + a << 0;
    this.h1 = this.h1 + b << 0;
    this.h2 = this.h2 + c << 0;
    this.h3 = this.h3 + d << 0;
    this.h4 = this.h4 + e << 0;
    this.h5 = this.h5 + f << 0;
    this.h6 = this.h6 + g << 0;
    this.h7 = this.h7 + h << 0;
  };

  Sha256.prototype.hex = function () {
    this.finalize();

    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
      h6 = this.h6, h7 = this.h7;

    var hex = HEX_CHARS[(h0 >> 28) & 0x0F] + HEX_CHARS[(h0 >> 24) & 0x0F] +
      HEX_CHARS[(h0 >> 20) & 0x0F] + HEX_CHARS[(h0 >> 16) & 0x0F] +
      HEX_CHARS[(h0 >> 12) & 0x0F] + HEX_CHARS[(h0 >> 8) & 0x0F] +
      HEX_CHARS[(h0 >> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
      HEX_CHARS[(h1 >> 28) & 0x0F] + HEX_CHARS[(h1 >> 24) & 0x0F] +
      HEX_CHARS[(h1 >> 20) & 0x0F] + HEX_CHARS[(h1 >> 16) & 0x0F] +
      HEX_CHARS[(h1 >> 12) & 0x0F] + HEX_CHARS[(h1 >> 8) & 0x0F] +
      HEX_CHARS[(h1 >> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
      HEX_CHARS[(h2 >> 28) & 0x0F] + HEX_CHARS[(h2 >> 24) & 0x0F] +
      HEX_CHARS[(h2 >> 20) & 0x0F] + HEX_CHARS[(h2 >> 16) & 0x0F] +
      HEX_CHARS[(h2 >> 12) & 0x0F] + HEX_CHARS[(h2 >> 8) & 0x0F] +
      HEX_CHARS[(h2 >> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
      HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F] +
      HEX_CHARS[(h3 >> 20) & 0x0F] + HEX_CHARS[(h3 >> 16) & 0x0F] +
      HEX_CHARS[(h3 >> 12) & 0x0F] + HEX_CHARS[(h3 >> 8) & 0x0F] +
      HEX_CHARS[(h3 >> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
      HEX_CHARS[(h4 >> 28) & 0x0F] + HEX_CHARS[(h4 >> 24) & 0x0F] +
      HEX_CHARS[(h4 >> 20) & 0x0F] + HEX_CHARS[(h4 >> 16) & 0x0F] +
      HEX_CHARS[(h4 >> 12) & 0x0F] + HEX_CHARS[(h4 >> 8) & 0x0F] +
      HEX_CHARS[(h4 >> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F] +
      HEX_CHARS[(h5 >> 28) & 0x0F] + HEX_CHARS[(h5 >> 24) & 0x0F] +
      HEX_CHARS[(h5 >> 20) & 0x0F] + HEX_CHARS[(h5 >> 16) & 0x0F] +
      HEX_CHARS[(h5 >> 12) & 0x0F] + HEX_CHARS[(h5 >> 8) & 0x0F] +
      HEX_CHARS[(h5 >> 4) & 0x0F] + HEX_CHARS[h5 & 0x0F] +
      HEX_CHARS[(h6 >> 28) & 0x0F] + HEX_CHARS[(h6 >> 24) & 0x0F] +
      HEX_CHARS[(h6 >> 20) & 0x0F] + HEX_CHARS[(h6 >> 16) & 0x0F] +
      HEX_CHARS[(h6 >> 12) & 0x0F] + HEX_CHARS[(h6 >> 8) & 0x0F] +
      HEX_CHARS[(h6 >> 4) & 0x0F] + HEX_CHARS[h6 & 0x0F];
    if (!this.is224) {
      hex += HEX_CHARS[(h7 >> 28) & 0x0F] + HEX_CHARS[(h7 >> 24) & 0x0F] +
        HEX_CHARS[(h7 >> 20) & 0x0F] + HEX_CHARS[(h7 >> 16) & 0x0F] +
        HEX_CHARS[(h7 >> 12) & 0x0F] + HEX_CHARS[(h7 >> 8) & 0x0F] +
        HEX_CHARS[(h7 >> 4) & 0x0F] + HEX_CHARS[h7 & 0x0F];
    }
    return hex;
  };

  Sha256.prototype.toString = Sha256.prototype.hex;

  Sha256.prototype.digest = function () {
    this.finalize();

    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
      h6 = this.h6, h7 = this.h7;

    var arr = [
      (h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, h0 & 0xFF,
      (h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,
      (h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,
      (h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,
      (h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF,
      (h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, h5 & 0xFF,
      (h6 >> 24) & 0xFF, (h6 >> 16) & 0xFF, (h6 >> 8) & 0xFF, h6 & 0xFF
    ];
    if (!this.is224) {
      arr.push((h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, h7 & 0xFF);
    }
    return arr;
  };

  Sha256.prototype.array = Sha256.prototype.digest;

  Sha256.prototype.arrayBuffer = function () {
    this.finalize();

    var buffer = new ArrayBuffer(this.is224 ? 28 : 32);
    var dataView = new DataView(buffer);
    dataView.setUint32(0, this.h0);
    dataView.setUint32(4, this.h1);
    dataView.setUint32(8, this.h2);
    dataView.setUint32(12, this.h3);
    dataView.setUint32(16, this.h4);
    dataView.setUint32(20, this.h5);
    dataView.setUint32(24, this.h6);
    if (!this.is224) {
      dataView.setUint32(28, this.h7);
    }
    return buffer;
  };

  function HmacSha256(key, is224, sharedMemory) {
    var i, type = typeof key;
    if (type === 'string') {
      var bytes = [], length = key.length, index = 0, code;
      for (i = 0; i < length; ++i) {
        code = key.charCodeAt(i);
        if (code < 0x80) {
          bytes[index++] = code;
        } else if (code < 0x800) {
          bytes[index++] = (0xc0 | (code >> 6));
          bytes[index++] = (0x80 | (code & 0x3f));
        } else if (code < 0xd800 || code >= 0xe000) {
          bytes[index++] = (0xe0 | (code >> 12));
          bytes[index++] = (0x80 | ((code >> 6) & 0x3f));
          bytes[index++] = (0x80 | (code & 0x3f));
        } else {
          code = 0x10000 + (((code & 0x3ff) << 10) | (key.charCodeAt(++i) & 0x3ff));
          bytes[index++] = (0xf0 | (code >> 18));
          bytes[index++] = (0x80 | ((code >> 12) & 0x3f));
          bytes[index++] = (0x80 | ((code >> 6) & 0x3f));
          bytes[index++] = (0x80 | (code & 0x3f));
        }
      }
      key = bytes;
    } else {
      if (type === 'object') {
        if (key === null) {
          throw new Error(ERROR);
        } else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
          key = new Uint8Array(key);
        } else if (!Array.isArray(key)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
            throw new Error(ERROR);
          }
        }
      } else {
        throw new Error(ERROR);
      }
    }

    if (key.length > 64) {
      key = (new Sha256(is224, true)).update(key).array();
    }

    var oKeyPad = [], iKeyPad = [];
    for (i = 0; i < 64; ++i) {
      var b = key[i] || 0;
      oKeyPad[i] = 0x5c ^ b;
      iKeyPad[i] = 0x36 ^ b;
    }

    Sha256.call(this, is224, sharedMemory);

    this.update(iKeyPad);
    this.oKeyPad = oKeyPad;
    this.inner = true;
    this.sharedMemory = sharedMemory;
  }
  HmacSha256.prototype = new Sha256();

  HmacSha256.prototype.finalize = function () {
    Sha256.prototype.finalize.call(this);
    if (this.inner) {
      this.inner = false;
      var innerHash = this.array();
      Sha256.call(this, this.is224, this.sharedMemory);
      this.update(this.oKeyPad);
      this.update(innerHash);
      Sha256.prototype.finalize.call(this);
    }
  };

  var exports = createMethod();
  exports.sha256 = exports;
  exports.sha224 = createMethod(true);
  exports.sha256.hmac = createHmacMethod();
  exports.sha224.hmac = createHmacMethod(true);

  if (COMMON_JS) {
    module.exports = exports;
  } else {
    root.sha256 = exports.sha256;
    root.sha224 = exports.sha224;
    if (AMD) {
      define(function () {
        return exports;
      });
    }
  }
})();

},{"process":"../node_modules/process/browser.js","buffer":"../node_modules/node-libs-browser/node_modules/buffer/index.js"}],"../node_modules/walletlink/dist/relay/Session.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Session = void 0;

const rxjs_1 = require("rxjs");

const operators_1 = require("rxjs/operators");

const util_1 = require("../util");

const js_sha256_1 = require("js-sha256");

const STORAGE_KEY_SESSION_ID = "session:id";
const STORAGE_KEY_SESSION_SECRET = "session:secret";
const STORAGE_KEY_SESSION_LINKED = "session:linked";

class Session {
  constructor(storage, id, secret, linked) {
    this._storage = storage;
    this._id = id || util_1.randomBytesHex(16);
    this._secret = secret || util_1.randomBytesHex(32);
    const hash = js_sha256_1.sha256.create();
    hash.update(`${this._id}, ${this._secret} WalletLink`);
    this._key = hash.hex();
    this._linked = !!linked;
  }

  static load(storage) {
    const id = storage.getItem(STORAGE_KEY_SESSION_ID);
    const linked = storage.getItem(STORAGE_KEY_SESSION_LINKED);
    const secret = storage.getItem(STORAGE_KEY_SESSION_SECRET);

    if (id && secret) {
      return new Session(storage, id, secret, linked === "1");
    }

    return null;
  }

  static clear(storage) {
    storage.removeItem(STORAGE_KEY_SESSION_SECRET);
    storage.removeItem(STORAGE_KEY_SESSION_ID);
    storage.removeItem(STORAGE_KEY_SESSION_LINKED);
  }

  static get persistedSessionIdChange$() {
    return rxjs_1.fromEvent(window, "storage").pipe(operators_1.filter(evt => evt.key === STORAGE_KEY_SESSION_ID), operators_1.map(evt => ({
      oldValue: evt.oldValue || null,
      newValue: evt.newValue || null
    })));
  }

  get id() {
    return this._id;
  }

  get secret() {
    return this._secret;
  }

  get key() {
    return this._key;
  }

  get linked() {
    return this._linked;
  }

  set linked(val) {
    this._linked = val;
    this.persistLinked();
  }

  save() {
    this._storage.setItem(STORAGE_KEY_SESSION_ID, this._id);

    this._storage.setItem(STORAGE_KEY_SESSION_SECRET, this._secret);

    this.persistLinked();
    return this;
  }

  persistLinked() {
    this._storage.setItem(STORAGE_KEY_SESSION_LINKED, this._linked ? "1" : "0");
  }

}

exports.Session = Session;
},{"rxjs":"../node_modules/rxjs/_esm5/index.js","rxjs/operators":"../node_modules/rxjs/_esm5/operators/index.js","../util":"../node_modules/walletlink/dist/util.js","js-sha256":"../node_modules/js-sha256/src/sha256.js"}],"../node_modules/walletlink/dist/relay/Web3Method.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Web3Method = void 0;
var Web3Method;

(function (Web3Method) {
  Web3Method["requestEthereumAccounts"] = "requestEthereumAccounts";
  Web3Method["signEthereumMessage"] = "signEthereumMessage";
  Web3Method["signEthereumTransaction"] = "signEthereumTransaction";
  Web3Method["submitEthereumTransaction"] = "submitEthereumTransaction";
  Web3Method["ethereumAddressFromSignedMessage"] = "ethereumAddressFromSignedMessage";
  Web3Method["scanQRCode"] = "scanQRCode";
  Web3Method["arbitrary"] = "arbitrary";
  Web3Method["childRequestEthereumAccounts"] = "childRequestEthereumAccounts";
  Web3Method["addEthereumChain"] = "addEthereumChain";
  Web3Method["switchEthereumChain"] = "switchEthereumChain";
})(Web3Method = exports.Web3Method || (exports.Web3Method = {}));
},{}],"../node_modules/walletlink/dist/relay/RelayMessage.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelayMessageType = void 0;
var RelayMessageType;

(function (RelayMessageType) {
  RelayMessageType["SESSION_ID_REQUEST"] = "SESSION_ID_REQUEST";
  RelayMessageType["SESSION_ID_RESPONSE"] = "SESSION_ID_RESPONSE";
  RelayMessageType["LINKED"] = "LINKED";
  RelayMessageType["UNLINKED"] = "UNLINKED";
  RelayMessageType["WEB3_REQUEST"] = "WEB3_REQUEST";
  RelayMessageType["WEB3_REQUEST_CANCELED"] = "WEB3_REQUEST_CANCELED";
  RelayMessageType["WEB3_RESPONSE"] = "WEB3_RESPONSE";
})(RelayMessageType = exports.RelayMessageType || (exports.RelayMessageType = {}));
},{}],"../node_modules/walletlink/dist/relay/Web3RequestCanceledMessage.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Web3RequestCanceledMessage = void 0;

const RelayMessage_1 = require("./RelayMessage");

function Web3RequestCanceledMessage(id) {
  return {
    type: RelayMessage_1.RelayMessageType.WEB3_REQUEST_CANCELED,
    id
  };
}

exports.Web3RequestCanceledMessage = Web3RequestCanceledMessage;
},{"./RelayMessage":"../node_modules/walletlink/dist/relay/RelayMessage.js"}],"../node_modules/walletlink/dist/relay/Web3RequestMessage.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Web3RequestMessage = void 0;

const RelayMessage_1 = require("./RelayMessage");

function Web3RequestMessage(params) {
  return Object.assign({
    type: RelayMessage_1.RelayMessageType.WEB3_REQUEST
  }, params);
}

exports.Web3RequestMessage = Web3RequestMessage;
},{"./RelayMessage":"../node_modules/walletlink/dist/relay/RelayMessage.js"}],"../node_modules/walletlink/dist/relay/Web3Response.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChildRequestEthereumAccountsResponse = exports.isRequestEthereumAccountsResponse = exports.RequestEthereumAccountsResponse = exports.SwitchEthereumChainResponse = exports.ErrorResponse = void 0;

const Web3Method_1 = require("./Web3Method");

function ErrorResponse(method, errorMessage) {
  return {
    method,
    errorMessage
  };
}

exports.ErrorResponse = ErrorResponse;

function SwitchEthereumChainResponse(isApproved) {
  return {
    method: Web3Method_1.Web3Method.switchEthereumChain,
    result: isApproved
  };
}

exports.SwitchEthereumChainResponse = SwitchEthereumChainResponse;

function RequestEthereumAccountsResponse(addresses) {
  return {
    method: Web3Method_1.Web3Method.requestEthereumAccounts,
    result: addresses
  };
}

exports.RequestEthereumAccountsResponse = RequestEthereumAccountsResponse;

function isRequestEthereumAccountsResponse(res) {
  return res && res.method === Web3Method_1.Web3Method.requestEthereumAccounts;
}

exports.isRequestEthereumAccountsResponse = isRequestEthereumAccountsResponse;

function ChildRequestEthereumAccountsResponse(result) {
  return {
    method: Web3Method_1.Web3Method.childRequestEthereumAccounts,
    result
  };
}

exports.ChildRequestEthereumAccountsResponse = ChildRequestEthereumAccountsResponse;
},{"./Web3Method":"../node_modules/walletlink/dist/relay/Web3Method.js"}],"../node_modules/walletlink/dist/relay/Web3ResponseMessage.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isWeb3ResponseMessage = exports.Web3ResponseMessage = void 0;

const RelayMessage_1 = require("./RelayMessage");

function Web3ResponseMessage(params) {
  return Object.assign({
    type: RelayMessage_1.RelayMessageType.WEB3_RESPONSE
  }, params);
}

exports.Web3ResponseMessage = Web3ResponseMessage;

function isWeb3ResponseMessage(msg) {
  return msg && msg.type === RelayMessage_1.RelayMessageType.WEB3_RESPONSE;
}

exports.isWeb3ResponseMessage = isWeb3ResponseMessage;
},{"./RelayMessage":"../node_modules/walletlink/dist/relay/RelayMessage.js"}],"../node_modules/walletlink/dist/relay/WalletLinkRelayAbstract.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WalletLinkRelayAbstract = exports.WALLET_USER_NAME_KEY = void 0;
exports.WALLET_USER_NAME_KEY = "walletUsername";

class WalletLinkRelayAbstract {}

exports.WalletLinkRelayAbstract = WalletLinkRelayAbstract;
},{}],"../node_modules/walletlink/dist/relay/WalletLinkRelay.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function () {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);

  __setModuleDefault(result, mod);

  return result;
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WalletLinkRelay = void 0;

const bind_decorator_1 = __importDefault(require("bind-decorator"));

const rxjs_1 = require("rxjs");

const operators_1 = require("rxjs/operators");

const WalletLinkConnection_1 = require("../connection/WalletLinkConnection");

const util_1 = require("../util");

const aes256gcm = __importStar(require("./aes256gcm"));

const Session_1 = require("./Session");

const Web3Method_1 = require("./Web3Method");

const Web3RequestCanceledMessage_1 = require("./Web3RequestCanceledMessage");

const Web3RequestMessage_1 = require("./Web3RequestMessage");

const Web3Response_1 = require("./Web3Response");

const Web3ResponseMessage_1 = require("./Web3ResponseMessage");

const WalletLinkRelayAbstract_1 = require("./WalletLinkRelayAbstract");

class WalletLinkRelay {
  constructor(options) {
    this.accountsCallback = null;
    this.chainIdCallback = null;
    this.jsonRpcUrlCallback = null;
    this.appName = "";
    this.appLogoUrl = null;
    this.walletLinkUrl = options.walletLinkUrl;
    this.storage = options.storage;
    this.session = Session_1.Session.load(options.storage) || new Session_1.Session(options.storage).save();
    this.relayEventManager = options.relayEventManager;
    this.connection = new WalletLinkConnection_1.WalletLinkConnection(this.session.id, this.session.key, this.walletLinkUrl);
    this.connection.incomingEvent$.pipe(operators_1.filter(m => m.event === "Web3Response")).subscribe({
      next: this.handleIncomingEvent
    }); // if session is marked destroyed, reset and reload

    this.connection.sessionConfig$.pipe(operators_1.filter(c => !!c.metadata && c.metadata.__destroyed === "1")).subscribe({
      next: this.resetAndReload
    });
    this.connection.sessionConfig$.pipe(operators_1.filter(c => c.metadata && c.metadata.WalletUsername !== undefined)).pipe(operators_1.mergeMap(c => aes256gcm.decrypt(c.metadata.WalletUsername, this.session.secret))).subscribe({
      next: walletUsername => {
        this.storage.setItem(WalletLinkRelayAbstract_1.WALLET_USER_NAME_KEY, walletUsername);
      }
    });
    this.connection.sessionConfig$.pipe(operators_1.filter(c => c.metadata && c.metadata.ChainId !== undefined)).pipe(operators_1.mergeMap(c => aes256gcm.decrypt(c.metadata.ChainId, this.session.secret))).pipe(operators_1.distinctUntilChanged()).subscribe({
      next: chainId => {
        if (this.chainIdCallback) {
          this.chainIdCallback(chainId);
        }
      }
    });
    this.connection.sessionConfig$.pipe(operators_1.filter(c => c.metadata && c.metadata.JsonRpcUrl !== undefined)).pipe(operators_1.mergeMap(c => aes256gcm.decrypt(c.metadata.JsonRpcUrl, this.session.secret))).pipe(operators_1.distinctUntilChanged()).subscribe({
      next: jsonRpcURl => {
        if (this.jsonRpcUrlCallback) {
          this.jsonRpcUrlCallback(jsonRpcURl);
        }
      }
    });
    this.connection.sessionConfig$.pipe(operators_1.filter(c => c.metadata && c.metadata.EthereumAddress !== undefined)).pipe(operators_1.mergeMap(c => aes256gcm.decrypt(c.metadata.EthereumAddress, this.session.secret))).subscribe({
      next: selectedAddress => {
        if (this.accountsCallback) {
          this.accountsCallback([selectedAddress]);
        }

        if (WalletLinkRelay.accountRequestCallbackIds.size > 0) {
          // We get the ethereum address from the metadata.  If for whatever
          // reason we don't get a response via an explicit web3 message
          // we can still fulfill the eip1102 request.
          Array.from(WalletLinkRelay.accountRequestCallbackIds.values()).forEach(id => {
            const message = Web3ResponseMessage_1.Web3ResponseMessage({
              id,
              response: Web3Response_1.RequestEthereumAccountsResponse([selectedAddress])
            });
            this.invokeCallback(Object.assign(Object.assign({}, message), {
              id
            }));
          });
          WalletLinkRelay.accountRequestCallbackIds.clear();
        }
      }
    });
    this.ui = options.walletLinkUIConstructor({
      walletLinkUrl: options.walletLinkUrl,
      version: options.version,
      darkMode: options.darkMode,
      session: this.session,
      connected$: this.connection.connected$
    });
    this.connection.connect();
  }

  attachUI() {
    this.ui.attach();
  }

  resetAndReload() {
    this.connection.setSessionMetadata("__destroyed", "1").pipe(operators_1.timeout(1000), operators_1.catchError(_ => rxjs_1.of(null))).subscribe(_ => {
      this.connection.destroy();
      this.storage.clear();
      this.ui.reloadUI();
    });
  }

  setAppInfo(appName, appLogoUrl) {
    this.appName = appName;
    this.appLogoUrl = appLogoUrl;
  }

  getStorageItem(key) {
    return this.storage.getItem(key);
  }

  setStorageItem(key, value) {
    this.storage.setItem(key, value);
  }

  childRequestEthereumAccounts(childSessionId, childSessionSecret, dappName, dappLogoURL, dappURL) {
    return this.sendChildRequest({
      method: Web3Method_1.Web3Method.childRequestEthereumAccounts,
      params: {
        sessionId: childSessionId,
        sessionSecret: childSessionSecret,
        appName: dappName,
        appLogoURL: dappLogoURL,
        appURL: dappURL
      }
    });
  }

  requestEthereumAccounts() {
    return this.sendRequest({
      method: Web3Method_1.Web3Method.requestEthereumAccounts,
      params: {
        appName: this.appName,
        appLogoUrl: this.appLogoUrl || null
      }
    });
  }

  signEthereumMessage(message, address, addPrefix, typedDataJson) {
    return this.sendRequest({
      method: Web3Method_1.Web3Method.signEthereumMessage,
      params: {
        message: util_1.hexStringFromBuffer(message, true),
        address,
        addPrefix,
        typedDataJson: typedDataJson || null
      }
    });
  }

  ethereumAddressFromSignedMessage(message, signature, addPrefix) {
    return this.sendRequest({
      method: Web3Method_1.Web3Method.ethereumAddressFromSignedMessage,
      params: {
        message: util_1.hexStringFromBuffer(message, true),
        signature: util_1.hexStringFromBuffer(signature, true),
        addPrefix
      }
    });
  }

  signEthereumTransaction(params) {
    return this.sendRequest({
      method: Web3Method_1.Web3Method.signEthereumTransaction,
      params: {
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        weiValue: util_1.bigIntStringFromBN(params.weiValue),
        data: util_1.hexStringFromBuffer(params.data, true),
        nonce: params.nonce,
        gasPriceInWei: params.gasPriceInWei ? util_1.bigIntStringFromBN(params.gasPriceInWei) : null,
        maxFeePerGas: params.gasPriceInWei ? util_1.bigIntStringFromBN(params.gasPriceInWei) : null,
        maxPriorityFeePerGas: params.gasPriceInWei ? util_1.bigIntStringFromBN(params.gasPriceInWei) : null,
        gasLimit: params.gasLimit ? util_1.bigIntStringFromBN(params.gasLimit) : null,
        chainId: params.chainId,
        shouldSubmit: false
      }
    });
  }

  signAndSubmitEthereumTransaction(params) {
    return this.sendRequest({
      method: Web3Method_1.Web3Method.signEthereumTransaction,
      params: {
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        weiValue: util_1.bigIntStringFromBN(params.weiValue),
        data: util_1.hexStringFromBuffer(params.data, true),
        nonce: params.nonce,
        gasPriceInWei: params.gasPriceInWei ? util_1.bigIntStringFromBN(params.gasPriceInWei) : null,
        maxFeePerGas: params.maxFeePerGas ? util_1.bigIntStringFromBN(params.maxFeePerGas) : null,
        maxPriorityFeePerGas: params.maxPriorityFeePerGas ? util_1.bigIntStringFromBN(params.maxPriorityFeePerGas) : null,
        gasLimit: params.gasLimit ? util_1.bigIntStringFromBN(params.gasLimit) : null,
        chainId: params.chainId,
        shouldSubmit: true
      }
    });
  }

  submitEthereumTransaction(signedTransaction, chainId) {
    return this.sendRequest({
      method: Web3Method_1.Web3Method.submitEthereumTransaction,
      params: {
        signedTransaction: util_1.hexStringFromBuffer(signedTransaction, true),
        chainId
      }
    });
  }

  scanQRCode(regExp) {
    return this.sendRequest({
      method: Web3Method_1.Web3Method.scanQRCode,
      params: {
        regExp
      }
    });
  }

  arbitraryRequest(data) {
    return this.sendRequest({
      method: Web3Method_1.Web3Method.arbitrary,
      params: {
        data
      }
    });
  }

  addEthereumChain(chainId, blockExplorerUrls, chainName, iconUrls, nativeCurrency) {
    return this.sendRequest({
      method: Web3Method_1.Web3Method.addEthereumChain,
      params: {
        chainId,
        blockExplorerUrls,
        chainName,
        iconUrls,
        nativeCurrency
      }
    });
  }
  /**
   *
   * @param request a request to connect the child session using a parent session's connection
   *
   * A note on why we're not using the sendRequest method.  The sendRequest function doesn't have
   * any way to tell when a message has been sent - it either times out after 60 seconds, or
   * waits until it gets a response from the mobile client.  In the case of sending a child request,
   * we don't wait for a response from the mobile client, we continue as soon as we know the server
   * has received the message.  Hence why we have a separate method here.
   */


  sendChildRequest(request) {
    return new Promise((resolve, reject) => {
      const id = util_1.randomBytesHex(8);
      const message = Web3RequestMessage_1.Web3RequestMessage({
        id,
        request
      });
      this.publishEvent("Web3Request", message, true).subscribe({
        next: ret => {
          resolve(Web3Response_1.ChildRequestEthereumAccountsResponse(ret));
        },
        error: err => {
          reject(new Error(err.message));
        }
      });
    });
  }

  sendRequest(request) {
    return new Promise((resolve, reject) => {
      var _a;

      let hideSnackbarItem = null;
      const id = util_1.randomBytesHex(8);
      const isRequestAccounts = request.method === Web3Method_1.Web3Method.requestEthereumAccounts;
      const isSwitchEthereumChain = request.method === Web3Method_1.Web3Method.switchEthereumChain;

      const cancel = () => {
        this.publishWeb3RequestCanceledEvent(id);
        this.handleWeb3ResponseMessage(Web3ResponseMessage_1.Web3ResponseMessage({
          id,
          response: Web3Response_1.ErrorResponse(request.method, "User rejected request")
        }));
        hideSnackbarItem === null || hideSnackbarItem === void 0 ? void 0 : hideSnackbarItem();
      };

      if (isRequestAccounts) {
        const userAgent = ((_a = window === null || window === void 0 ? void 0 : window.navigator) === null || _a === void 0 ? void 0 : _a.userAgent) || null;

        if (userAgent && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
          window.location.href = `https://go.cb-w.com/xoXnYwQimhb?cb_url=${window.location.href}`;
          return;
        }

        if (this.ui.inlineAccountsResponse()) {
          const onAccounts = accounts => {
            this.handleWeb3ResponseMessage(Web3ResponseMessage_1.Web3ResponseMessage({
              id,
              response: Web3Response_1.RequestEthereumAccountsResponse(accounts)
            }));
          };

          this.ui.requestEthereumAccounts({
            onCancel: cancel,
            onAccounts
          });
        } else {
          this.ui.requestEthereumAccounts({
            onCancel: cancel
          });
        }

        WalletLinkRelay.accountRequestCallbackIds.add(id);
      } else if (request.method === Web3Method_1.Web3Method.switchEthereumChain || request.method === Web3Method_1.Web3Method.addEthereumChain) {
        const cancel = () => {
          this.handleWeb3ResponseMessage(Web3ResponseMessage_1.Web3ResponseMessage({
            id,
            response: Web3Response_1.SwitchEthereumChainResponse(false)
          }));
        };

        const approve = () => {
          this.handleWeb3ResponseMessage(Web3ResponseMessage_1.Web3ResponseMessage({
            id,
            response: Web3Response_1.SwitchEthereumChainResponse(true)
          }));
        };

        this.ui.switchEthereumChain({
          onCancel: cancel,
          onApprove: approve,
          chainId: request.params.chainId
        });

        if (!this.ui.inlineSwitchEthereumChain()) {
          hideSnackbarItem = this.ui.showConnecting({
            onCancel: cancel,
            onResetConnection: this.resetAndReload
          });
        }
      } else {
        hideSnackbarItem = this.ui.showConnecting({
          onCancel: cancel,
          onResetConnection: this.resetAndReload
        });
      }

      this.relayEventManager.callbacks.set(id, response => {
        this.ui.hideRequestEthereumAccounts();
        hideSnackbarItem === null || hideSnackbarItem === void 0 ? void 0 : hideSnackbarItem();

        if (response.errorMessage) {
          return reject(new Error(response.errorMessage));
        }

        resolve(response);
      });

      if (isRequestAccounts && this.ui.inlineAccountsResponse() || isSwitchEthereumChain && this.ui.inlineSwitchEthereumChain()) {
        return;
      }

      this.publishWeb3RequestEvent(id, request);
    });
  }

  setConnectDisabled(disabled) {
    this.ui.setConnectDisabled(disabled);
  }

  setAccountsCallback(accountsCallback) {
    this.accountsCallback = accountsCallback;
  }

  setChainIdCallback(chainIdCallback) {
    this.chainIdCallback = chainIdCallback;
  }

  setJsonRpcUrlCallback(jsonRpcUrlCallback) {
    this.jsonRpcUrlCallback = jsonRpcUrlCallback;
  }

  publishWeb3RequestEvent(id, request) {
    const message = Web3RequestMessage_1.Web3RequestMessage({
      id,
      request
    });
    this.publishEvent("Web3Request", message, true).subscribe({
      error: err => {
        this.handleWeb3ResponseMessage(Web3ResponseMessage_1.Web3ResponseMessage({
          id: message.id,
          response: {
            method: message.request.method,
            errorMessage: err.message
          }
        }));
      }
    });
  }

  publishWeb3RequestCanceledEvent(id) {
    const message = Web3RequestCanceledMessage_1.Web3RequestCanceledMessage(id);
    this.publishEvent("Web3RequestCanceled", message, false).subscribe();
  }

  publishEvent(event, message, callWebhook) {
    const secret = this.session.secret;
    return new rxjs_1.Observable(subscriber => {
      aes256gcm.encrypt(JSON.stringify(Object.assign(Object.assign({}, message), {
        origin: location.origin
      })), secret).then(encrypted => {
        subscriber.next(encrypted);
        subscriber.complete();
      });
    }).pipe(operators_1.mergeMap(encrypted => {
      return this.connection.publishEvent(event, encrypted, callWebhook);
    }));
  }

  handleIncomingEvent(event) {
    try {
      aes256gcm.decrypt(event.data, this.session.secret).pipe(operators_1.map(c => JSON.parse(c))).subscribe({
        next: json => {
          const message = Web3ResponseMessage_1.isWeb3ResponseMessage(json) ? json : null;

          if (!message) {
            return;
          }

          this.handleWeb3ResponseMessage(message);
        }
      });
    } catch (_a) {
      return;
    }
  }

  handleWeb3ResponseMessage(message) {
    const {
      response
    } = message;

    if (Web3Response_1.isRequestEthereumAccountsResponse(response)) {
      Array.from(WalletLinkRelay.accountRequestCallbackIds.values()).forEach(id => this.invokeCallback(Object.assign(Object.assign({}, message), {
        id
      })));
      WalletLinkRelay.accountRequestCallbackIds.clear();
      return;
    }

    this.invokeCallback(message);
  }

  invokeCallback(message) {
    const callback = this.relayEventManager.callbacks.get(message.id);

    if (callback) {
      callback(message.response);
      this.relayEventManager.callbacks.delete(message.id);
    }
  }

  switchEthereumChain(chainId) {
    return this.sendRequest({
      method: Web3Method_1.Web3Method.switchEthereumChain,
      params: {
        chainId
      }
    });
  }

}

WalletLinkRelay.accountRequestCallbackIds = new Set();

__decorate([bind_decorator_1.default], WalletLinkRelay.prototype, "resetAndReload", null);

__decorate([bind_decorator_1.default], WalletLinkRelay.prototype, "handleIncomingEvent", null);

exports.WalletLinkRelay = WalletLinkRelay;
},{"bind-decorator":"../node_modules/bind-decorator/index.js","rxjs":"../node_modules/rxjs/_esm5/index.js","rxjs/operators":"../node_modules/rxjs/_esm5/operators/index.js","../connection/WalletLinkConnection":"../node_modules/walletlink/dist/connection/WalletLinkConnection.js","../util":"../node_modules/walletlink/dist/util.js","./aes256gcm":"../node_modules/walletlink/dist/relay/aes256gcm.js","./Session":"../node_modules/walletlink/dist/relay/Session.js","./Web3Method":"../node_modules/walletlink/dist/relay/Web3Method.js","./Web3RequestCanceledMessage":"../node_modules/walletlink/dist/relay/Web3RequestCanceledMessage.js","./Web3RequestMessage":"../node_modules/walletlink/dist/relay/Web3RequestMessage.js","./Web3Response":"../node_modules/walletlink/dist/relay/Web3Response.js","./Web3ResponseMessage":"../node_modules/walletlink/dist/relay/Web3ResponseMessage.js","./WalletLinkRelayAbstract":"../node_modules/walletlink/dist/relay/WalletLinkRelayAbstract.js"}],"../node_modules/walletlink/dist/relay/WalletLinkRelayEventManager.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WalletLinkRelayEventManager = void 0;

const util_1 = require("../util");

class WalletLinkRelayEventManager {
  constructor() {
    this._nextRequestId = 0;
    this.callbacks = new Map();
  }

  makeRequestId() {
    // max nextId == max int32 for compatibility with mobile
    this._nextRequestId = (this._nextRequestId + 1) % 0x7fffffff;
    const id = this._nextRequestId;
    const idStr = util_1.prepend0x(id.toString(16)); // unlikely that this will ever be an issue, but just to be safe

    const callback = this.callbacks.get(idStr);

    if (callback) {
      this.callbacks.delete(idStr);
    }

    return id;
  }

}

exports.WalletLinkRelayEventManager = WalletLinkRelayEventManager;
},{"../util":"../node_modules/walletlink/dist/util.js"}],"../node_modules/walletlink/package.json":[function(require,module,exports) {
module.exports = {
  "name": "walletlink",
  "version": "2.1.11",
  "description": "WalletLink JavaScript SDK",
  "keywords": ["cipher", "cipherbrowser", "coinbase", "coinbasewallet", "eth", "ether", "ethereum", "etherium", "injection", "toshi", "wallet", "walletlink", "web3"],
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "repository": "https://github.com/walletlink/walletlink.git",
  "author": "Coinbase, Inc.",
  "license": "Apache-2.0",
  "scripts": {
    "tsc": "tsc --noEmit --pretty",
    "test": "yarn build-npm && karma start",
    "build": "node compile-assets.js && webpack --config webpack.config.js",
    "build-chrome": "webpack --config webpack.config.chrome.js",
    "build-npm": "tsc -p ./tsconfig.build.json",
    "build:dev": "export WALLETLINK_URL='http://localhost:3000'; yarn build && yarn build-chrome",
    "build:dev:watch": "nodemon -e 'ts,tsx,js,json,css,scss,svg' --ignore 'src/**/*-css.ts' --ignore 'src/**/*-svg.ts' --watch src/ --watch chrome/ --exec 'yarn build:dev'",
    "build:prod": "yarn build && yarn build-chrome && yarn build-npm && cp ./package.json ../README.md ../LICENSE build/npm && cp -a src/vendor-js build/npm/dist && sed -i.bak 's|  \"private\": true,||g' build/npm/package.json && rm -f build/npm/package.json.bak",
    "lint": "tslint -p . 'src/**/*.ts{,x}'",
    "lint:watch": "nodemon -e ts,tsx,js,json,css,scss,svg --watch src/ --exec 'yarn tsc && yarn lint'"
  },
  "dependencies": {
    "@metamask/safe-event-emitter": "2.0.0",
    "bind-decorator": "^1.0.11",
    "bn.js": "^5.1.1",
    "buffer": "^6.0.3",
    "clsx": "^1.1.0",
    "eth-block-tracker": "4.4.3",
    "eth-json-rpc-filters": "4.2.2",
    "eth-rpc-errors": "4.0.2",
    "js-sha256": "0.9.0",
    "json-rpc-engine": "6.1.0",
    "keccak": "^3.0.1",
    "preact": "^10.5.9",
    "rxjs": "^6.6.3",
    "stream-browserify": "^3.0.0",
    "util": "^0.12.4"
  },
  "devDependencies": {
    "@types/bn.js": "^4.11.6",
    "@types/node": "^14.14.20",
    "browserify": "17.0.0",
    "copy-webpack-plugin": "^6.4.1",
    "core-js": "^3.8.2",
    "jasmine": "3.8.0",
    "karma": "^6.3.2",
    "karma-browserify": "8.1.0",
    "karma-chrome-launcher": "^3.1.0",
    "karma-jasmine": "^4.0.1",
    "nodemon": "^2.0.6",
    "raw-loader": "^4.0.2",
    "regenerator-runtime": "^0.13.7",
    "rxjs-tslint": "^0.1.7",
    "sass": "^1.32.0",
    "svgo": "^1.3.2",
    "ts-jest": "^26.4.4",
    "ts-loader": "^8.0.13",
    "tslib": "^2.0.3",
    "tslint": "^6.1.3",
    "tslint-config-prettier": "^1.18.0",
    "tslint-config-security": "^1.16.0",
    "tslint-microsoft-contrib": "^6.2.0",
    "typescript": "^4.1.3",
    "watchify": "4.0.0",
    "webpack": "^5.49.0",
    "webpack-cli": "^3.3.12",
    "whatwg-fetch": "^3.5.0"
  },
  "engines": {
    "node": ">= 10.0.0"
  }
};
},{}],"../node_modules/walletlink/dist/WalletLink.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WalletLink = void 0;

const ScopedLocalStorage_1 = require("./lib/ScopedLocalStorage");

const WalletLinkProvider_1 = require("./provider/WalletLinkProvider");

const WalletLinkSdkUI_1 = require("./provider/WalletLinkSdkUI");

const WalletLinkRelay_1 = require("./relay/WalletLinkRelay");

const WalletLinkRelayEventManager_1 = require("./relay/WalletLinkRelayEventManager");

const util_1 = require("./util");

const WALLETLINK_URL = undefined || "https://www.walletlink.org";
const WALLETLINK_VERSION = undefined || require("../package.json").version || "unknown";

class WalletLink {
  /**
   * Constructor
   * @param options WalletLink options object
   */
  constructor(options) {
    this._appName = "";
    this._appLogoUrl = null;
    this._relay = null;
    this._relayEventManager = null;
    let walletLinkUrl = options.walletLinkUrl || WALLETLINK_URL;
    let walletLinkUIConstructor;

    if (!options.walletLinkUIConstructor) {
      walletLinkUIConstructor = options => new WalletLinkSdkUI_1.WalletLinkSdkUI(options);
    } else {
      walletLinkUIConstructor = options.walletLinkUIConstructor;
    }

    if (typeof options.overrideIsMetaMask === "undefined") {
      this._overrideIsMetaMask = false;
    } else {
      this._overrideIsMetaMask = options.overrideIsMetaMask;
    }

    const u = new URL(walletLinkUrl);
    const walletLinkOrigin = `${u.protocol}//${u.host}`;
    this._storage = new ScopedLocalStorage_1.ScopedLocalStorage(`-walletlink:${walletLinkOrigin}`);

    this._storage.setItem("version", WalletLink.VERSION);

    if (typeof window.walletLinkExtension !== "undefined") {
      return;
    }

    this._relayEventManager = new WalletLinkRelayEventManager_1.WalletLinkRelayEventManager();
    this._relay = new WalletLinkRelay_1.WalletLinkRelay({
      walletLinkUrl: walletLinkUrl,
      version: WALLETLINK_VERSION,
      darkMode: !!options.darkMode,
      walletLinkUIConstructor: walletLinkUIConstructor,
      storage: this._storage,
      relayEventManager: this._relayEventManager
    });
    this.setAppInfo(options.appName, options.appLogoUrl);

    this._relay.attachUI();
  }
  /**
   * Create a Web3 Provider object
   * @param jsonRpcUrl Ethereum JSON RPC URL (Default: "")
   * @param chainId Ethereum Chain ID (Default: 1)
   * @returns A Web3 Provider
   */


  makeWeb3Provider(jsonRpcUrl = "", chainId = 1) {
    if (typeof window.walletLinkExtension !== "undefined") {
      if ( //@ts-ignore
      typeof window.walletLinkExtension.isCipher !== "boolean" || //@ts-ignore
      !window.walletLinkExtension.isCipher) {
        //@ts-ignore
        window.walletLinkExtension.setProviderInfo(jsonRpcUrl, chainId);
      }

      return window.walletLinkExtension;
    }

    const relay = this._relay;

    if (!relay || !this._relayEventManager || !this._storage) {
      throw new Error("Relay not initialized, should never happen");
    }

    if (!jsonRpcUrl) relay.setConnectDisabled(true);
    return new WalletLinkProvider_1.WalletLinkProvider({
      relayProvider: () => Promise.resolve(relay),
      relayEventManager: this._relayEventManager,
      storage: this._storage,
      jsonRpcUrl,
      chainId,
      overrideIsMetaMask: this._overrideIsMetaMask
    });
  }
  /**
   * Set application information
   * @param appName Application name
   * @param appLogoUrl Application logo image URL
   */


  setAppInfo(appName, appLogoUrl) {
    var _a;

    this._appName = appName || "DApp";
    this._appLogoUrl = appLogoUrl || util_1.getFavicon();

    if (typeof window.walletLinkExtension !== "undefined") {
      if ( //@ts-ignore
      typeof window.walletLinkExtension.isCipher !== "boolean" || //@ts-ignore
      !window.walletLinkExtension.isCipher) {
        //@ts-ignore
        window.walletLinkExtension.setAppInfo(this._appName, this._appLogoUrl);
      }
    } else {
      (_a = this._relay) === null || _a === void 0 ? void 0 : _a.setAppInfo(this._appName, this._appLogoUrl);
    }
  }
  /**
   * Disconnect. After disconnecting, this will reload the web page to ensure
   * all potential stale state is cleared.
   */


  disconnect() {
    var _a;

    if (typeof window.walletLinkExtension !== "undefined") {
      window.walletLinkExtension.close();
    } else {
      (_a = this._relay) === null || _a === void 0 ? void 0 : _a.resetAndReload();
    }
  }

}

exports.WalletLink = WalletLink;
/**
 * WalletLink version
 */

WalletLink.VERSION = WALLETLINK_VERSION;
},{"./lib/ScopedLocalStorage":"../node_modules/walletlink/dist/lib/ScopedLocalStorage.js","./provider/WalletLinkProvider":"../node_modules/walletlink/dist/provider/WalletLinkProvider.js","./provider/WalletLinkSdkUI":"../node_modules/walletlink/dist/provider/WalletLinkSdkUI.js","./relay/WalletLinkRelay":"../node_modules/walletlink/dist/relay/WalletLinkRelay.js","./relay/WalletLinkRelayEventManager":"../node_modules/walletlink/dist/relay/WalletLinkRelayEventManager.js","./util":"../node_modules/walletlink/dist/util.js","../package.json":"../node_modules/walletlink/package.json"}],"../node_modules/walletlink/dist/index.js":[function(require,module,exports) {
"use strict"; // Copyright (c) 2018-2020 WalletLink.org <https://www.walletlink.org/>
// Copyright (c) 2018-2020 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WalletLink = exports.WalletLinkProvider = void 0;

const WalletLinkProvider_1 = require("./provider/WalletLinkProvider");

const WalletLink_1 = require("./WalletLink");

var WalletLinkProvider_2 = require("./provider/WalletLinkProvider");

Object.defineProperty(exports, "WalletLinkProvider", {
  enumerable: true,
  get: function () {
    return WalletLinkProvider_2.WalletLinkProvider;
  }
});

var WalletLink_2 = require("./WalletLink");

Object.defineProperty(exports, "WalletLink", {
  enumerable: true,
  get: function () {
    return WalletLink_2.WalletLink;
  }
});
exports.default = WalletLink_1.WalletLink;

if (typeof window !== "undefined") {
  window.WalletLink = WalletLink_1.WalletLink;
  window.WalletLinkProvider = WalletLinkProvider_1.WalletLinkProvider;
}
},{"./provider/WalletLinkProvider":"../node_modules/walletlink/dist/provider/WalletLinkProvider.js","./WalletLink":"../node_modules/walletlink/dist/WalletLink.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "61626" + '/');

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
//# sourceMappingURL=/dist.cd8eab38.js.map