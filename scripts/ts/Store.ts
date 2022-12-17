
import { SetStateCallback, State } from "./Interfaces";

export class Store extends EventTarget{
	#data: Record<string, State> = {}
	#hasUpdate: boolean = false

	initialize(data: Record<string, any>){
		if(!this.#data || Object.keys(this.#data).length === 0){
			Object.keys(data).forEach(key => {
				this.#data[key] = {
					value: data[key]
				}
			})
			return
		}
		throw new Error(`${this.constructor.name}: Store has been initialized`)
	}

	set(property: string, callback: SetStateCallback): boolean{
		if(this.#data.hasOwnProperty(property)){
			const {value, pendingValue} = this.#data[property]
			const newValue: any = callback(pendingValue?? value)	// Provide latest value

			if(newValue !== value){
				this.#data[property].pendingValue = newValue
				this.#hasUpdate = true
			}
			return false
		}
		throw new Error(`${this.constructor.name}: The data "${property}" does not exist`)
	}

	get(property: string): any{
		if(this.#data.hasOwnProperty(property)){
			return this.#data[property].value
		}
		throw new Error(`${this.constructor.name}: The data "${property}" does not exist`)
	}

	update(){
		if(this.#hasUpdate){
			Object.keys(this.#data).forEach((key: string) => {
				this.#data[key] = {value: this.#data[key].pendingValue}
			})
			this.#hasUpdate = false
		}
	}
}