import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InitializeAppApiService } from '../../initialize-app-api.service';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css'
})
export class ChatsComponent {
    InitializeAppApiService: InitializeAppApiService

    constructor(initializeAppApiService: InitializeAppApiService) {
        this.InitializeAppApiService = initializeAppApiService
    }

    getUserChats () {
        return this.InitializeAppApiService.user_interface.chats
    }
}
