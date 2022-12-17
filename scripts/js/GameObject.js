var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    var _GameObject_name, _GameObject_position, _GameObject_options;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GameObject = void 0;
    class GameObject {
        constructor(name, position, options) {
            _GameObject_name.set(this, void 0);
            _GameObject_position.set(this, void 0); // [x, y]
            _GameObject_options.set(this, void 0);
            __classPrivateFieldSet(this, _GameObject_name, name, "f");
            __classPrivateFieldSet(this, _GameObject_position, Array.isArray(position) ? position : [position, position], "f");
            __classPrivateFieldSet(this, _GameObject_options, options, "f");
        }
        setPosition(callback) {
            const newPosition = callback(__classPrivateFieldGet(this, _GameObject_position, "f"));
            __classPrivateFieldSet(this, _GameObject_position, Array.isArray(newPosition) ? newPosition : [newPosition, newPosition], "f");
            return true;
        }
        getName() {
            return __classPrivateFieldGet(this, _GameObject_name, "f");
        }
        getPosition() {
            return __classPrivateFieldGet(this, _GameObject_position, "f");
        }
        getOptions() {
            return __classPrivateFieldGet(this, _GameObject_options, "f");
        }
    }
    exports.GameObject = GameObject;
    _GameObject_name = new WeakMap(), _GameObject_position = new WeakMap(), _GameObject_options = new WeakMap();
});
