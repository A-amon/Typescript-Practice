define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GameObject = void 0;
    class GameObject {
        constructor(name, options, route, position) {
            this.name = name;
            this.options = options;
            this.route = route;
            this.position = Array.isArray(position) ? position : [position, position];
        }
    }
    exports.GameObject = GameObject;
});
