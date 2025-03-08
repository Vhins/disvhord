import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: ` <img style="position: fixed; top: 10px; right: 10px; width: 14px" src="favicon.ico" draggable="false"> <router-outlet></router-outlet> `
})

export class AppComponent {}
