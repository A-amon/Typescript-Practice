import { GameObjectOptions, GameObjectPosition, SetPositionCallback } from "./Interfaces";

export class GameObject{
	#name: string
	#previousPosition: GameObjectPosition
	#position: GameObjectPosition
	#options: GameObjectOptions

	constructor(name: string, position: number | [number, number], options: GameObjectOptions){
		this.#name = name
		this.#position = Array.isArray(position)? position: [position, position]
		this.#previousPosition = this.#position
		this.#options = options
	}

	setPosition(callback: SetPositionCallback): boolean{
		this.#previousPosition = this.#position
		const newPosition = callback(this.#position)
		this.#position = Array.isArray(newPosition)? newPosition: [newPosition, newPosition]
		return true
	}

	getName(): string{
		return this.#name
	}

	getPosition(): {previous: GameObjectPosition, current: GameObjectPosition}{
		return {previous:this.#previousPosition, current:this.#position}
	}

	getOptions(): GameObjectOptions{
		return this.#options
	}
}