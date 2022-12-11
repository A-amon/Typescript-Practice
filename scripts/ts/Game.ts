import { GameOptions, RouteOptions } from "./Interfaces";
import { constants } from "./Constants";
import { Router } from "./Router";
import { Store } from "./Store";

export class Game{
	#options: GameOptions
	router: Router
	store: Store
	#main?: HTMLElement
	#canvas?: HTMLCanvasElement

	constructor(id: string, appName: string, options?: GameOptions){
		this.#main = document.querySelector(`#${id}`) as HTMLElement

		if(!this.#main){
			throw `${this.constructor.name}: No element with id "${id}" found`
		}
		this.#options = {...(options || {})}

		this.router = new Router(appName)
		this.router.addEventListener("route-update", (_) => this.#render())

		this.store = new Store()
	}

	start(): Game{
		if(this.#canvas){
			throw `${this.constructor.name}: Game is already running`
		}
		if(this.#main){
			const newCanvas = document.createElement("canvas")
			this.#canvas = newCanvas

			this.#resizeCanvas()
			window.addEventListener("resize", () => this.#resizeCanvas())

			this.router.navigateTo()
		}

		return this
	}

	func(callback: Function): Function{
		return () => {
			callback()
			this.#render()
		}
	}

	#drawCanvas(options: RouteOptions): Game{
		if(this.#canvas && options){
			const context = this.#canvas.getContext("2d")
			context!.clearRect(0, 0, this.#canvas.width, this.#canvas.height)

			const {
				tilesXTotal = constants.TILES_X_TOTAL, 
				tilesYTotal = constants.TILES_Y_TOTAL, 
				tileHeight = constants.TILE_HEIGHT, 
				tileWidth = constants.TILE_WIDTH, 
				tileColor = constants.TILE_COLOR,
				position = constants.ROUTE_POSITION
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
					context!.beginPath()
					context!.strokeRect(positionOffset.x + col * tileWidth, positionOffset.y + row * tileHeight, tileWidth, tileHeight)
					context!.strokeStyle = tileColor
				}
			}
		}
		return this
	}

	#resizeCanvas(){
		if(this.#main && this.#canvas){
			this.#canvas.height = this.#main.getBoundingClientRect().height
			this.#canvas.width = this.#main.getBoundingClientRect().width

			this.#render()
		}
	}

	async #render(){
		this.store.update()

		const currentRoute = this.router.getCurrentRoute()
		if(currentRoute){
			const [route, options] = currentRoute

			if(this.#main){
				this.#main.innerHTML = ''
	
				if(options.layoutPath){
					await fetch(options.layoutPath)
					.then(data => data.text())
					.then(res => {
						const tempElement = document.createElement("div")
						tempElement.innerHTML = res.replace(/\{\{([a-z0-9]+)\}\}/gi, 
						(_, key) => this.store.get(key))
	
						const scripts = tempElement.querySelectorAll("script")
						scripts.forEach(script => {
							const newScript = document.createElement("script")
							newScript.innerHTML = script.innerHTML
							tempElement.removeChild(script)
							tempElement.appendChild(newScript)
						})
	
						this.#main?.append(tempElement)
					})
					.catch(_ => {
						throw new Error(`${this.constructor.name}: The file "${options.layoutPath}" does not exist`)
					})
				}
	
				this.#canvas && this.#main.appendChild(this.#canvas)
				this.#drawCanvas(options)
			}
		}
	}
}