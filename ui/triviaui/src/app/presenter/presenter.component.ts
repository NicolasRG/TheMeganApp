import { Component, OnInit } from '@angular/core';
import { SocketsService } from '../sockets.service';
import { ActivatedRoute } from '@angular/router';
import { CacheService } from '../cache.service';
import { AfterSongInfo, GameState, MeganToken } from '../models';
import { Observable, Subscription } from 'rxjs';
import { avatars } from '../configs/avatars';

@Component({
  selector: 'app-presenter',
  templateUrl: './presenter.component.html',
  styleUrls: ['./presenter.component.scss']
})
export class PresenterComponent implements OnInit{
  $playersSubscriber:Subscription;
  players:MeganToken[] =[];
  roomCode = ""
  inGame = false;
  $gameSubscription:Subscription;
  $gameSongSubscription:Subscription;
  songInfo = {} as AfterSongInfo;
  state = GameState.OPEN;
  gameState = GameState
  avatars = avatars;
  correctPlayers:MeganToken[] = [];

  constructor( private sockets:SocketsService, private activeRoute:ActivatedRoute, private tokenService:CacheService){
    this.sockets.setToPresenterMode(true);
    //get the roomid from query params in the url
   
    this.activeRoute.queryParams
      .subscribe(params => {
        console.log(params);
        const roomid = params["roomid"];
        this.roomCode = roomid;
        const meganToken:MeganToken = {
          userName : "PRESENTER",
          roomCode : roomid,
          creationtime : Date.now(),
          score : -1,
          avatar : -1
        }
        this.tokenService.setToken(meganToken);
      }
    );

    this.$playersSubscriber = sockets.getPlayersObservale().subscribe((players)=>{
      this.players = players;
    });

    this.$gameSubscription = sockets.getGameSubscription().subscribe((state)=>{
      this.state = state;
      if(this.state == GameState.INSONG){
        this.correctPlayers = [];
      }
    })

    this.$gameSongSubscription = sockets.getGameSongSubscription().subscribe((songInfo)=>{
      this.songInfo = songInfo
    })

    sockets.playersAnswerObservale.subscribe((mgtoken)=>{
      if(mgtoken?.correct){
        this.correctPlayers.push(mgtoken)
      }else{
        //edit this to update the css effect for that player
      }
    })
  }

  ngOnInit(): void {
    this.sockets.emitPresenterCheckin()
  }

  startGame(){
    console.log("hitting start game")
    this.sockets.startGame();
  }

  isInGame(){
    return this.state == GameState.OPEN
  }

  isPlayerCorrect(userName : string){
    let found = false
    this.correctPlayers.forEach((player)=>{
      if(player.userName == userName){
        found = true
      }
    })

    return found;
  }

}
