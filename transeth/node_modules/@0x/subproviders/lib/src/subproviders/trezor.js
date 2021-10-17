"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = require("@0x/assert");
var utils_1 = require("@0x/utils");
var EthereumTx = require("ethereumjs-tx");
var _ = require("lodash");
var HDNode = require("hdkey");
var types_1 = require("../types");
var wallet_utils_1 = require("../utils/wallet_utils");
var base_wallet_subprovider_1 = require("./base_wallet_subprovider");
var PRIVATE_KEY_PATH = "44'/60'/0'/0";
var DEFAULT_NUM_ADDRESSES_TO_FETCH = 10;
var DEFAULT_ADDRESS_SEARCH_LIMIT = 1000;
var TrezorSubprovider = /** @class */ (function (_super) {
    __extends(TrezorSubprovider, _super);
    /**
     * Instantiates a TrezorSubprovider. Defaults to private key path set to `44'/60'/0'/0/`.
     * Must be initialized with trezor-connect API module https://github.com/trezor/connect.
     * @param TrezorSubprovider config object containing trezor-connect API
     * @return TrezorSubprovider instance
     */
    function TrezorSubprovider(config) {
        var _this = _super.call(this) || this;
        _this._privateKeyPath = PRIVATE_KEY_PATH;
        _this._trezorConnectClientApi = config.trezorConnectClientApi;
        _this._networkId = config.networkId;
        _this._addressSearchLimit =
            config.accountFetchingConfigs !== undefined &&
                config.accountFetchingConfigs.addressSearchLimit !== undefined
                ? config.accountFetchingConfigs.addressSearchLimit
                : DEFAULT_ADDRESS_SEARCH_LIMIT;
        return _this;
    }
    /**
     * Retrieve a users Trezor account. This method is automatically called
     * when issuing a `eth_accounts` JSON RPC request via your providerEngine
     * instance.
     * @return An array of accounts
     */
    TrezorSubprovider.prototype.getAccountsAsync = function (numberOfAccounts) {
        if (numberOfAccounts === void 0) { numberOfAccounts = DEFAULT_NUM_ADDRESSES_TO_FETCH; }
        return __awaiter(this, void 0, void 0, function () {
            var initialDerivedKeyInfo, derivedKeyInfos, accounts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._initialDerivedKeyInfoAsync()];
                    case 1:
                        initialDerivedKeyInfo = _a.sent();
                        derivedKeyInfos = wallet_utils_1.walletUtils.calculateDerivedHDKeyInfos(initialDerivedKeyInfo, numberOfAccounts);
                        accounts = _.map(derivedKeyInfos, function (k) { return k.address; });
                        return [2 /*return*/, accounts];
                }
            });
        });
    };
    /**
     * Signs a transaction on the Trezor with the account specificed by the `from` field in txParams.
     * If you've added the TrezorSubprovider to your app's provider, you can simply send an `eth_sendTransaction`
     * JSON RPC request, and this method will be called auto-magically. If you are not using this via a ProviderEngine
     * instance, you can call it directly.
     * @param txParams Parameters of the transaction to sign
     * @return Signed transaction hex string
     */
    TrezorSubprovider.prototype.signTransactionAsync = function (txData) {
        return __awaiter(this, void 0, void 0, function () {
            var initialDerivedKeyInfo, derivedKeyInfo, fullDerivationPath, response, payload, tx, vIndex, rIndex, sIndex, payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (txData.from === undefined || !utils_1.addressUtils.isAddress(txData.from)) {
                            throw new Error(types_1.WalletSubproviderErrors.FromAddressMissingOrInvalid);
                        }
                        txData.value = txData.value ? txData.value : '0x0';
                        txData.data = txData.data ? txData.data : '0x';
                        txData.gas = txData.gas ? txData.gas : '0x0';
                        txData.gasPrice = txData.gasPrice ? txData.gasPrice : '0x0';
                        return [4 /*yield*/, this._initialDerivedKeyInfoAsync()];
                    case 1:
                        initialDerivedKeyInfo = _a.sent();
                        derivedKeyInfo = this._findDerivedKeyInfoForAddress(initialDerivedKeyInfo, txData.from);
                        fullDerivationPath = derivedKeyInfo.derivationPath;
                        return [4 /*yield*/, this._trezorConnectClientApi.ethereumSignTransaction({
                                path: fullDerivationPath,
                                transaction: {
                                    to: txData.to,
                                    value: txData.value,
                                    data: txData.data,
                                    chainId: this._networkId,
                                    nonce: txData.nonce,
                                    gasLimit: txData.gas,
                                    gasPrice: txData.gasPrice,
                                },
                            })];
                    case 2:
                        response = _a.sent();
                        if (response.success) {
                            payload = response.payload;
                            tx = new EthereumTx(txData);
                            vIndex = 6;
                            tx.raw[vIndex] = Buffer.from([1]); // v
                            rIndex = 7;
                            tx.raw[rIndex] = Buffer.from([]); // r
                            sIndex = 8;
                            tx.raw[sIndex] = Buffer.from([]); // s
                            // slice off leading 0x
                            tx.v = Buffer.from(payload.v.slice(2), 'hex');
                            tx.r = Buffer.from(payload.r.slice(2), 'hex');
                            tx.s = Buffer.from(payload.s.slice(2), 'hex');
                            return [2 /*return*/, "0x" + tx.serialize().toString('hex')];
                        }
                        else {
                            payload = response.payload;
                            throw new Error(payload.error);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sign a personal Ethereum signed message. The signing account will be the account
     * associated with the provided address. If you've added the TrezorSubprovider to
     * your app's provider, you can simply send an `eth_sign` or `personal_sign` JSON RPC
     * request, and this method will be called auto-magically.
     * If you are not using this via a ProviderEngine instance, you can call it directly.
     * @param data Hex string message to sign
     * @param address Address of the account to sign with
     * @return Signature hex string (order: rsv)
     */
    TrezorSubprovider.prototype.signPersonalMessageAsync = function (data, address) {
        return __awaiter(this, void 0, void 0, function () {
            var initialDerivedKeyInfo, derivedKeyInfo, fullDerivationPath, response, payload, payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (data === undefined) {
                            throw new Error(types_1.WalletSubproviderErrors.DataMissingForSignPersonalMessage);
                        }
                        assert_1.assert.isHexString('data', data);
                        assert_1.assert.isETHAddressHex('address', address);
                        return [4 /*yield*/, this._initialDerivedKeyInfoAsync()];
                    case 1:
                        initialDerivedKeyInfo = _a.sent();
                        derivedKeyInfo = this._findDerivedKeyInfoForAddress(initialDerivedKeyInfo, address);
                        fullDerivationPath = derivedKeyInfo.derivationPath;
                        return [4 /*yield*/, this._trezorConnectClientApi.ethereumSignMessage({
                                path: fullDerivationPath,
                                message: data,
                                hex: true,
                            })];
                    case 2:
                        response = _a.sent();
                        if (response.success) {
                            payload = response.payload;
                            return [2 /*return*/, "0x" + payload.signature];
                        }
                        else {
                            payload = response.payload;
                            throw new Error(payload.error);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * TODO:: eth_signTypedData is currently not supported on Trezor devices.
     * @param address Address of the account to sign with
     * @param data the typed data object
     * @return Signature hex string (order: rsv)
     */
    // tslint:disable-next-line:prefer-function-over-method
    TrezorSubprovider.prototype.signTypedDataAsync = function (address, typedData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error(types_1.WalletSubproviderErrors.MethodNotSupported);
            });
        });
    };
    TrezorSubprovider.prototype._initialDerivedKeyInfoAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var parentKeyDerivationPath, response, payload, hdKey, address, initialDerivedKeyInfo, payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._initialDerivedKeyInfo) return [3 /*break*/, 1];
                        return [2 /*return*/, this._initialDerivedKeyInfo];
                    case 1:
                        parentKeyDerivationPath = "m/" + this._privateKeyPath;
                        return [4 /*yield*/, this._trezorConnectClientApi.getPublicKey({
                                path: parentKeyDerivationPath,
                            })];
                    case 2:
                        response = _a.sent();
                        if (response.success) {
                            payload = response.payload;
                            hdKey = new HDNode();
                            hdKey.publicKey = new Buffer(payload.publicKey, 'hex');
                            hdKey.chainCode = new Buffer(payload.chainCode, 'hex');
                            address = wallet_utils_1.walletUtils.addressOfHDKey(hdKey);
                            initialDerivedKeyInfo = {
                                hdKey: hdKey,
                                address: address,
                                derivationPath: parentKeyDerivationPath,
                                baseDerivationPath: this._privateKeyPath,
                            };
                            this._initialDerivedKeyInfo = initialDerivedKeyInfo;
                            return [2 /*return*/, initialDerivedKeyInfo];
                        }
                        else {
                            payload = response.payload;
                            throw new Error(payload.error);
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TrezorSubprovider.prototype._findDerivedKeyInfoForAddress = function (initalHDKey, address) {
        var matchedDerivedKeyInfo = wallet_utils_1.walletUtils.findDerivedKeyInfoForAddressIfExists(address, initalHDKey, this._addressSearchLimit);
        if (matchedDerivedKeyInfo === undefined) {
            throw new Error(types_1.WalletSubproviderErrors.AddressNotFound + ": " + address);
        }
        return matchedDerivedKeyInfo;
    };
    return TrezorSubprovider;
}(base_wallet_subprovider_1.BaseWalletSubprovider));
exports.TrezorSubprovider = TrezorSubprovider;
//# sourceMappingURL=trezor.js.map