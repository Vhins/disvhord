import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InitializeAppApiService } from './initialize-app-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: ` <img style="position: fixed; top: 10px; right: 10px" src="../favicon.ico"> <router-outlet></router-outlet> `
})

export class AppComponent {
    InitializeAppApiService: InitializeAppApiService

    constructor(initializeAppApiService: InitializeAppApiService) {
        this.InitializeAppApiService = initializeAppApiService
    }

    async domLoaded() {
        await this.InitializeAppApiService.get_basicUserInterfaceData()
    }
}
