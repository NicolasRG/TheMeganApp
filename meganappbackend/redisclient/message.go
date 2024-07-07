package redisclient

import (
	"encoding/json"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type Message struct {
	Action   string    `json:"action"`
	Roomcode string    `json:"roomCode"`
	UserName string    `json:"userName"`
	Score    uint      `json:"score"`
	SongName string    `json:"songName"`
	Artist   string    `json:"artist"`
	Answer   string    `json:"answer"`
	Album    string    `json:"album"`
	CoverArt string    `json:"coverArt"`
	Avatar   uint      `json:"avatar"`
	Players  []Message `json:"players"` //this shit will ahve to work, dumbest shit possible im p sure
}

func (m *Message) Stringify() string {
	//🤡 if this errors out im suing 🤡
	str, _ := json.Marshal(m)

	return string(str)
}

func RedisMessageToClientMessage(rmsg redis.Message) Message {
	msg := &Message{}
	err := json.Unmarshal([]byte(rmsg.Payload), msg)
	fmt.Print(err)
	return *msg
}
