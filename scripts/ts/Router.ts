import { GameObject } from "./GameObject"
import { RouteOptions } from "./Interfaces"

export class Router extends EventTarget{
	#appName: string
	#defaultRoute: string
	#currentRoute: string
	#routes: Record<string, RouteOptions> = {}
	#gameObjects: GameObject[]

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

			if(options?.default == true || Object.keys(this.#routes).length === 1){
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

	addGameObject(gameObject: GameObject): GameObject | null {
		const {name} = gameObject
		if(this.#routes.hasOwnProperty(name)){

		}
		throw `${this.constructor.name}: The route name "${name}" is not registered`
	}
}