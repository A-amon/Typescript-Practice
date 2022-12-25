define(["require", "exports", "./Game", "./GameObject"], function (require, exports, Game_1, GameObject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const game = new Game_1.Game("app", "Role Playing Game");
    window.game = game;
    /**
     * Router setup
     */
    game.router.addRoutes({
        "Page 1": {},
        "Page 2": {
            layoutPath: "/pages/Page2.html",
            tilesXTotal: 10,
            tilesYTotal: 10,
            tileHeight: 50,
            tileWidth: 50,
            tileImages: {
                "/assets/tiles/tile-2.png": [
                    [0, 0, 9, 9]
                ],
                "/assets/tiles/plain.png": [
                    [1, 5],
                    ["column", 3]
                ],
                "/assets/tiles/tile-1.png": [
                    [0, 0, 2, 4]
                ],
            },
            position: ["right", "top"],
            gameObjects: [
                new GameObject_1.GameObject("Knight", 5, {
                    imagePath: "/assets/knight.png",
                    onCollide: (name) => {
                        game.updateAfter(() => game.store.set("collision", (collision) => {
                            if (collision.name) {
                                return { name, count: collision.count + 1, showMessage: true };
                            }
                            return { name, count: 1, showMessage: true };
                        }));
                    }
                }),
                new GameObject_1.GameObject("Tree", [3, 3], {
                    imagePath: "/assets/tree.png",
                    isCollidable: true
                })
            ]
        }
    });
    /**
     * Store setup
     */
    game
        .start()
        .store.initialize({
        "counter": 0,
        "collision": {}
    });
    /**
     * Navigation buttons
     */
    const btnLinks = document.querySelectorAll(".btn-link");
    for (const btnLink of btnLinks) {
        btnLink.addEventListener("click", () => {
            var _a, _b;
            (_a = game.router) === null || _a === void 0 ? void 0 : _a.navigateTo((_b = btnLink.getAttribute("data-goto")) !== null && _b !== void 0 ? _b : "");
        });
    }
    /**
     * Adding keyboard controls
     * Move knight with WASD keys
     */
    document.addEventListener("keydown", (event) => {
        const knights = game.router.getGameObject("Knight");
        if (knights.length > 0) {
            game.updateAfter(() => knights[0].setPosition((position) => {
                switch (event.key) {
                    case 'w':
                        return [position[0], position[1] - 1];
                    case 'a':
                        return [position[0] - 1, position[1]];
                    case 's':
                        return [position[0], position[1] + 1];
                    case 'd':
                        return [position[0] + 1, position[1]];
                    default:
                        return position;
                }
            }));
        }
    });
});
