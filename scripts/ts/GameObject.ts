import { GameObjectOptions } from "./Interfaces";

export class GameObject{
	name: string
	route: string
	position: [number, number]	// [x, y]
	options: GameObjectOptions

	constructor(name: string, options: GameObjectOptions, route: string, position: number | [number, number]){
		this.name = name
		this.options = options
		this.route = route
		this.position = Array.isArray(position)? position: [position, position]
	}
}