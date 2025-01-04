import { Component } from '@angular/core';
import { ServerListComponent } from "../components/server-list/server-list.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-disvhord-app',
  standalone: true,
  imports: [ServerListComponent, RouterOutlet],
  templateUrl: './disvhord-app.component.html',
  styleUrl: './disvhord-app.component.css'
})
export class DisvhordAppComponent {}
