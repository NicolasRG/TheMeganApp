package songplatformer

type MeganPlaylist struct {
	MeganTracks Items `json:"tracks"`
}

type Items struct {
	Items   []Tracks `json:"items"`
	NextUrl string   `json:"next"`
}

type Tracks struct {
	MTrack Track `json:"track"`
}

type Track struct {
	MeganAlbum Album    `json:"album"`
	Name       string   `json:"name"`
	Id         string   `json:"id"`
	Artists    []Artist `json:"artists"`
	Duration   uint     `json:"duration_ms"`
}

type Album struct {
	Name   string        `json:"name"`
	Images []AlbumImages `json:"images"`
}
type Artist struct {
	Name string `json:"name"`
}

type AlbumImages struct {
	Url string `json:"url"`
}

type Songs struct {
	Song Track `json:"item"`
}

func (p *MeganPlaylist) PopSong() MeganSong {
	current, rest := p.MeganTracks.Items[0], p.MeganTracks.Items[1:]
	p.MeganTracks.Items = rest

	return MeganSong{
		Title:    current.MTrack.Name,
		Album:    current.MTrack.MeganAlbum.Name,
		Artist:   current.MTrack.Artists[0].Name,
		AlbumArt: current.MTrack.MeganAlbum.Images[0].Url,
		Uid:      current.MTrack.Id,
		Duration: current.MTrack.Duration,
	}
}
