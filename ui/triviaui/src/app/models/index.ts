export interface MeganToken {
	userName : string,
	score : number,
	roomCode : string,
    creationtime : number,
    avatar : number,
	correct? : boolean, 
}

export enum GameState{
	OPEN,
	INSONG,
	AFTERSONG,	
}

export interface AfterSongInfo{
	"correctAnswer":{
		"roomCode":string,
		"songName":string,
		"artist":string,
		"album":string,
		"coverArt":string,
	},
	players : MeganToken[]
}