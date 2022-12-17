import { GameOptions, RenderCallback, RouteOptions } from "./Interfaces";
import { constants } from "./Constants";
import { Router } from "./Router";
import { Store } from "./Store";

export class Game{
	#options: GameOptions
	readonly router: Router
	readonly store: Store
	#main: HTMLElement
	#canvas: HTMLCanvasElement

	constructor(id: string, appName: string, options?: GameOptions){
		const mainElement = document.querySelector(`#${id}`) as HTMLElement

		if(!mainElement){
			throw `${this.constructor.name}: No element with id "${id}" found`
		}
		this.#main = mainElement
		this.#options = options??{}

		this.router = new Router(appName)
		this.router.addEventListener("route-update", (_) => this.#render(true))

		this.store = new Store()
	}

	start(): Game{
		if(this.#canvas){
			throw `${this.constructor.name}: Game is already running`
		}

		const newCanvas = document.createElement("canvas")
		this.#canvas = newCanvas

		this.#resizeCanvas()
		window.addEventListener("resize", () => this.#resizeCanvas())

		this.router.navigateTo()

		return this
	}

	updateAfter(callback: RenderCallback): void{
		const doRedrawCanvas = callback()
		this.#render(doRedrawCanvas)
	}

	#drawCanvas(options: RouteOptions): Game{
		const context = this.#canvas.getContext("2d")
		context!.clearRect(0, 0, this.#canvas.width, this.#canvas.height)

		const {TILES_X_TOTAL, TILES_Y_TOTAL, TILE_HEIGHT, TILE_WIDTH, TILE_COLOR} = constants.TilesOptions
		const {POSITION} = constants.RouteOptions
		const {
			tilesXTotal = TILES_X_TOTAL, 
			tilesYTotal = TILES_Y_TOTAL, 
			tileHeight = TILE_HEIGHT, 
			tileWidth = TILE_WIDTH, 
			tileColor = TILE_COLOR,
			position = POSITION,
			gameObjects
		} = options

		let positionOffset = {x: 0, y: 0}
		if(position[0] === "center"){
			positionOffset.x = 0.5 * this.#canvas.width - (0.5 * tileWidth * tilesXTotal)
		}
		else if(position[0] === "right"){
			positionOffset.x = this.#canvas.width - (tileWidth * tilesXTotal)
		}

		if(position[1] === "center"){
			positionOffset.y = 0.5 * this.#canvas.height - (0.5 * tileHeight * tilesYTotal)
		}
		else if(position[1] === "bottom"){
			positionOffset.y = this.#canvas.height - (tileHeight * tilesYTotal)
		}

		for(let col=0;col<tilesXTotal; col++){
			for(let row=0;row<tilesYTotal; row++){
				const tilePosition = {
					x: positionOffset.x + col * tileWidth,
					y: positionOffset.y + row * tileHeight
				}
				context!.beginPath()
				context!.fillRect(tilePosition.x, tilePosition.y, tileWidth, tileHeight)
				context!.fillStyle = tileColor

				if(gameObjects){
					const _gameObjects = gameObjects.filter(gameObject => {
						const [x, y] = gameObject.getPosition()
						return (x === col + 1) && (y === row + 1)
					})
					for(let gameObject of _gameObjects){
						const {HEIGHT, WIDTH} = constants.GameObjectOptions
						const {height = HEIGHT, width = WIDTH, imagePath} = gameObject.getOptions()
						
						const image = new Image()
						image.src = imagePath
						image.onload = () => {
							context!.drawImage(image, tilePosition.x + tileWidth/2 - width/2, tilePosition.y + tileHeight/2 - height/2, width, height)
						}
					}
				}
			}
		}
		return this
	}

	#resizeCanvas(){
		this.#canvas.height = this.#main.getBoundingClientRect().height
		this.#canvas.width = this.#main.getBoundingClientRect().width

		this.#render(true)
	}

	async #render(doRedrawCanvas: boolean = false){
		this.store.update()

		const currentRoute = this.router.getCurrentRoute()
		if(currentRoute){
			const [route, options] = currentRoute

			this.#main.innerHTML = ''
	
			if(options.layoutPath){
				await fetch(options.layoutPath)
				.then(data => {
					if(!data.ok){
						throw new Error(`${this.constructor.name}: The file "${options.layoutPath}" does not exist`)
					}
					return data.text()
				})
				.then(res => {
					const tempElement = document.createElement("div")
					tempElement.innerHTML = res.replace(/\{\{([a-z0-9]+)\}\}/gi, 
					(expression, key) => {
						try{
							return this.store.get(key)
						}
						catch(_){
							return expression
						}
					})

					const scripts = tempElement.querySelectorAll("script")
					scripts.forEach(script => {
						const newScript = document.createElement("script")
						newScript.innerHTML = script.innerHTML
						tempElement.removeChild(script)
						tempElement.appendChild(newScript)
					})

					this.#main.append(tempElement)
				})
			}

			this.#main.appendChild(this.#canvas)
			doRedrawCanvas && this.#drawCanvas(options)
		}
	}
}