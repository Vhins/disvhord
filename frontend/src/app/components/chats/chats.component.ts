import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InitializeAppApiService } from '../../initialize-app-api.service';
import { Router } from '@angular/router';
import { ChatService } from '../../chat.service';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css'
})
export class ChatsComponent {

    constructor(public initializeAppApiService: InitializeAppApiService, public chatService: ChatService, private router: Router) {}

    getUserChats () {
        return this.initializeAppApiService.user_interface.chats
    }

    ruoteToChat(event: Event) {
        const target = event.currentTarget  as HTMLDivElement
        this.chatService.chat_id = Number(target.id)
        this.router.navigate([`/app/home/chat/${target.id}`])
    }
}
