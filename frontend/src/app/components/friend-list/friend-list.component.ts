import { Component } from '@angular/core';
import { InitializeAppApiService } from '../../initialize-app-api.service';
import { Router } from '@angular/router';
import { ChatService } from '../../chat.service';

@Component({
  selector: 'app-friend-list',
  standalone: true,
  imports: [],
  templateUrl: './friend-list.component.html',
  styleUrl: './friend-list.component.css'
})
export class FriendListComponent {

    constructor(private initializeAppApiService: InitializeAppApiService, private router: Router, private chatService: ChatService) {}

    getFriendsList () {
        return this.initializeAppApiService.user_interface.friends
    }

    ruoteToChat(event: Event) {
        const target = event.currentTarget  as HTMLDivElement
        this.chatService.chat_id = Number(target.id)
        for (let chat of this.initializeAppApiService.user_interface.chats) {
            if (chat.chat_user_id == Number(target.id)) {
                this.router.navigate([`/app/home/chat/${chat.chat_id}`])
                // this.chatService.toggleBooleanInternally()
            }
        }
    }
}
