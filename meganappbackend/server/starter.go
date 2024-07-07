package server

import (
	"fmt"
	"log"
	"net/http"
)

func pingHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Print("Ping")
	w.Write([]byte("pong"))
}

/*
BLOCKS HERE
*/
func StartServer() {
	http.HandleFunc("/ping", pingHandler)
	http.HandleFunc("/startgame", StartGame)
	fmt.Println("Start ")
	log.Fatal(http.ListenAndServe(":8000", nil))
}
