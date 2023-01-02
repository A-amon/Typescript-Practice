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
    var _Game_instances, _Game_options, _Game_main, _Game_canvas, _Game_domTree, _Game_drawCanvas, _Game_resizeCanvas, _Game_render, _Game_compareAndUpdateDOMTree, _Game_parseDOMTreeToHtml, _Game_parseHTMLToDOMTree, _Game_getUpdatedDOMSlices, _Game_getDOMSlices, _Game_getDOMTree;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Game = void 0;
    class Game {
        constructor(id, appName, options) {
            _Game_instances.add(this);
            _Game_options.set(this, void 0);
            _Game_main.set(this, void 0);
            _Game_canvas.set(this, void 0);
            _Game_domTree.set(this, void 0);
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
            __classPrivateFieldGet(this, _Game_main, "f").appendChild(__classPrivateFieldGet(this, _Game_canvas, "f"));
            __classPrivateFieldGet(this, _Game_instances, "m", _Game_resizeCanvas).call(this);
            window.addEventListener("resize", () => __classPrivateFieldGet(this, _Game_instances, "m", _Game_resizeCanvas).call(this));
            this.router.navigateTo();
            return this;
        }
        updateAfter(callback) {
            const doRedrawCanvas = callback();
            __classPrivateFieldGet(this, _Game_instances, "m", _Game_render).call(this, doRedrawCanvas, true);
        }
    }
    exports.Game = Game;
    _Game_options = new WeakMap(), _Game_main = new WeakMap(), _Game_canvas = new WeakMap(), _Game_domTree = new WeakMap(), _Game_instances = new WeakSet(), _Game_drawCanvas = function _Game_drawCanvas(options) {
        const _canvas = document.createElement("canvas");
        const _context = _canvas.getContext("2d");
        _canvas.height = __classPrivateFieldGet(this, _Game_canvas, "f").height;
        _canvas.width = __classPrivateFieldGet(this, _Game_canvas, "f").width;
        let imageStack = []; // Ensure images are drawn in sequence (tile -> game object)
        const { TILES_X_TOTAL, TILES_Y_TOTAL, TILE_HEIGHT, TILE_WIDTH, TILE_COLOR } = Constants_1.constants.TilesOptions;
        const { POSITION } = Constants_1.constants.RouteOptions;
        const { tilesXTotal = TILES_X_TOTAL, tilesYTotal = TILES_Y_TOTAL, tileHeight = TILE_HEIGHT, tileWidth = TILE_WIDTH, tileColor = TILE_COLOR, tileImages = {}, position = POSITION, gameObjects } = options;
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
                _context.beginPath();
                _context.fillRect(tilePosition.x, tilePosition.y, tileWidth, tileHeight);
                _context.fillStyle = tileColor;
                // Draw tile images
                Object.keys(tileImages).forEach(imagePath => {
                    tileImages[imagePath].forEach(position => {
                        if ((position[0] === "row" && position[1] === row) ||
                            (position[0] === "column" && position[1] === col) ||
                            (position[0] === col && position[1] === row) ||
                            (position.length === 4 && (col >= position[0] && row >= position[1]) && (col <= position[2] && row <= position[3]))) {
                            imageStack.push(imagePath);
                            this.router.getImage(imagePath)
                                .then((image) => {
                                const interval = setInterval(() => {
                                    if (imageStack[0] === imagePath) { // Draw image once turn arrives
                                        _context.drawImage(image, tilePosition.x, tilePosition.y, tileWidth, tileHeight);
                                        imageStack.shift();
                                        clearInterval(interval);
                                    }
                                }, 1);
                            })
                                .catch(() => {
                                imageStack.shift();
                            });
                        }
                    });
                });
                // Draw game objects images
                if (gameObjects) {
                    const _gameObjects = gameObjects.filter(gameObject => {
                        const [x, y] = gameObject.getPosition().current;
                        return (x === col + 1) && (y === row + 1);
                    });
                    const collidableObject = _gameObjects.find(gameObject => gameObject.getOptions().isCollidable);
                    for (let gameObject of _gameObjects) {
                        const { HEIGHT, WIDTH } = Constants_1.constants.GameObjectOptions;
                        const { height = HEIGHT, width = WIDTH, imagePath, onCollide } = gameObject.getOptions();
                        const { previous, current } = gameObject.getPosition();
                        if (collidableObject && previous !== current) {
                            gameObject.setPosition(() => previous);
                            onCollide && onCollide(collidableObject.getName());
                        }
                        else {
                            imageStack.push(imagePath);
                            this.router.getImage(imagePath)
                                .then((image) => {
                                const interval = setInterval(() => {
                                    if (imageStack[0] === imagePath) { // Draw image once turn arrives
                                        _context.drawImage(image, tilePosition.x + tileWidth / 2 - width / 2, tilePosition.y + tileHeight / 2 - height / 2, width, height);
                                        imageStack.shift();
                                        clearInterval(interval);
                                    }
                                }, 1);
                            })
                                .catch(() => {
                                imageStack.shift();
                            });
                        }
                    }
                }
            }
        }
        const updateCanvasInterval = setInterval(() => {
            if (imageStack.length === 0) {
                clearInterval(updateCanvasInterval);
                __classPrivateFieldGet(this, _Game_main, "f").appendChild(_canvas);
                __classPrivateFieldGet(this, _Game_canvas, "f").remove();
                __classPrivateFieldSet(this, _Game_canvas, _canvas, "f");
            }
        }, 1);
        return this;
    }, _Game_resizeCanvas = function _Game_resizeCanvas() {
        __classPrivateFieldGet(this, _Game_canvas, "f").height = __classPrivateFieldGet(this, _Game_main, "f").getBoundingClientRect().height;
        __classPrivateFieldGet(this, _Game_canvas, "f").width = __classPrivateFieldGet(this, _Game_main, "f").getBoundingClientRect().width;
        const currentRoute = this.router.getCurrentRoute();
        currentRoute && __classPrivateFieldGet(this, _Game_instances, "m", _Game_drawCanvas).call(this, currentRoute[1]);
    }, _Game_render = async function _Game_render(doRedrawCanvas = false, isStateUpdate = false) {
        this.store.update();
        const currentRoute = this.router.getCurrentRoute();
        if (currentRoute) {
            const [_, options] = currentRoute;
            if (!isStateUpdate) {
                __classPrivateFieldGet(this, _Game_main, "f").innerHTML = "";
                if (options.layoutPath) {
                    await fetch(options.layoutPath)
                        .then(data => {
                        if (!data.ok) {
                            throw new Error(`${this.constructor.name}: The file "${options.layoutPath}" does not exist`);
                        }
                        return data.text();
                    })
                        .then(res => {
                        __classPrivateFieldSet(this, _Game_domTree, __classPrivateFieldGet(this, _Game_instances, "m", _Game_parseHTMLToDOMTree).call(this, res), "f");
                        __classPrivateFieldGet(this, _Game_main, "f").append(...__classPrivateFieldGet(this, _Game_instances, "m", _Game_parseDOMTreeToHtml).call(this, document.createElement("div"), __classPrivateFieldGet(this, _Game_domTree, "f")).children);
                        __classPrivateFieldGet(this, _Game_domTree, "f").element = __classPrivateFieldGet(this, _Game_main, "f");
                    });
                }
                __classPrivateFieldGet(this, _Game_main, "f").appendChild(__classPrivateFieldGet(this, _Game_canvas, "f"));
            }
            else {
                this.store.update();
                const newDOMTree = __classPrivateFieldGet(this, _Game_instances, "m", _Game_parseHTMLToDOMTree).call(this, __classPrivateFieldGet(this, _Game_main, "f"));
                __classPrivateFieldGet(this, _Game_instances, "m", _Game_compareAndUpdateDOMTree).call(this, __classPrivateFieldGet(this, _Game_domTree, "f"), newDOMTree);
            }
            doRedrawCanvas && __classPrivateFieldGet(this, _Game_instances, "m", _Game_drawCanvas).call(this, options);
        }
    }, _Game_compareAndUpdateDOMTree = function _Game_compareAndUpdateDOMTree(currentDOMTree, newDOMTree) {
        if (newDOMTree.type === currentDOMTree.type) {
            if (newDOMTree.type !== "root") {
                //Update states' values if element's content is same in new DOM
                //If element's content is updated/different, remove state from element (element's value will be stateless)
                if (newDOMTree.value === currentDOMTree.value) {
                    const newSlicesResult = __classPrivateFieldGet(this, _Game_instances, "m", _Game_getUpdatedDOMSlices).call(this, currentDOMTree.slices);
                    currentDOMTree.slices = newSlicesResult.slices;
                    currentDOMTree.value = newSlicesResult.value;
                }
                else {
                    currentDOMTree.slices = newDOMTree.slices;
                    currentDOMTree.value = newDOMTree.value;
                }
                if (currentDOMTree.element.firstChild) {
                    currentDOMTree.element.firstChild.nodeValue = currentDOMTree.value;
                }
                currentDOMTree.attributes = currentDOMTree.attributes.filter(attribute => {
                    const isAttributeInNewDOM = newDOMTree.attributes.find(_attribute => _attribute.name === attribute.name);
                    if (!isAttributeInNewDOM) {
                        currentDOMTree.element.removeAttribute(attribute.name);
                    }
                    return isAttributeInNewDOM;
                });
            }
            const currentTreeLength = currentDOMTree.children.length;
            const newTreeLength = newDOMTree.children.length;
            for (let i = 0; i < Math.max(currentTreeLength, newTreeLength); i++) {
                if (i < currentTreeLength && i < newTreeLength) {
                    currentDOMTree.children[i] = __classPrivateFieldGet(this, _Game_instances, "m", _Game_compareAndUpdateDOMTree).call(this, currentDOMTree.children[i], newDOMTree.children[i]);
                    //Reload script to execute
                    if (currentDOMTree.children[i].type === "SCRIPT") {
                        const newScript = document.createElement("script");
                        newScript.innerHTML = currentDOMTree.children[i].value;
                        currentDOMTree.element.replaceChild(newScript, currentDOMTree.children[i].element);
                        currentDOMTree.children[i].element = newScript;
                    }
                }
                else if (i >= currentTreeLength) { //Additional children in new DOM
                    currentDOMTree.children.push(newDOMTree.children[i]);
                    currentDOMTree.element = newDOMTree.children[i].element;
                }
                else if (i >= newTreeLength) { //Lesser children in new DOM
                    currentDOMTree.children[i].element.remove();
                    currentDOMTree.children.pop();
                    break;
                }
            }
        }
        else {
            currentDOMTree = { ...newDOMTree };
            currentDOMTree.element = newDOMTree.element;
        }
        if (currentDOMTree.type !== "root") {
            const newAttributes = [];
            for (const attribute of newDOMTree.attributes) {
                let isAttribute = false;
                currentDOMTree.attributes.forEach((_attribute, index) => {
                    isAttribute = _attribute.name === attribute.name;
                    if (!isAttribute && index === currentDOMTree.attributes.length - 1) {
                        newAttributes.push(attribute);
                    }
                    if (isAttribute) {
                        const newSlicesResult = __classPrivateFieldGet(this, _Game_instances, "m", _Game_getUpdatedDOMSlices).call(this, _attribute.slices);
                        _attribute.slices = newSlicesResult.slices;
                        _attribute.value = newSlicesResult.value;
                        currentDOMTree.element.setAttribute(_attribute.name, _attribute.value);
                    }
                });
            }
            currentDOMTree.attributes = [...currentDOMTree.attributes, ...newAttributes];
        }
        return currentDOMTree;
    }, _Game_parseDOMTreeToHtml = function _Game_parseDOMTreeToHtml(parentElement, _domTree) {
        const { type, value, attributes, children } = _domTree;
        if (type !== "root") {
            const newElement = document.createElement(type);
            newElement.innerHTML = value;
            for (const attribute of attributes) {
                newElement.setAttribute(attribute.name, attribute.value);
            }
            for (const child of children) {
                __classPrivateFieldGet(this, _Game_instances, "m", _Game_parseDOMTreeToHtml).call(this, newElement, child);
            }
            parentElement.appendChild(newElement);
            _domTree.element = newElement;
        }
        else {
            for (const child of children) {
                __classPrivateFieldGet(this, _Game_instances, "m", _Game_parseDOMTreeToHtml).call(this, parentElement, child);
            }
        }
        return parentElement;
    }, _Game_parseHTMLToDOMTree = function _Game_parseHTMLToDOMTree(html) {
        const children = [];
        let _htmlElement;
        if (typeof (html) === "string") {
            _htmlElement = document.createElement("div");
            _htmlElement.innerHTML = html;
        }
        else {
            _htmlElement = html;
        }
        for (const child of _htmlElement.children) {
            if (child !== __classPrivateFieldGet(this, _Game_canvas, "f")) {
                children.push(__classPrivateFieldGet(this, _Game_instances, "m", _Game_getDOMTree).call(this, child));
            }
        }
        return {
            type: "root",
            value: "",
            slices: [],
            attributes: [],
            children
        };
    }, _Game_getUpdatedDOMSlices = function _Game_getUpdatedDOMSlices(slices) {
        const newSlices = slices.map(slice => {
            if (slice.stateName) {
                try {
                    slice.value = this.store.get(slice.stateName);
                }
                catch (_a) { }
            }
            return slice;
        });
        return {
            value: newSlices.map(slice => slice.value).join(""),
            slices: newSlices
        };
    }, _Game_getDOMSlices = function _Game_getDOMSlices(value) {
        var _a;
        const slices = (_a = value.split(/(\{\{[a-zA-Z0-9-_]+\}\})/g)
            .map(part => {
            const doMatchStatePattern = (/(\{\{([a-zA-Z0-9-_]+)\}\})/g).test(part);
            let stateName;
            let value = part;
            if (doMatchStatePattern) {
                try {
                    stateName = part.slice(2, part.length - 2);
                    value = this.store.get(stateName);
                }
                catch (_a) {
                    stateName = null;
                }
            }
            return {
                value,
                stateName
            };
        })
            /**
                * Tidy up slices list if exist "false states"
                * Ex.
                * Assuming there is only one state defined: "name" = "Kyle"
                * And the sentence is
                * Hello world, {{name}} ! I am {{botName}}.
                * [Note that "botName" is not a valid state as it is not defined]
                * Hence, the slices would be
                * Slices:[
                * 	{value:"Hello world, "},
                * 	{value:"Kyle", stateName:"name"},
                * 	{value:" ! I am {{botName}}."}
                * ]
                *
                * Resulting sentence:
                * Hello world, Kyle ! I am {{botName}}.
                */
            .reduce((_slices, current) => {
            const sliceCount = _slices.length;
            if (sliceCount >= 1 && ((!_slices[sliceCount - 1].stateName && !current.stateName)
                || (!current.stateName && !current.value))) {
                _slices[sliceCount - 1].value = _slices[sliceCount - 1].value + current.value;
                return _slices;
            }
            return [..._slices, current];
        }, [])) !== null && _a !== void 0 ? _a : [];
        return {
            value: slices.map(slice => slice.value).join(""),
            slices
        };
    }, _Game_getDOMTree = function _Game_getDOMTree(element) {
        var _a, _b;
        const children = [];
        for (const child of element.children) {
            children.push(__classPrivateFieldGet(this, _Game_instances, "m", _Game_getDOMTree).call(this, child));
        }
        const attributes = [];
        for (let i = 0; i < element.attributes.length; i++) {
            const attribute = element.attributes[i];
            attributes.push({ name: attribute.nodeName, ...__classPrivateFieldGet(this, _Game_instances, "m", _Game_getDOMSlices).call(this, attribute.value) });
        }
        return {
            type: element.tagName,
            element,
            ...__classPrivateFieldGet(this, _Game_instances, "m", _Game_getDOMSlices).call(this, (_b = (_a = element.firstChild) === null || _a === void 0 ? void 0 : _a.nodeValue) !== null && _b !== void 0 ? _b : ""),
            attributes,
            children
        };
    };
});
