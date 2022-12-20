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
    var _Router_instances, _Router_appName, _Router_defaultRoute, _Router_currentRoute, _Router_routes, _Router_imageBuffer, _Router_loadImage;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Router = void 0;
    class Router extends EventTarget {
        constructor(appName) {
            super();
            _Router_instances.add(this);
            _Router_appName.set(this, void 0);
            _Router_defaultRoute.set(this, void 0);
            _Router_currentRoute.set(this, void 0);
            _Router_routes.set(this, {});
            _Router_imageBuffer.set(this, {});
            __classPrivateFieldSet(this, _Router_appName, appName, "f");
        }
        addRoutes(routes) {
            Object.keys(routes).forEach(key => this.addRoute(key, routes[key]));
        }
        addRoute(name, options) {
            var _a;
            if (!__classPrivateFieldGet(this, _Router_routes, "f").hasOwnProperty(name)) {
                __classPrivateFieldSet(this, _Router_routes, { ...__classPrivateFieldGet(this, _Router_routes, "f"), [name]: { ...(options || {}) } }, "f");
                (options === null || options === void 0 ? void 0 : options.tileImages) && Object.keys(options === null || options === void 0 ? void 0 : options.tileImages).forEach(imagePath => {
                    __classPrivateFieldGet(this, _Router_instances, "m", _Router_loadImage).call(this, imagePath);
                });
                (_a = options === null || options === void 0 ? void 0 : options.gameObjects) === null || _a === void 0 ? void 0 : _a.forEach(gameObject => {
                    const { imagePath } = gameObject.getOptions();
                    if (imagePath) {
                        __classPrivateFieldGet(this, _Router_instances, "m", _Router_loadImage).call(this, imagePath);
                    }
                });
                if ((options === null || options === void 0 ? void 0 : options.default) === true || Object.keys(__classPrivateFieldGet(this, _Router_routes, "f")).length === 1) {
                    __classPrivateFieldSet(this, _Router_defaultRoute, name, "f");
                }
                return;
            }
            throw `${this.constructor.name}: The route name "${name}" has already been used`;
        }
        navigateTo(name = __classPrivateFieldGet(this, _Router_defaultRoute, "f")) {
            if (Object.keys(__classPrivateFieldGet(this, _Router_routes, "f")).length > 0) {
                if (__classPrivateFieldGet(this, _Router_routes, "f").hasOwnProperty(name)) {
                    __classPrivateFieldSet(this, _Router_currentRoute, name, "f");
                    document.title = `${__classPrivateFieldGet(this, _Router_appName, "f")}| ${name}`;
                    this.dispatchEvent(new CustomEvent("route-update", { detail: { route: name, options: __classPrivateFieldGet(this, _Router_routes, "f")[name] } }));
                    return;
                }
                throw `${this.constructor.name}: The route name "${name}" is not registered`;
            }
            throw `${this.constructor.name}: Empty routes list`;
        }
        getCurrentRoute() {
            return __classPrivateFieldGet(this, _Router_currentRoute, "f") ? [__classPrivateFieldGet(this, _Router_currentRoute, "f"), __classPrivateFieldGet(this, _Router_routes, "f")[__classPrivateFieldGet(this, _Router_currentRoute, "f")]] : null;
        }
        getGameObject(name) {
            var _a;
            const gameObjects = __classPrivateFieldGet(this, _Router_routes, "f")[__classPrivateFieldGet(this, _Router_currentRoute, "f")].gameObjects;
            return (_a = gameObjects === null || gameObjects === void 0 ? void 0 : gameObjects.filter(gameObject => gameObject.getName() === name)) !== null && _a !== void 0 ? _a : [];
        }
        getImage(path) {
            const imageData = __classPrivateFieldGet(this, _Router_imageBuffer, "f")[path];
            return new Promise((resolve, reject) => {
                if (imageData) {
                    const interval = setInterval(() => {
                        if (imageData.isLoaded) {
                            resolve(imageData.image);
                            clearInterval(interval);
                        }
                    }, 1);
                }
                else {
                    reject();
                }
            });
        }
    }
    exports.Router = Router;
    _Router_appName = new WeakMap(), _Router_defaultRoute = new WeakMap(), _Router_currentRoute = new WeakMap(), _Router_routes = new WeakMap(), _Router_imageBuffer = new WeakMap(), _Router_instances = new WeakSet(), _Router_loadImage = function _Router_loadImage(path) {
        const image = new Image();
        image.src = path;
        __classPrivateFieldGet(this, _Router_imageBuffer, "f")[path] = { isLoaded: false, image };
        image.onload = () => {
            __classPrivateFieldGet(this, _Router_imageBuffer, "f")[path].isLoaded = true;
        };
        image.onerror = () => {
            delete __classPrivateFieldGet(this, _Router_imageBuffer, "f")[path];
            throw `${this.constructor.name}: Failed to load image from this path: "${path}"`;
        };
    };
});
