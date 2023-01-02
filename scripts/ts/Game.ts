import { GameOptions, RenderCallback, RouteOptions } from "./Interfaces";
import { constants } from "./Constants";
import { Router } from "./Router";
import { Store } from "./Store";

interface DOMSlice{
	value: string,
	stateName?:string | null
}

interface DOMAttribute {
	name: string,
	value: string,
	slices: DOMSlice[]
}

interface DOMTree {
	type:string, 
	value:string,
	element?:HTMLElement,
	slices:DOMSlice[],
	attributes: DOMAttribute[],
	children:DOMTree[]
}

export class Game{
	#options: GameOptions
	readonly router: Router
	readonly store: Store
	#main: HTMLElement
	#canvas: HTMLCanvasElement
	#domTree: DOMTree

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
		this.#render(doRedrawCanvas, true)
	}

	#drawCanvas(options: RouteOptions): Game{
		const _canvas = document.createElement("canvas")
		const _context = _canvas.getContext("2d")
		
		_canvas.height = this.#canvas.height
		_canvas.width = this.#canvas.width

		let imageStack:string[] = []	// Ensure images are drawn in sequence (tile -> game object)

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

				// Draw tile images
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
									if(imageStack[0] === imagePath){	// Draw image once turn arrives
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

				// Draw game objects images
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
									if(imageStack[0] === imagePath){	// Draw image once turn arrives
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

		const updateCanvasInterval = setInterval(() => {
			if(imageStack.length === 0){
				clearInterval(updateCanvasInterval)
				this.#main.appendChild(_canvas)
				this.#canvas.remove()
				this.#canvas = _canvas
			}
		}, 1)

		return this
	}

	#resizeCanvas(){
		this.#canvas.height = this.#main.getBoundingClientRect().height
		this.#canvas.width = this.#main.getBoundingClientRect().width

		const currentRoute = this.router.getCurrentRoute()
		currentRoute && this.#drawCanvas(currentRoute[1])
	}

	async #render(doRedrawCanvas: boolean = false, isStateUpdate: boolean = false){
		this.store.update()

		const currentRoute = this.router.getCurrentRoute()
		if(currentRoute){
			const [_, options] = currentRoute

			if(!isStateUpdate){
				this.#main.innerHTML = ""
				if(options.layoutPath){
					await fetch(options.layoutPath)
					.then(data => {
						if(!data.ok){
							throw new Error(`${this.constructor.name}: The file "${options.layoutPath}" does not exist`)
						}
						return data.text()
					})
					.then(res => {
						this.#domTree = this.#parseHTMLToDOMTree(res)
						this.#main.append(...this.#parseDOMTreeToHtml(document.createElement("div"), this.#domTree).children)
						this.#domTree.element = this.#main
					})
				}
				this.#main.appendChild(this.#canvas)
			}
			else{
				this.store.update()
				const newDOMTree = this.#parseHTMLToDOMTree(this.#main)
				this.#compareAndUpdateDOMTree(this.#domTree, newDOMTree)
			}

			doRedrawCanvas && this.#drawCanvas(options)
		}
	}

	#compareAndUpdateDOMTree(currentDOMTree:DOMTree, newDOMTree:DOMTree): DOMTree{
		if(newDOMTree.type === currentDOMTree.type){
			if(newDOMTree.type !== "root"){
				//Update states' values if element's content is same in new DOM
				//If element's content is updated/different, remove state from element (element's value will be stateless)
				if(newDOMTree.value === currentDOMTree.value){
					const newSlicesResult = this.#getUpdatedDOMSlices(currentDOMTree.slices)
					currentDOMTree.slices = newSlicesResult.slices
					currentDOMTree.value = newSlicesResult.value
				}
				else{
					currentDOMTree.slices = newDOMTree.slices
					currentDOMTree.value = newDOMTree.value
				}
				
				if(currentDOMTree.element!.firstChild){
					currentDOMTree.element!.firstChild!.nodeValue = currentDOMTree.value
				}

				currentDOMTree.attributes = currentDOMTree.attributes.filter(attribute => {
					const isAttributeInNewDOM = newDOMTree.attributes.find(_attribute => _attribute.name === attribute.name)
					if(!isAttributeInNewDOM){
						currentDOMTree.element!.removeAttribute(attribute.name)
					}
					return isAttributeInNewDOM
				})
			}

			const currentTreeLength = currentDOMTree.children.length
			const newTreeLength = newDOMTree.children.length
			for(let i=0;i<Math.max(currentTreeLength, newTreeLength); i++){
				if(i < currentTreeLength && i < newTreeLength){
					currentDOMTree.children[i] = this.#compareAndUpdateDOMTree(currentDOMTree.children[i], newDOMTree.children[i])
					//Reload script to execute
					if(currentDOMTree.children[i].type === "SCRIPT"){
						const newScript = document.createElement("script")
						newScript.innerHTML = currentDOMTree.children[i].value
						currentDOMTree.element!.replaceChild(newScript, currentDOMTree.children[i].element as HTMLElement)
						currentDOMTree.children[i].element = newScript
					}
				}
				else if(i >= currentTreeLength){	//Additional children in new DOM
					currentDOMTree.children.push(newDOMTree.children[i])
					currentDOMTree.element = newDOMTree.children[i].element
				}
				else if(i >= newTreeLength){		//Lesser children in new DOM
					currentDOMTree.children[i].element!.remove()
					currentDOMTree.children.pop()
					break
				}
			}
		}
		else{
			currentDOMTree = {...newDOMTree}
			currentDOMTree.element = newDOMTree.element
		}
	
		if(currentDOMTree.type !== "root"){
			const newAttributes: DOMAttribute[] = []
			for(const attribute of newDOMTree.attributes){
				let isAttribute = false
				currentDOMTree.attributes.forEach((_attribute, index) => {
					isAttribute = _attribute.name === attribute.name
					if(!isAttribute && index === currentDOMTree.attributes.length - 1){
						newAttributes.push(attribute)
					}
					if(isAttribute){
						const newSlicesResult = this.#getUpdatedDOMSlices(_attribute.slices)

						_attribute.slices = newSlicesResult.slices
						_attribute.value = newSlicesResult.value
						currentDOMTree.element!.setAttribute(_attribute.name, _attribute.value)
					}
				})
			}
			currentDOMTree.attributes = [...currentDOMTree.attributes, ...newAttributes]
		}

		return currentDOMTree
	}

	#parseDOMTreeToHtml(parentElement: HTMLElement, _domTree:DOMTree): HTMLElement{
		const {type, value, attributes, children} = _domTree
		
		if(type !== "root"){
			const newElement = document.createElement(type)
			newElement.innerHTML = value
			for(const attribute of attributes){
				newElement.setAttribute(attribute.name, attribute.value)
			}
			for(const child of children){
				this.#parseDOMTreeToHtml(newElement, child)
			}
			parentElement.appendChild(newElement)
			_domTree.element = newElement
		}
		else{
			for(const child of children){
				this.#parseDOMTreeToHtml(parentElement, child)
			}
		}
		
		return parentElement
	}

	#parseHTMLToDOMTree(html:string | HTMLElement): DOMTree{
		const children = []
		let _htmlElement
		if(typeof(html) === "string"){
			_htmlElement = document.createElement("div")
			_htmlElement.innerHTML = html
		}
		else{
			_htmlElement = html
		}

		for(const child of _htmlElement.children){
			if(child !== this.#canvas){
				children.push(this.#getDOMTree(child as HTMLElement))
			}
		}
		
		return {
			type:"root",
			value:"",
			slices:[],
			attributes:[],
			children
		}
	}

	#getUpdatedDOMSlices(slices: DOMSlice[]):{value:string, slices:DOMSlice[]}{
		const newSlices = slices.map(slice => {
			if(slice.stateName){
				try{
					slice.value = this.store.get(slice.stateName)
				}catch{}
			}
			return slice
		})
		return {
			value: newSlices.map(slice => slice.value).join(""),
			slices: newSlices
		}
	}

	/**
	 * Split sentence with states into several slices  
	 * Easy to identify and update state
	 * @description
	 * Ex.
	 * Assuming there is a "name" state with value of "Kyle"
	 * Hello world, {{name}} !
	 * Slices:[
	 * 	{value:"Hello world, "},
	 * 	{value:"Kyle", stateName:"name"},
	 * 	{value:" !"}
	 * ]	 
	 * @param value string
	 * @returns {Object} result
	 */
	#getDOMSlices(value: string): {value:string, slices:DOMSlice[]}{
		const slices = value.split(/(\{\{[a-zA-Z0-9-_]+\}\})/g)
				.map(part => {
						const doMatchStatePattern = (/(\{\{([a-zA-Z0-9-_]+)\}\})/g).test(part)
						let stateName
						let value = part
						if(doMatchStatePattern){
							try{
								stateName = part.slice(2, part.length - 2)
								value = this.store.get(stateName)
							}
							catch{
								stateName = null
							}
						}
						
						return {
							value, 
							stateName
						}
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
					.reduce((_slices: DOMSlice[], current) => {
						const sliceCount = _slices.length
						if(sliceCount >= 1 && (
							(!_slices[sliceCount - 1].stateName && !current.stateName) 
							|| (!current.stateName && !current.value)
						)){
							_slices[sliceCount - 1].value = _slices[sliceCount - 1].value + current.value
							return _slices
						}
						return [..._slices, current]
					}, [])
					??[]
		return {
			value:slices.map(slice => slice.value).join(""),
			slices
		}
	}

	#getDOMTree(element: HTMLElement): DOMTree{
		const children = []
		for(const child of element.children){
			children.push(this.#getDOMTree(child as HTMLElement))
		}

		const attributes:DOMAttribute[] = []
		for(let i=0;i<element.attributes.length;i++){
			const attribute = element.attributes[i]
			attributes.push({name: attribute.nodeName, ...this.#getDOMSlices(attribute.value)})
		}
	
		return {
			type:element.tagName,
			element,
			...this.#getDOMSlices(element.firstChild?.nodeValue??""),
			attributes,
			children
		}
	}
}