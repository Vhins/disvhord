import { Component } from '@angular/core';
import { ChatsComponent } from '../chats/chats.component';
import { RapidControlsComponent } from '../rapid-controls/rapid-controls.component';
import { SideBarChatComponent } from '../side-bar-chat/side-bar-chat.component';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from "../side-bar/side-bar.component";
import { Location } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, ChatsComponent, RapidControlsComponent, SideBarComponent, SideBarChatComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
    location: Location;
    constructor(location: Location) {
        this.location = location;
    }

    showorhide(): boolean {
        console.log('aa', this.location.path())
        return this.location.path() === '/app/home/me';
    }

}
