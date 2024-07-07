package game

import "bigdumb.pants/meganappbackend/redisclient"

type MeganPlayer struct {
	UserName      string `json:"userName"`
	Score         uint   `json:"score"`
	Avatar        uint   `json:"avatar"`
	AnswerCorrect bool   `json:"answer"`
	Roomcode      string `json:"roomCode"`
}

func (mp *MeganPlayer) ConvertToMessage() redisclient.Message {
	return redisclient.Message{
		UserName: mp.UserName,
		Score:    mp.Score,
		Avatar:   mp.Score,
		Roomcode: mp.Roomcode,
	}
}
