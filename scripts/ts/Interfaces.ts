import { Game } from "./Game"
import { GameObject } from "./GameObject"

declare global{
	interface Window { game: Game }
}

//ROUTE
export type RoutePosition = ["left" | "right" | "center", "top" | "bottom" | "center"]

/**
 * ["row" | "column", number] - Fill specified row/column  
 * [columnIndex, rowIndex] - Draw image at this coordinate  
 * [columnIndexA, rowIndexA, columnIndexB, rowIndexB] - Fill specified block
 * E.g.
 * # # #
 * # # #
 * # # #
 */
export type TileImagePosition = ["row" | "column", number] | [number, number] | [number, number, number, number]

export interface TilesOptions {
	tilesXTotal?: number,
	tilesYTotal?: number,
	tileHeight?:number,
	tileWidth?:number,
	tileColor?: string,
	tileImages?: Record<string, TileImagePosition[]>
}

export interface RouteOptions extends TilesOptions{
	default?: boolean,
	layoutPath?: string,
	position?: RoutePosition,
	gameObjects?: GameObject[]
}

//GAME OBJECT
export interface GameObjectOptions{
	height?: number,
	width?: number,
	imagePath: string,
	isCollidable?: boolean,
	onCollide?: (gameObjectName: string) => void
}

export type SetPositionCallback = (position:[number, number]) => number | [number, number]

export type GameObjectPosition = [number, number]

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