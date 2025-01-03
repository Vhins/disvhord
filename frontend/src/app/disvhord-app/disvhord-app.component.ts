import { Component } from '@angular/core';
import { ChatsComponent } from "../components/chats/chats.component";
import { RapidControlsComponent } from "../components/rapid-controls/rapid-controls.component";
import { ServerListComponent } from "../components/server-list/server-list.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-disvhord-app',
  standalone: true,
  imports: [ChatsComponent, RapidControlsComponent, ServerListComponent, RouterOutlet],
  templateUrl: './disvhord-app.component.html',
  styleUrl: './disvhord-app.component.css'
})
export class DisvhordAppComponent {

}
