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
            const mainElement = document.querySelector(`#${id}`);
            if (!mainElement) {
                throw `${this.constructor.name}: No element with id "${id}" found`;
            }
            __classPrivateFieldSet(this, _Game_main, mainElement, "f");
            __classPrivateFieldSet(this, _Game_options, options !== null && options !== void 0 ? options : {}, "f");
            this.router = new Router_1.Router(appName);
            this.router.addEventListener("route-update", (_) => __classPrivateFieldGet(this, _Game_instances, "m", _Game_render).call(this, true));
            this.store = new Store_1.Store();
        }
        start() {
            if (__classPrivateFieldGet(this, _Game_canvas, "f")) {
                throw `${this.constructor.name}: Game is already running`;
            }
            const newCanvas = document.createElement("canvas");
            __classPrivateFieldSet(this, _Game_canvas, newCanvas, "f");
            __classPrivateFieldGet(this, _Game_instances, "m", _Game_resizeCanvas).call(this);
            window.addEventListener("resize", () => __classPrivateFieldGet(this, _Game_instances, "m", _Game_resizeCanvas).call(this));
            this.router.navigateTo();
            return this;
        }
        updateAfter(callback) {
            const doRedrawCanvas = callback();
            __classPrivateFieldGet(this, _Game_instances, "m", _Game_render).call(this, doRedrawCanvas);
        }
    }
    exports.Game = Game;
    _Game_options = new WeakMap(), _Game_main = new WeakMap(), _Game_canvas = new WeakMap(), _Game_instances = new WeakSet(), _Game_drawCanvas = function _Game_drawCanvas(options) {
        const context = __classPrivateFieldGet(this, _Game_canvas, "f").getContext("2d");
        context.clearRect(0, 0, __classPrivateFieldGet(this, _Game_canvas, "f").width, __classPrivateFieldGet(this, _Game_canvas, "f").height);
        const { TILES_X_TOTAL, TILES_Y_TOTAL, TILE_HEIGHT, TILE_WIDTH, TILE_COLOR } = Constants_1.constants.TilesOptions;
        const { POSITION } = Constants_1.constants.RouteOptions;
        const { tilesXTotal = TILES_X_TOTAL, tilesYTotal = TILES_Y_TOTAL, tileHeight = TILE_HEIGHT, tileWidth = TILE_WIDTH, tileColor = TILE_COLOR, position = POSITION, gameObjects } = options;
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
                const tilePosition = {
                    x: positionOffset.x + col * tileWidth,
                    y: positionOffset.y + row * tileHeight
                };
                context.beginPath();
                context.fillRect(tilePosition.x, tilePosition.y, tileWidth, tileHeight);
                context.fillStyle = tileColor;
                if (gameObjects) {
                    const _gameObjects = gameObjects.filter(gameObject => {
                        const [x, y] = gameObject.getPosition();
                        return (x === col + 1) && (y === row + 1);
                    });
                    for (let gameObject of _gameObjects) {
                        const { HEIGHT, WIDTH } = Constants_1.constants.GameObjectOptions;
                        const { height = HEIGHT, width = WIDTH, imagePath } = gameObject.getOptions();
                        const image = new Image();
                        image.src = imagePath;
                        image.onload = () => {
                            context.drawImage(image, tilePosition.x + tileWidth / 2 - width / 2, tilePosition.y + tileHeight / 2 - height / 2, width, height);
                        };
                    }
                }
            }
        }
        return this;
    }, _Game_resizeCanvas = function _Game_resizeCanvas() {
        __classPrivateFieldGet(this, _Game_canvas, "f").height = __classPrivateFieldGet(this, _Game_main, "f").getBoundingClientRect().height;
        __classPrivateFieldGet(this, _Game_canvas, "f").width = __classPrivateFieldGet(this, _Game_main, "f").getBoundingClientRect().width;
        __classPrivateFieldGet(this, _Game_instances, "m", _Game_render).call(this, true);
    }, _Game_render = async function _Game_render(doRedrawCanvas = false) {
        this.store.update();
        const currentRoute = this.router.getCurrentRoute();
        if (currentRoute) {
            const [route, options] = currentRoute;
            __classPrivateFieldGet(this, _Game_main, "f").innerHTML = '';
            if (options.layoutPath) {
                await fetch(options.layoutPath)
                    .then(data => {
                    if (!data.ok) {
                        throw new Error(`${this.constructor.name}: The file "${options.layoutPath}" does not exist`);
                    }
                    return data.text();
                })
                    .then(res => {
                    const tempElement = document.createElement("div");
                    tempElement.innerHTML = res.replace(/\{\{([a-z0-9]+)\}\}/gi, (expression, key) => {
                        try {
                            return this.store.get(key);
                        }
                        catch (_) {
                            return expression;
                        }
                    });
                    const scripts = tempElement.querySelectorAll("script");
                    scripts.forEach(script => {
                        const newScript = document.createElement("script");
                        newScript.innerHTML = script.innerHTML;
                        tempElement.removeChild(script);
                        tempElement.appendChild(newScript);
                    });
                    __classPrivateFieldGet(this, _Game_main, "f").append(tempElement);
                });
            }
            __classPrivateFieldGet(this, _Game_main, "f").appendChild(__classPrivateFieldGet(this, _Game_canvas, "f"));
            doRedrawCanvas && __classPrivateFieldGet(this, _Game_instances, "m", _Game_drawCanvas).call(this, options);
        }
    };
});
