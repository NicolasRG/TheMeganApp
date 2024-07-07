import { Injectable } from '@angular/core';
import { io } from "socket.io-client";
import { CacheService } from './cache.service';
import { AfterSongInfo, GameState, MeganToken } from './models';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class SocketsService {
  socket;
  isPresenter:Boolean = false;
  playersObservale:BehaviorSubject<MeganToken[]>;
  playersAnswerObservale:BehaviorSubject<MeganToken>;
  //subscription for state of game
  gameSubscription:BehaviorSubject<GameState>;
  //song subscriber for current song info
  gameSongSubscription:BehaviorSubject<AfterSongInfo>;
  loadingSubscription:BehaviorSubject<boolean>;
  answerSubscription:BehaviorSubject<boolean>;

  constructor( private cacheService: CacheService, private router:Router){
    if(window.location.hostname == "localhost"){
      this.socket = io("http://localhost");
    }else{
      this.socket = io("https://megansburf.day"), {
        secure :true
      };
    }

    this.socket.connect();

    this.playersObservale = new BehaviorSubject([] as MeganToken[]);
    this.gameSongSubscription = new BehaviorSubject({} as AfterSongInfo);
    this.gameSubscription  = new BehaviorSubject(GameState.OPEN as GameState);
    this.loadingSubscription = new BehaviorSubject(false);
    this.answerSubscription = new BehaviorSubject(false);
    this.playersAnswerObservale = new BehaviorSubject({} as MeganToken);
    this.registerEvents();
  }

  registerEvents(){
    this.socket.on("newUserInRoom", (players)=>{
      console.log("newUserInRoom", players);
      //might have to do some transformations
      this.playersObservale.next(players.players)
      this.loadingSubscription.next(false);

      if(!this.isPresenter && 
         this.gameSubscription.getValue() == GameState.OPEN
        ){
          this.router.navigate(['/game'])
        }

    })

    this.socket.on("startedRound", ()=>{
      console.log("startedRound message");
      //might have to do some transformations
      this.gameSubscription.next(GameState.INSONG);
      this.loadingSubscription.next(false);
      this.answerSubscription.next(false);
    })

    this.socket.on("endRound", (msg)=>{
      console.log("endRound", msg);
      //might have to do some transformations
      this.gameSongSubscription.next(msg)
      this.playersObservale.next(msg.players)
      this.gameSubscription.next(GameState.AFTERSONG);
    })

    this.socket.on("correctAnswer", (msg)=>{
      console.log("corretAnswer", msg);
      //might have to do some transformations
      if(!this.isPresenter){
        this.answerSubscription.next(true);
        this.loadingSubscription.next(false);
        this.cacheService.updateScore(msg.score);
      }else{
        this.playersAnswerObservale.next({...msg.token, correct : true})
      }
    })

    this.socket.on("incorrectAnswer", (msg)=>{
      console.log("incorretAnswer", msg);
      //might have to do some transformations
      if(!this.isPresenter){
        this.loadingSubscription.next(false);
        this.answerSubscription.next(false);
      }else{
        this.playersAnswerObservale.next({...msg.token, correct : false})
      }
    })
  }

  setToPresenterMode( bool:Boolean){
    this.isPresenter = bool;
  }

  getPlayersObservale(){
    return this.playersObservale;
  }

  getAnswerObservable(){
    return this.answerSubscription;
  }
  
  getGameSubscription(){
    return this.gameSubscription;
  }

  getGameSongSubscription(){
    return this.gameSongSubscription
  }

  getLoadingSubject(){
    return this.loadingSubscription
  }

  startGame(){
    if(this.isPresenter){ 
      this.socket.emit("startGame", this.cacheService.getToken());
      this.loadingSubscription.next(true);
    }else{
      console.error("non presenter trying to trigger start game")
    }
  }

  //only the presenter will use this method
  emitCreateRoom(){
    const token = this.cacheService.getToken();
    this.socket.emit("createRoom", token);
  }

  //presenterCheckin
  emitPresenterCheckin(){
    const token = this.cacheService.getToken();
    this.socket.emit("presenterCheckin", token);
    this.loadingSubscription.next(true);
  }

  emitPlayerCheckin(){
    const token = this.cacheService.getToken();
    this.socket.emit("checkin", token);
    this.loadingSubscription.next(true);
  }

  emitAnswer(answer:String){
    let token = this.cacheService.getToken();
    this.socket.emit("submitAnswer", {...token, answer : answer});
    this.loadingSubscription.next(true);
  }



}
