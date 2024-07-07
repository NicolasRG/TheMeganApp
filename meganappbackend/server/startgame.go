package server

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"bigdumb.pants/meganappbackend/game"
	"bigdumb.pants/meganappbackend/songplatformer"
)

type request struct {
	Roomcode  string                  `json:"roomCode"`
	Presenter songplatformer.Tokenset `json:"presenterTokens"`
}

func (r *request) marshal() []byte {
	//this shit better not error out
	obj, _ := json.Marshal(r)
	return obj
}

func StartGame(w http.ResponseWriter, r *http.Request) {

	fmt.Println("Recieved game start request")
	w.Header().Add("Content-Type", "application/json")

	data, err := ioutil.ReadAll(r.Body)

	if err != nil {
		fmt.Print(err)
		w.WriteHeader(400)
		w.Write(createError("you send some invalid details❓"))
		return
	}

	fmt.Println(string(data))
	obj := &request{}
	err = json.Unmarshal(data, obj)

	if err != nil {
		fmt.Print(err)
		w.WriteHeader(400)
		w.Write(createError("you send some invalid details❓"))
		return
	}

	fmt.Println(obj)

	queueId := obj.Roomcode
	queueId = strings.ToLower(queueId)
	//start the pubsub hoe
	//return the queue and presenter info
	//todo update the presneter info section correctly for the spotify auth flow (this shit will need to design differently :/)
	successmesage, err := json.Marshal(map[string]string{"queueId": queueId})

	if err != nil {
		fmt.Println("issue unmarshling request to start game")
	}

	presenter := songplatformer.CreatePresenter(obj.Presenter)

	game.CreateGame(queueId, presenter, obj.Roomcode)

	w.Write(successmesage)

}
