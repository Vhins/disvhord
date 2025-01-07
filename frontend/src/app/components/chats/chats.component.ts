import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InitializeAppApiService } from '../../initialize-app-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css'
})
export class ChatsComponent {
    InitializeAppApiService: InitializeAppApiService

    constructor(initializeAppApiService: InitializeAppApiService, private ruoter: Router) {
        this.InitializeAppApiService = initializeAppApiService
    }

    getUserChats () {
        return this.InitializeAppApiService.user_interface.chats
    }

    ruoteToChat(event: Event) {
        const target = event.target as HTMLDivElement
        this.ruoter.navigate([`/app/home/chat/${target.id}`])
    }
}
