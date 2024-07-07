import { Component } from '@angular/core';
import { SocketsService } from '../sockets.service';
import { CacheService } from '../cache.service';
import { Subscription } from 'rxjs';
import { AfterSongInfo, GameState, MeganToken } from '../models';
import { FormControl } from '@angular/forms';
import { avatars } from '../configs/avatars';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  $playersSubscriber:Subscription;
  players:MeganToken[] =[];
  roomCode = ""
  inGame = false;
  $gameSubscription:Subscription;
  $gameSongSubscription:Subscription;
  songInfo = {} as AfterSongInfo;
  state = GameState.OPEN;
  gameState = GameState;
  avatars = avatars

  useranswer = new FormControl('');

  hasCorrectAnswer = false;
  userToken = {} as MeganToken;

  constructor(private sockets:SocketsService, private token:CacheService){
    this.$playersSubscriber = sockets.getPlayersObservale().subscribe((players)=>{
      this.players = players;
    });

    this.$gameSubscription = sockets.getGameSubscription().subscribe((state)=>{
      this.state = state;
      this.useranswer.setValue("");
      this.useranswer.setErrors({});
    })

    this.$gameSongSubscription = sockets.getGameSongSubscription().subscribe((songInfo)=>{
      this.songInfo = songInfo
    })

    sockets.getAnswerObservable().subscribe((bool)=>{
      this.hasCorrectAnswer = bool
    })

    token.$token.subscribe((token)=>{
      this.userToken = token
      this.roomCode = token.roomCode
    })

    sockets.getAnswerObservable().subscribe((bool)=>{
      this.hasCorrectAnswer = bool

      if(!bool){
        this.useranswer.setErrors({'incorrect': true})
      }
    })
  }

  submitAnswer(){
    this.sockets.emitAnswer(this.useranswer.value+"")
  }





}
