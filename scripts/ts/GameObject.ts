import { GameObjectOptions, SetPositionCallback } from "./Interfaces";

export class GameObject{
	#name: string
	#position: [number, number]	// [x, y]
	#options: GameObjectOptions

	constructor(name: string, position: number | [number, number], options: GameObjectOptions){
		this.#name = name
		this.#position = Array.isArray(position)? position: [position, position]
		this.#options = options
	}

	setPosition(callback: SetPositionCallback): boolean{
		const newPosition = callback(this.#position)
		this.#position = Array.isArray(newPosition)? newPosition: [newPosition, newPosition]
		return true
	}

	getName(){
		return this.#name
	}

	getPosition(){
		return this.#position
	}

	getOptions(){
		return this.#options
	}
}