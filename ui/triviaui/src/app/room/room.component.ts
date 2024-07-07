import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CacheService } from '../cache.service';
import { MeganToken } from '../models';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent {

  meganToken:MeganToken

  constructor(private cache:CacheService, private router:Router){
    const token = cache.getToken();

    if(!token || token == null){
      router.navigateByUrl('login');
    }

    this.meganToken = token as MeganToken;
  }
  




}
