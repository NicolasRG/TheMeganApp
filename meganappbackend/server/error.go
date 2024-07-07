package server

import (
	"encoding/json"
	"fmt"
)

type Error struct {
	message string
}

func createError(str string) []byte {
	error := &Error{}
	error.message = str
	obj, err := json.Marshal(str)

	//🤥 yeah idk about this boss 🤥
	if err != nil {
		fmt.Println("real confused on this one tbh")
		fmt.Println(err)
		fmt.Println("this is what got sent : " + str)
		wtf, _ := json.Marshal(map[string]string{"Some dumbshit ": "went down????????"})
		return wtf
	}

	return obj
}
