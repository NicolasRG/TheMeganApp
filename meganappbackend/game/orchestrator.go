package game

import (
	"fmt"

	"bigdumb.pants/meganappbackend/redisclient"
	"bigdumb.pants/meganappbackend/songplatformer"
)

//ok put the actual game logic somwhere (🖐 waives hands around 🖐) here

var redispubsub = redisclient.CreateClient()
var activeGames = make(map[string]MeganGame)

func CreateGame(queueId string, presenter songplatformer.Presenter, roomcode string) {
	//create a new game struct
	activeGames[queueId] = DefaultMeganGame(queueId, presenter, roomcode, func() {
		fmt.Println("deleting from orchastrator map : " + queueId)
		delete(activeGames, queueId)
	})
}
