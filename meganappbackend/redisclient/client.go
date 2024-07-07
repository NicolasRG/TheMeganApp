package redisclient

import (
	"context"
	"os"

	"github.com/redis/go-redis/v9"
)

var ctx = context.TODO()

func CreateClient() *redis.Client {

	url := os.Getenv("backendurl")
	if url == "" {
		url = "localhost:6379"
	} else {
		url = url + ":6379"
	}

	return redis.NewClient(&redis.Options{
		Addr:     url,
		Password: "", // no password set
		DB:       1,  // use default DB
	})
}
