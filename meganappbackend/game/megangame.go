package game

import (
	"fmt"
	"time"

	"bigdumb.pants/meganappbackend/redisclient"
	"bigdumb.pants/meganappbackend/songplatformer"
	"github.com/lithammer/fuzzysearch/fuzzy"
	"github.com/redis/go-redis/v9"
)

type MeganGame struct {
	Players             []MeganPlayer
	ActiveSong          songplatformer.MeganSong
	ActiveSongStartTime int
	Presenter           songplatformer.Presenter
	QueueId             string
	subscription        *redis.PubSub
	Roomcode            string
	playlist            songplatformer.MeganPlaylist
	shouldClose         bool
	cb                  func()
}

func DefaultMeganGame(queueId string, presenter songplatformer.Presenter, roomcode string, cb func()) MeganGame {
	redisclient.Publish(queueId, redisclient.Message{Action: "Starting Channel"}, redispubsub)

	sub := redisclient.GetSubscriber(queueId, redispubsub)

	mg := MeganGame{
		QueueId:      queueId,
		subscription: &sub,
		Presenter:    presenter,
		Players:      make([]MeganPlayer, 0),
		Roomcode:     roomcode,
		shouldClose:  false,
		cb:           cb,
	}

	go mg.startSubscriber()

	return mg
}

func (mg *MeganGame) startSubscriber() {
	redisclient.StartListen(mg.subscription, mg.onMessageCallback)
}

func (mg *MeganGame) onMessageCallback(msg redisclient.Message) {
	switch action := msg.Action; action {
	//actiosn for players
	case "initialCheckin":
		fmt.Println("got initial checking, only validating and testing things")

	case "startGame":
		fmt.Println("startgame")
		//spin this off in a thread add the rest of the game logic
		go mg.startGameLoop()

	case "submitAnswer":
		fmt.Println("submitAnswer")
		fmt.Println("answer submited : " + msg.Answer)
		didMatch := fuzzy.MatchFold(msg.Answer, mg.ActiveSong.Title)
		if didMatch && msg.Answer != "" {
			//dispath success message
			fmt.Println("MATCHED")
			mg.publish(redisclient.Message{
				Action:   "correctAnswer",
				Roomcode: mg.Roomcode,
				UserName: msg.UserName,
				Score:    correctAnswer(msg.Score, mg.ActiveSongStartTime),
			})
		} else {
			//dispath failure message
			fmt.Println("DID NOT MATCH")
			mg.publish(redisclient.Message{
				Action:   "incorrectAnswer",
				Roomcode: mg.Roomcode,
				UserName: msg.UserName,
				Score:    msg.Score,
			})
		}

		//actions for presenter IDK IF I NEED THIS
	case "spoitfyRegistration":
		fmt.Println("spotifyRegistration") //will need to update objects on this

	case "shutDown":
		fmt.Println("shutDown")
		mg.shouldClose = true
		mg.close()

	default:
		fmt.Println("default msg handler this shouldnr happen")
	}
}

func (mg *MeganGame) close() {
	//close subscriber
	redisclient.ShutDown(mg.subscription)
	//need to remove from map as well
	mg.cb()
}

func (mg *MeganGame) publish(msg redisclient.Message) {
	redisclient.Publish(mg.QueueId, msg, redispubsub)
}

func (mg *MeganGame) playersToMessageSlice() []redisclient.Message {
	players := make([]redisclient.Message, 0)
	for _, player := range mg.Players {
		players = append(players, player.ConvertToMessage())
	}
	return players
}

func (mg *MeganGame) startGameLoop() {
	defer func() {
		if err := recover(); err != nil {
			fmt.Println("panic occurred:", err)
			mg.publish(redisclient.Message{
				Action: "disconnect",
			})
			mg.close()
		}
	}()

	mg.playlist = songplatformer.SetupPlaylistToUser(mg.Presenter, mg.Presenter.Url)
	var length = len(mg.playlist.MeganTracks.Items)
	fmt.Println("length of songs: " + fmt.Sprint(length))
	time.Sleep(1 * time.Second)

	for i := 0; i <= length; i++ {
		mg.ActiveSong = mg.playlist.PopSong()
		songplatformer.QueueSong(mg.Presenter, mg.ActiveSong)
		fmt.Println("playing current song: " + mg.ActiveSong.Title)
		time.Sleep(1 * time.Second)
		mg.ActiveSongStartTime = time.Now().Second()
		mg.publish(redisclient.Message{
			Action:   "startedRound",
			Roomcode: mg.Roomcode,
		})

		if mg.shouldClose {
			break
		}

		songplatformer.GoToNextSong(mg.Presenter, mg.ActiveSong)
		fmt.Println("stopping for thirty seconds")
		time.Sleep(time.Second * 30)

		if mg.shouldClose {
			break
		}

		songplatformer.StopSong(mg.Presenter)
		fmt.Println("stopping current song: " + mg.ActiveSong.Title)
		fmt.Println("stopping for twenty seconds")
		time.Sleep(time.Second * 20)

		//emit message that song is no longer open to answering
		mg.publish(redisclient.Message{
			Action:   "endRound",
			Roomcode: mg.Roomcode,
			SongName: mg.ActiveSong.Title,
			Artist:   mg.ActiveSong.Artist,
			CoverArt: mg.ActiveSong.AlbumArt,
			Album:    mg.ActiveSong.Album,
		})

		fmt.Println("stopping for 15 seconds")
		time.Sleep(time.Second * 15)

		fmt.Println("going to next song")
		//todo emit change of state
	}

	fmt.Println("game finished?")
}

func correctAnswer(score uint, activeTime int) uint {
	score = score + 30
	//add remaing time as well
	timeAddition := (60 - ((uint)(time.Now().Second()) - uint(activeTime)))
	score = score + timeAddition
	return score
}
