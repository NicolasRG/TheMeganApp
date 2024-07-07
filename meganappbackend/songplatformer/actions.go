package songplatformer

import (
	"fmt"
	"math/rand"
	"strings"
	"time"
)

var songClipDuration = (time.Second * 30).Milliseconds()

func GetCurrentSong(presenter Presenter) MeganSong {
	song := getCurrentSong(presenter.Tokens.AccessToken)
	fmt.Println("IS THIS REALLY THE CURRENT SONG??")
	fmt.Println(song)
	//map Songs to Megansong
	return MeganSong{
		Title:    song.Song.Name,
		Album:    song.Song.MeganAlbum.Name,
		Artist:   song.Song.Artists[0].Name,
		AlbumArt: song.Song.MeganAlbum.Images[0].Url,
		Uid:      song.Song.Id,
	}
}

func SetupPlaylistToUser(presenter Presenter, url string) MeganPlaylist {
	//playlist uid
	tokens := strings.Split(url, "/")
	uid := tokens[len(tokens)-1]
	//look up the playlist
	//create an array of the songs info

	playlist := getPlaylistDetails(presenter.Tokens.AccessToken, uid, false)
	hasNext := playlist.MeganTracks.NextUrl != ""
	nextUrl := playlist.MeganTracks.NextUrl
	//SCARYYYY
	for hasNext {
		p := getPlaylistDetails(presenter.Tokens.AccessToken, nextUrl, true)
		items := append(playlist.MeganTracks.Items, p.MeganTracks.Items...)
		playlist.MeganTracks.Items = items
		hasNext = p.MeganTracks.NextUrl != ""
		nextUrl = p.MeganTracks.NextUrl
	}
	songs := playlist.MeganTracks.Items
	//randomly sort them
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(songs), func(i, j int) { songs[i], songs[j] = songs[j], songs[i] })
	//submit them back to spotify in a queue??
	// for _, val := range songs {
	// 	fmt.Print(val.MTrack.Name)
	// 	queueSong(presenter.Tokens.AccessToken, val.MTrack.Id)
	// }

	time.Sleep(2 * time.Second)

	return playlist
}

// TODO goes to random point in song that is less than 30 seconds in that song
func GoToNextSong(presenter Presenter, track MeganSong) {
	startTime := getRandomStartingPoint(track.Duration)
	nextSong(presenter.Tokens.AccessToken)
	seekSong(presenter.Tokens.AccessToken, uint(startTime))
}

func QueueSong(presenter Presenter, track MeganSong) {
	queueSong(presenter.Tokens.AccessToken, track.Uid)
}

func StopSong(present Presenter) {
	fmt.Println("stoping song")
	stopSong(present.Tokens.AccessToken)
}

func getRandomStartingPoint(duration uint) int64 {

	convertedTime := (time.Millisecond * time.Duration(duration)).Milliseconds()
	convertedTime = convertedTime - songClipDuration
	rand.Seed(time.Now().UnixNano())
	startTime := rand.Int63n(convertedTime)
	return startTime
}
