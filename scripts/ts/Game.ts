import { GameOptions, RenderCallback, RouteOptions } from "./Interfaces";
import { constants } from "./Constants";
import { Router } from "./Router";
import { Store } from "./Store";
import { GameObject } from "./GameObject";

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
		this.#main.appendChild(this.#canvas)

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
		const _canvas = document.createElement("canvas")
		const _context = _canvas.getContext("2d")
		
		_canvas.height = this.#main.getBoundingClientRect().height
		_canvas.width = this.#main.getBoundingClientRect().width

		// const context = this.#canvas.getContext("2d")
		// context!.clearRect(0, 0, this.#canvas.width, this.#canvas.height)

		const {TILES_X_TOTAL, TILES_Y_TOTAL, TILE_HEIGHT, TILE_WIDTH, TILE_COLOR} = constants.TilesOptions
		const {POSITION} = constants.RouteOptions
		const {
			tilesXTotal = TILES_X_TOTAL, 
			tilesYTotal = TILES_Y_TOTAL, 
			tileHeight = TILE_HEIGHT, 
			tileWidth = TILE_WIDTH, 
			tileColor = TILE_COLOR,
			tileImages = {},
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
				_context!.beginPath()
				_context!.fillRect(tilePosition.x, tilePosition.y, tileWidth, tileHeight)
				_context!.fillStyle = tileColor

				let imageStack:string[] = []

				Object.keys(tileImages).forEach(imagePath => {
					tileImages[imagePath].forEach(position => {
						if((position[0] === "row" && position[1] === row) ||
						(position[0] === "column" && position[1] === col) ||
						(position[0] === col && position[1] === row) ||
						(position.length === 4 && (col >= position[0] && row >= position[1]) && (col <= position[2] && row <= position[3]))){
							imageStack.push(imagePath)
							
							this.router.getImage(imagePath)
							.then((image) => {
								const interval = setInterval(() => {
									if(imageStack[0] === imagePath){
										_context!.drawImage(image, tilePosition.x, tilePosition.y, tileWidth, tileHeight)
										imageStack.shift()
										clearInterval(interval)
									}
								}, 1)
							})
							.catch(() => {
								imageStack.shift()
							})
						}
					})
				})

				if(gameObjects){
					const _gameObjects = gameObjects.filter(gameObject => {
						const [x, y] = gameObject.getPosition().current
						return (x === col + 1) && (y === row + 1)
					})
					const collidableObject = _gameObjects.find(gameObject => gameObject.getOptions().isCollidable)

					for(let gameObject of _gameObjects){
						const {HEIGHT, WIDTH} = constants.GameObjectOptions
						const {height = HEIGHT, width = WIDTH, imagePath, onCollide} = gameObject.getOptions()
						const {previous, current} = gameObject.getPosition()

						if(collidableObject && previous !== current){
							gameObject.setPosition(() => previous)
							onCollide && onCollide(collidableObject.getName())
						}
						else{
							imageStack.push(imagePath)
							this.router.getImage(imagePath)
							.then((image) => {
								const interval = setInterval(() => {
									if(imageStack[0] === imagePath){
										_context!.drawImage(image, tilePosition.x + tileWidth/2 - width/2, tilePosition.y + tileHeight/2 - height/2, width, height)
										imageStack.shift()
										clearInterval(interval)
									}
								}, 1)
							})
							.catch(() => {
								imageStack.shift()
							})
						}
					}
				}
			}
		}

		this.#main.appendChild(_canvas)
		this.#canvas.remove()
		this.#canvas = _canvas

		return this
	}

	#resizeCanvas(){
		this.#canvas.height = this.#main.getBoundingClientRect().height
		this.#canvas.width = this.#main.getBoundingClientRect().width

		const currentRoute = this.router.getCurrentRoute()
		currentRoute && this.#drawCanvas(currentRoute[1])
	}

	async #render(doRedrawCanvas: boolean = false){
		this.store.update()

		const currentRoute = this.router.getCurrentRoute()
		if(currentRoute){
			const [_, options] = currentRoute
			const children = this.#main.children

			const childrenToRemove: HTMLElement[] = []
			for(let child of children){
				let _child = child as HTMLElement
				if(_child !== this.#canvas){
					const placeholder = document.createElement("div")
					placeholder.style.height = `${_child.getBoundingClientRect().height * 1.25}px`
					placeholder.style.width = `${_child.getBoundingClientRect().width}px`
					_child.replaceWith(placeholder)
					childrenToRemove.push(placeholder)
				}
			}
	
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

					this.#main.insertBefore(tempElement, this.#canvas)
				})
			}
			childrenToRemove.forEach(child => child.remove())

			doRedrawCanvas && this.#drawCanvas(options)
		}
	}
}