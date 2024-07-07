package songplatformer

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

var client = http.Client{}

// test purposes only
func getCurrentSong(token string) Songs {

	url := "https://api.spotify.com/v1/me/player/currently-playing"

	req := createGetRequest(token, url)

	// Send req using http Client
	resp, err := client.Do(req)

	if err != nil {
		fmt.Print("ERROR IN GETTING REPSONE FROM GETCURRENTSONG")
		fmt.Print(err)
	}

	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		fmt.Print("ERROR IN GETTING REPSONE FROM GETCURRENTSONG SONG")
		fmt.Print(err)
	}

	song := &Songs{}
	json.Unmarshal(body, song)
	return *song
}

func stopSong(token string) {

	url := "https://api.spotify.com/v1/me/player/pause"

	req := createPutRequest(token, url)

	// Send req using http Client
	resp, err := client.Do(req)

	if err != nil {
		fmt.Print("ERROR IN GETTING REPSONE FROM STOPPING SONG")
		fmt.Print(err)
	}

	_, err = ioutil.ReadAll(resp.Body)

	if err != nil {
		fmt.Print("ERROR IN GETTING REPSONE FROM STOPPING SONG")
		fmt.Print(err)
	}
}

func nextSong(token string) {

	url := "https://api.spotify.com/v1/me/player/next"

	req := createPostRequest(token, url)

	// Send req using http Client
	resp, err := client.Do(req)

	if err != nil {
		fmt.Print("ERROR IN GETTING REPSONE FROM STOPPING SONG")
		fmt.Print(err)
	}

	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		fmt.Print("ERROR IN GETTING REPSONE FROM STOPPING SONG")
		fmt.Print(err)
	}

	fmt.Print(string(body))

}

func seekSong(token string, time uint) {
	url := "https://api.spotify.com/v1/me/player/seek?position_ms=" + fmt.Sprint(time)

	req := createPutRequest(token, url)

	// Send req using http Client
	resp, err := client.Do(req)

	if err != nil {
		fmt.Print("ERROR IN GETTING REPSONE FROM STOPPING SONG")
		fmt.Print(err)
	}

	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		fmt.Print("ERROR IN GETTING REPSONE FROM STOPPING SONG")
		fmt.Print(err)
	}

	fmt.Print(string(body))

}

func getPlaylistDetails(token string, id string, isNext bool) MeganPlaylist {
	url := ""
	if isNext {
		url = id
	} else {
		url = "https://api.spotify.com/v1/playlists/" + id
	}

	req := createGetRequest(token, url)

	// Send req using http Client
	resp, err := client.Do(req)

	if err != nil {
		fmt.Print("ERROR IN GETTING REPSONE FROM GETPLAYLIST")
		fmt.Print(err)
	}

	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		fmt.Print("ERROR IN GETTING REPSONE FROM GETPLAYLIST SONG")
		fmt.Print(err)
	}

	fmt.Print(string(body))

	//unmarshal
	playlist := &MeganPlaylist{}

	json.Unmarshal(body, playlist)

	return *playlist

}

func queueSong(token string, id string) {
	url := "https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A" + id

	req := createPostRequest(token, url)

	// Send req using http Client
	resp, err := client.Do(req)

	if err != nil {
		fmt.Print("ERROR IN GETTING REPSONE FROM queueSong")
		fmt.Print(err)
	}

	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		fmt.Print("ERROR IN GETTING REPSONE FROM queueSong")
		fmt.Print(err)
	}

	fmt.Print(string(body))

}

func createGetRequest(token, url string) *http.Request {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		fmt.Print("ERROR IN CREATING GETCURRENTSONG")
		fmt.Println(err)
	}

	// add authorization header to the req
	req.Header.Add("Authorization", "Bearer "+token)

	return req

}

func createPutRequest(token, url string) *http.Request {
	req, err := http.NewRequest(http.MethodPut, url, nil)
	if err != nil {
		fmt.Print("ERROR IN CREATING GETCURRENTSONG")
		fmt.Println(err)
	}

	// add authorization header to the req
	req.Header.Add("Authorization", "Bearer "+token)

	return req

}

func createPostRequest(token, url string) *http.Request {
	req, err := http.NewRequest(http.MethodPost, url, nil)
	if err != nil {
		fmt.Print("ERROR IN CREATING QUEUEING SONG")
		fmt.Println(err)
	}

	// add authorization header to the req
	req.Header.Add("Authorization", "Bearer "+token)

	return req

}
