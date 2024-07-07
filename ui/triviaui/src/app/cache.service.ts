import { Injectable } from '@angular/core';
import { MeganToken } from './models';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CacheService {


  token:MeganToken | null;
  $token = new BehaviorSubject<MeganToken>({} as MeganToken);

  constructor() { 
    try{
      let toke = JSON.parse(localStorage.getItem('meganToken')+"");
      this.token = toke;
    }catch(err){
      this.token = null;
    }
  }

  setToken(meganToken:MeganToken){
    this.token = meganToken
    const toke = JSON.stringify(meganToken)
    localStorage.setItem('meganToken', toke)
    this.$token.next(meganToken)
  }

  getToken(){
    return this.token
  }

  hardRefreshToken(){
    try{
      let toke = JSON.parse(localStorage.getItem('meganToken')+"");
      this.token = toke;
    }catch(err){
      this.token = null;
    }
  }

  updateScore(newscore:number){
    this.token = {...this.token, score:newscore} as MeganToken
    this.$token.next(this.token)
  }


}
