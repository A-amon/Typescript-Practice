var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    var _Store_data, _Store_hasUpdate;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Store = void 0;
    class Store extends EventTarget {
        constructor() {
            super(...arguments);
            _Store_data.set(this, {});
            _Store_hasUpdate.set(this, false);
        }
        initialize(data) {
            if (!__classPrivateFieldGet(this, _Store_data, "f") || Object.keys(__classPrivateFieldGet(this, _Store_data, "f")).length === 0) {
                Object.keys(data).forEach(key => {
                    __classPrivateFieldGet(this, _Store_data, "f")[key] = {
                        value: data[key]
                    };
                });
                return;
            }
            throw new Error(`${this.constructor.name}: Store has been initialized`);
        }
        set(property, callback) {
            if (__classPrivateFieldGet(this, _Store_data, "f").hasOwnProperty(property)) {
                const { value, pendingValue } = __classPrivateFieldGet(this, _Store_data, "f")[property];
                const newValue = callback(pendingValue !== null && pendingValue !== void 0 ? pendingValue : value); // Provide latest value
                if (newValue !== value) {
                    __classPrivateFieldGet(this, _Store_data, "f")[property].pendingValue = newValue;
                    __classPrivateFieldSet(this, _Store_hasUpdate, true, "f");
                }
                return false;
            }
            throw new Error(`${this.constructor.name}: The data "${property}" does not exist`);
        }
        get(property) {
            if (__classPrivateFieldGet(this, _Store_data, "f").hasOwnProperty(property)) {
                return __classPrivateFieldGet(this, _Store_data, "f")[property].value;
            }
            throw new Error(`${this.constructor.name}: The data "${property}" does not exist`);
        }
        update() {
            if (__classPrivateFieldGet(this, _Store_hasUpdate, "f")) {
                Object.keys(__classPrivateFieldGet(this, _Store_data, "f")).forEach((key) => {
                    const { pendingValue, value } = __classPrivateFieldGet(this, _Store_data, "f")[key];
                    __classPrivateFieldGet(this, _Store_data, "f")[key] = { value: pendingValue !== null && pendingValue !== void 0 ? pendingValue : value };
                });
                __classPrivateFieldSet(this, _Store_hasUpdate, false, "f");
            }
        }
    }
    exports.Store = Store;
    _Store_data = new WeakMap(), _Store_hasUpdate = new WeakMap();
});
