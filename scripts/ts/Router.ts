import { GameObject } from "./GameObject"
import { RouteOptions } from "./Interfaces"

export class Router extends EventTarget{
	#appName: string
	#defaultRoute: string
	#currentRoute: string
	#routes: Record<string, RouteOptions> = {}
	#imageBuffer: Record<string, {isLoaded: boolean, image: HTMLImageElement}> = {}

	constructor(appName: string){
		super()
		this.#appName = appName
	}

	addRoutes(routes: Record<string, RouteOptions>){
		Object.keys(routes).forEach(key => this.addRoute(key, routes[key]))
	}

	addRoute(name: string, options?: RouteOptions){
		if(!this.#routes.hasOwnProperty(name)){
			this.#routes = {...this.#routes, [name]:{...(options || {})}}

			options?.tileImages && Object.keys(options?.tileImages).forEach(imagePath => {
				this.#loadImage(imagePath)
			})

			options?.gameObjects?.forEach(gameObject => {
				const {imagePath} = gameObject.getOptions()
				if(imagePath){
					this.#loadImage(imagePath)
				}
			})

			if(options?.default === true || Object.keys(this.#routes).length === 1){
				this.#defaultRoute = name
			}
			return
		}
		throw `${this.constructor.name}: The route name "${name}" has already been used`
	}

	navigateTo(name: string = this.#defaultRoute){
		if(Object.keys(this.#routes).length > 0){
			if(this.#routes.hasOwnProperty(name)){
				this.#currentRoute = name
				document.title = `${this.#appName}| ${name}`
				this.dispatchEvent(new CustomEvent("route-update", {detail:{route:name, options: this.#routes[name]}}))
	
				return
			}
			throw `${this.constructor.name}: The route name "${name}" is not registered`
		}
		throw `${this.constructor.name}: Empty routes list`
	}

	getCurrentRoute(): [string, RouteOptions] | null {
		return this.#currentRoute? [this.#currentRoute, this.#routes[this.#currentRoute]]: null
	}

	getGameObject(name: string): GameObject[]{
		const gameObjects = this.#routes[this.#currentRoute].gameObjects
		return gameObjects?.filter(gameObject => gameObject.getName() === name)??[]
	}

	getImage(path: string): Promise<HTMLImageElement>{
		const imageData = this.#imageBuffer[path]
		return new Promise((resolve, reject) => {
			if(imageData){
				const interval = setInterval(() => {
					if(imageData.isLoaded){
						resolve(imageData.image)
						clearInterval(interval)
					}
				}, 1)
			}
			else{
				reject()
			}
		})
	}

	/**
	 * Load image asynchronously when adding route
	 * To avoid loading/(re)loading images on the spot when needed
	 * @param path 
	 */
	#loadImage(path: string){
		const image = new Image()
		image.src = path
		this.#imageBuffer[path] = {isLoaded:false, image}

		image.onload = () => {
			this.#imageBuffer[path].isLoaded = true
		}
		image.onerror = () => {
			delete this.#imageBuffer[path]
			throw `${this.constructor.name}: Failed to load image from this path: "${path}"`
		}
	}
}