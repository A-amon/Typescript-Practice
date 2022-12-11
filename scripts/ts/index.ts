import { Game } from "./Game"

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
		position:["right", "top"]
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

