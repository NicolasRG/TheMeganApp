import { Component, OnInit, TemplateRef } from '@angular/core';
import { SocketsService } from './sockets.service';
import { ngxLoadingAnimationTypes } from 'ngx-loading';
import { Subscription } from 'rxjs';


const PrimaryWhite = '#ffffff';
const SecondaryGrey = '#ccc';
const PrimaryRed = '#dd0031';
const SecondaryBlue = '#1976d2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'triviaui';
  loading = false;
  $loading;
  public primaryColour = PrimaryWhite;
  public secondaryColour = SecondaryGrey;
  public loadingTemplate!: TemplateRef<any>;


  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;

  constructor(private sockets:SocketsService){
    this.$loading = new Subscription();
  }

  ngOnInit(): void {
    this.$loading = this.sockets.getLoadingSubject().subscribe((bool)=>{
      this.loading = bool
    })
  }
  


}
