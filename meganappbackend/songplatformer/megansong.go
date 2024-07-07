package songplatformer

type MeganSong struct {
	Title    string `json:"title"`
	Album    string `json:"album"`
	Artist   string `json:"artist"`
	AlbumArt string `json:"url"`
	Uid      string `json:"-"`
	Duration uint   `json:"-"`
}
