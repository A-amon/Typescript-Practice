define(["require", "exports", "./Game"], function (require, exports, Game_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const game = new Game_1.Game("app", "Role Playing Game");
    window.game = game;
    game.router.addRoutes({
        "Page 1": {},
        "Page 2": {
            layoutPath: "/pages/Page2.html",
            tilesXTotal: 10,
            tilesYTotal: 10,
            tileHeight: 50,
            tileWidth: 50,
            position: ["right", "top"]
        }
    });
    game
        .start()
        .store.initialize({
        "counter": 0
    });
    const btnLinks = document.querySelectorAll(".btn-link");
    for (const btnLink of btnLinks) {
        btnLink.addEventListener("click", () => {
            var _a, _b;
            (_a = game.router) === null || _a === void 0 ? void 0 : _a.navigateTo((_b = btnLink.getAttribute("data-goto")) !== null && _b !== void 0 ? _b : "");
        });
    }
});
