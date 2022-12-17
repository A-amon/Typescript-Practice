import { Game } from "./Game"
import { GameObject } from "./GameObject"

declare global{
	interface Window { game: Game }
}

//ROUTE
export type PositionX = "left" | "right" | "center"
export type PositionY = "top" | "bottom" | "center"
export type Position = [PositionX, PositionY]

export interface TilesOptions {
	tilesXTotal?: number,
	tilesYTotal?: number,
	tileHeight?:number,
	tileWidth?:number,
	tileColor?: string,
	tileImagePath?: string
}

export interface RouteOptions extends TilesOptions{
	default?: boolean,
	layoutPath?: string,
	position?: Position,
	gameObjects?: GameObject[]
}

//GAME OBJECT
export interface GameObjectOptions{
	height?: number,
	width?: number,
	imagePath: string,
	isCollidable?: boolean
}

export type SetPositionCallback = (position:[number, number]) => number | [number, number]

//STORE
export interface State {
	value: any,
	pendingValue?: any
}

export type SetStateCallback = (value: any) => any

//GAME
export interface GameOptions{
	isDev?: boolean
}

/**
 * @returns doRedrawCanvas 
 */
export type RenderCallback = (...args: any[]) => boolean