package redisclient

import (
	"github.com/redis/go-redis/v9"
)

func Publish(channel string, message Message, rdb *redis.Client) {
	const scope = "backend:"
	fullChannel := scope + channel
	err := rdb.Publish(ctx, fullChannel, message.Stringify()).Err()
	if err != nil {
		panic(err)
	}
}
