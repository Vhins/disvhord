import { Component } from '@angular/core';
import { ChatsComponent } from '../chats/chats.component';
import { RapidControlsComponent } from '../rapid-controls/rapid-controls.component';
import { SideBarChatComponent } from '../side-bar-chat/side-bar-chat.component';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SideBarComponent } from "../side-bar/side-bar.component";
import { ControlsBarComponent } from "../controls-bar/controls-bar.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, ChatsComponent, RapidControlsComponent, SideBarComponent, SideBarChatComponent, ControlsBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
    pathLocation: string
    
    constructor(private router: Router) {
        this.pathLocation = this.router.url
    
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.pathLocation = event.urlAfterRedirects
            }
        })
    }

}
