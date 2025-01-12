import { Component } from '@angular/core';
import { InitializeAppApiService } from '../../initialize-app-api.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-server-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './server-list.component.html',
  styleUrl: './server-list.component.css'
})
export class ServerListComponent {
    constructor(private initializeAppApiService: InitializeAppApiService) {}

    getJoinedServers () {
        return this.initializeAppApiService.user_interface.servers_joined
    }
}
