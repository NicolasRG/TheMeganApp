package songplatformer

type Presenter struct {
	Tokens Tokenset
	Url    string
}

// dont @ me
type Tokenset struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	Scope        string `json:"scope"`
	ExpiresIn    uint   `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
}

func CreatePresenter(tokens Tokenset) Presenter {
	return Presenter{
		Tokens: tokens,
		Url:    "https://open.spotify.com/playlist/6B4R99L70WbpGZcvbyPEFg",
	}
}
//actual https://open.spotify.com/playlist/6B4R99L70WbpGZcvbyPEFg
//https://open.spotify.com/playlist/1ZFe5RWlWLhog2eJbC8lbw mine
//https://open.spotify.com/playlist/01HpvTnfCqt10ZInQ2FVYj nicks


// todo hopefully never happens :/
func (p *Presenter) RefreshToken() {

}
