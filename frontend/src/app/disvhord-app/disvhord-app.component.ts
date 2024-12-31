import { Component } from '@angular/core';
import { ChatsComponent } from "../components/chats/chats.component";
import { RapidControlsComponent } from "../components/rapid-controls/rapid-controls.component";

@Component({
  selector: 'app-disvhord-app',
  standalone: true,
  imports: [ChatsComponent, RapidControlsComponent],
  templateUrl: './disvhord-app.component.html',
  styleUrl: './disvhord-app.component.css'
})
export class DisvhordAppComponent {

}
