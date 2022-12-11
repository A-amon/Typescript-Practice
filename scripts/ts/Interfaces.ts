import { Game } from "./Game"

export type PositionX = "left" | "right" | "center"
export type PositionY = "top" | "bottom" | "center"
export type Position = [PositionX, PositionY]

export interface TilesOptions {
	tilesXTotal?: number,
	tilesYTotal?: number,
	tileHeight?:number,
	tileWidth?:number,
	tileColor?: string
}

export interface RouteOptions extends TilesOptions{
	default?: boolean,
	layoutPath?: string,
	position?: Position
}

export interface State {
	value: any,
	pendingValue?: any
}

export type SetStateCallback = (value: any) => any

export interface GameOptions{}

export interface GameObjectOptions{
	height?: number,
	width?: number,
	imagePath?: string,
	isCollidable?: boolean
}

declare global{
	interface Window { game: Game }
}