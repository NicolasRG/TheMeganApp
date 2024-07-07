package redisclient

import (
	"fmt"

	"github.com/redis/go-redis/v9"
)

type onMessageCallback func(Message)

func GetSubscriber(channel string, rdb *redis.Client) redis.PubSub {
	const scope = "middleware:"
	fullChannel := scope + channel
	pubsub := rdb.Subscribe(ctx, fullChannel)
	return *pubsub
}

func StartListen(pubsub *redis.PubSub, cb onMessageCallback) {
	ch := pubsub.Channel()
	fmt.Println("Starting listening to publisher" + pubsub.String())
	for msg := range ch {
		fmt.Println(msg.Channel, msg.Payload)
		//this is where the logic of how to handle the message data has to go
		gameMsg := RedisMessageToClientMessage(*msg)
		fmt.Println("Converted MEssage")
		fmt.Println(gameMsg)
		cb(gameMsg)
	}
	fmt.Print("Stopped listening to publsher" + pubsub.String())
}

func ShutDown(pubsub *redis.PubSub) {
	pubsub.Close()
}
