package main

import (
	"fmt"

	"bigdumb.pants/meganappbackend/server"
)

func main() {
	fmt.Print("Starting the megan app backend")
	server.StartServer()
}
