import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { LoginComponent } from './login/login.component';
import { RoomComponent } from './room/room.component';
import { PresenterComponent } from './presenter/presenter.component';

const routes: Routes = [{
  path : "room",
  component : RoomComponent
},{
  path : "game",
  component :GameComponent
},{
  path : "presenter",
  component : PresenterComponent
},
{
  path: "**",
  component : LoginComponent,  
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
