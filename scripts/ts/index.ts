import { Game } from "./Game"
import { GameObject } from "./GameObject"

const game: Game = new Game("app", "Role Playing Game")

window.game = game

game.router.addRoutes({
	"Page 1":{},
	"Page 2":{
		layoutPath:"/pages/Page2.html",
		tilesXTotal:10,
		tilesYTotal:10,
		tileHeight:50,
		tileWidth:50,
		position:["right", "top"],
		gameObjects:[
			new GameObject("Knight", 5, {
				imagePath:"/assets/knight.png"
			})
		]
	}
})

game
.start()
.store.initialize({
	"counter": 0
})

const btnLinks = document.querySelectorAll(".btn-link")
for(const btnLink of btnLinks){
	btnLink.addEventListener("click", () => {
		game.router?.navigateTo(btnLink.getAttribute("data-goto")?? "")
	})
}

document.addEventListener("keydown", (event) => {
	const knights = game.router.getGameObject("Knight")
	if(knights.length > 0){
		game.updateAfter(() => knights[0].setPosition((position) => {
			switch(event.key){
				case 'w':
					return [position[0], position[1] - 1]
				case 'a':
					return [position[0] - 1, position[1]]
				case 's':
					return [position[0], position[1] + 1]
				case 'd':
					return [position[0] + 1, position[1]]
				default:
					return position
			}
		}))
	}
})
