import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CacheService } from '../cache.service';
import { MeganToken } from '../models';
import { SocketsService } from '../sockets.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{

  name = new FormControl('');
  roomCode = new FormControl('');
  showRoomForm = false;

  constructor(private cacheService:CacheService, 
    private router:Router,
    private socket:SocketsService
    ){

  }

  ngOnInit(): void {
      //check to see if some cache has a token
      const token = this.cacheService.getToken();
      //auto populate fields
  }



  onJoinRoom(){
    this.showRoomForm = true;
  }

  submitJoinRoom(){
    console.log(this.name.value, this.roomCode.value);
    //create megan token
    const meganToken:MeganToken = {
      userName : this.name.value+"",
      roomCode : this.roomCode.value+"",
      creationtime : Date.now(),
      score : 0,
      avatar : -1
    }

    this.cacheService.setToken(meganToken)
    //emit socket connection to join a room
    this.socket.emitPlayerCheckin();
  }

  onCreateRoom(){
    //this should be part of a service call, not in the compoenent

    if(window.location.hostname == "localhost"){
      document.location.href = 'http://localhost/api/presentermode';
    }else{
      document.location.href = '/api/presentermode';
    }
    
    // this.router.navigate(['/presenter']).catch(err =>{
    //   console.log(err, "wtf happened")
    // });
  }


}
