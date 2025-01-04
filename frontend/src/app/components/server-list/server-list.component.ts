import { Component } from '@angular/core';
import { InitializeAppApiService } from '../../initialize-app-api.service';

@Component({
  selector: 'app-server-list',
  standalone: true,
  imports: [],
  templateUrl: './server-list.component.html',
  styleUrl: './server-list.component.css'
})
export class ServerListComponent {
    InitializeAppApiService: InitializeAppApiService

    constructor(initializeAppApiService: InitializeAppApiService) {
        this.InitializeAppApiService = initializeAppApiService
    }

    getJoinedServers () {
        return this.InitializeAppApiService.user_interface.servers_joined
    }
}
