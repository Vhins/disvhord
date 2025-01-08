import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: ` <img style="position: fixed; top: 10px; right: 10px" src="../favicon.ico"> <router-outlet></router-outlet> `
})

export class AppComponent {}
