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
define(["require", "exports", "./Constants", "./Router", "./Store"], function (require, exports, Constants_1, Router_1, Store_1) {
    "use strict";
    var _Game_instances, _Game_options, _Game_main, _Game_canvas, _Game_drawCanvas, _Game_resizeCanvas, _Game_render;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Game = void 0;
    class Game {
        constructor(id, appName, options) {
            _Game_instances.add(this);
            _Game_options.set(this, void 0);
            _Game_main.set(this, void 0);
            _Game_canvas.set(this, void 0);
            __classPrivateFieldSet(this, _Game_main, document.querySelector(`#${id}`), "f");
            if (!__classPrivateFieldGet(this, _Game_main, "f")) {
                throw `${this.constructor.name}: No element with id "${id}" found`;
            }
            __classPrivateFieldSet(this, _Game_options, Object.assign({}, (options || {})), "f");
            this.router = new Router_1.Router(appName);
            this.router.addEventListener("route-update", (_) => __classPrivateFieldGet(this, _Game_instances, "m", _Game_render).call(this));
            this.store = new Store_1.Store();
        }
        start() {
            if (__classPrivateFieldGet(this, _Game_canvas, "f")) {
                throw `${this.constructor.name}: Game is already running`;
            }
            if (__classPrivateFieldGet(this, _Game_main, "f")) {
                const newCanvas = document.createElement("canvas");
                __classPrivateFieldSet(this, _Game_canvas, newCanvas, "f");
                __classPrivateFieldGet(this, _Game_instances, "m", _Game_resizeCanvas).call(this);
                window.addEventListener("resize", () => __classPrivateFieldGet(this, _Game_instances, "m", _Game_resizeCanvas).call(this));
                this.router.navigateTo();
            }
            return this;
        }
        func(callback) {
            return () => {
                callback();
                __classPrivateFieldGet(this, _Game_instances, "m", _Game_render).call(this);
            };
        }
    }
    exports.Game = Game;
    _Game_options = new WeakMap(), _Game_main = new WeakMap(), _Game_canvas = new WeakMap(), _Game_instances = new WeakSet(), _Game_drawCanvas = function _Game_drawCanvas(options) {
        if (__classPrivateFieldGet(this, _Game_canvas, "f") && options) {
            const context = __classPrivateFieldGet(this, _Game_canvas, "f").getContext("2d");
            context.clearRect(0, 0, __classPrivateFieldGet(this, _Game_canvas, "f").width, __classPrivateFieldGet(this, _Game_canvas, "f").height);
            const { tilesXTotal = Constants_1.constants.TILES_X_TOTAL, tilesYTotal = Constants_1.constants.TILES_Y_TOTAL, tileHeight = Constants_1.constants.TILE_HEIGHT, tileWidth = Constants_1.constants.TILE_WIDTH, tileColor = Constants_1.constants.TILE_COLOR, position = Constants_1.constants.ROUTE_POSITION } = options;
            let positionOffset = { x: 0, y: 0 };
            if (position[0] === "center") {
                positionOffset.x = 0.5 * __classPrivateFieldGet(this, _Game_canvas, "f").width - (0.5 * tileWidth * tilesXTotal);
            }
            else if (position[0] === "right") {
                positionOffset.x = __classPrivateFieldGet(this, _Game_canvas, "f").width - (tileWidth * tilesXTotal);
            }
            if (position[1] === "center") {
                positionOffset.y = 0.5 * __classPrivateFieldGet(this, _Game_canvas, "f").height - (0.5 * tileHeight * tilesYTotal);
            }
            else if (position[1] === "bottom") {
                positionOffset.y = __classPrivateFieldGet(this, _Game_canvas, "f").height - (tileHeight * tilesYTotal);
            }
            for (let col = 0; col < tilesXTotal; col++) {
                for (let row = 0; row < tilesYTotal; row++) {
                    context.beginPath();
                    context.strokeRect(positionOffset.x + col * tileWidth, positionOffset.y + row * tileHeight, tileWidth, tileHeight);
                    context.strokeStyle = tileColor;
                }
            }
        }
        return this;
    }, _Game_resizeCanvas = function _Game_resizeCanvas() {
        if (__classPrivateFieldGet(this, _Game_main, "f") && __classPrivateFieldGet(this, _Game_canvas, "f")) {
            __classPrivateFieldGet(this, _Game_canvas, "f").height = __classPrivateFieldGet(this, _Game_main, "f").getBoundingClientRect().height;
            __classPrivateFieldGet(this, _Game_canvas, "f").width = __classPrivateFieldGet(this, _Game_main, "f").getBoundingClientRect().width;
            __classPrivateFieldGet(this, _Game_instances, "m", _Game_render).call(this);
        }
    }, _Game_render = async function _Game_render() {
        this.store.update();
        const currentRoute = this.router.getCurrentRoute();
        if (currentRoute) {
            const [route, options] = currentRoute;
            if (__classPrivateFieldGet(this, _Game_main, "f")) {
                __classPrivateFieldGet(this, _Game_main, "f").innerHTML = '';
                if (options.layoutPath) {
                    await fetch(options.layoutPath)
                        .then(data => data.text())
                        .then(res => {
                        var _a;
                        const tempElement = document.createElement("div");
                        tempElement.innerHTML = res.replace(/\{\{([a-z0-9]+)\}\}/gi, (_, key) => this.store.get(key));
                        const scripts = tempElement.querySelectorAll("script");
                        scripts.forEach(script => {
                            const newScript = document.createElement("script");
                            newScript.innerHTML = script.innerHTML;
                            tempElement.removeChild(script);
                            tempElement.appendChild(newScript);
                        });
                        (_a = __classPrivateFieldGet(this, _Game_main, "f")) === null || _a === void 0 ? void 0 : _a.append(tempElement);
                    })
                        .catch(_ => {
                        throw new Error(`${this.constructor.name}: The file "${options.layoutPath}" does not exist`);
                    });
                }
                __classPrivateFieldGet(this, _Game_canvas, "f") && __classPrivateFieldGet(this, _Game_main, "f").appendChild(__classPrivateFieldGet(this, _Game_canvas, "f"));
                __classPrivateFieldGet(this, _Game_instances, "m", _Game_drawCanvas).call(this, options);
            }
        }
    };
});
