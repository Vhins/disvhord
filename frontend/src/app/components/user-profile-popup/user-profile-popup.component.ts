import { Component, inject } from '@angular/core';
import { ChatService } from '../chat/chat.service';

@Component({
  selector: 'app-user-profile-popup',
  standalone: true,
  imports: [],
  templateUrl: './user-profile-popup.component.html',
  styleUrl: './user-profile-popup.component.css'
})
export class UserProfilePopupComponent {
    chatService: ChatService = inject(ChatService)
    user_chat_name!: string
    user_chat_logo!: string

    ngAfterContentChecked() {
        if (this.chatService.openedUserProfile === null) return
        this.user_chat_name = this.chatService.users_info[this.chatService.openedUserProfile]?.name
        this.user_chat_logo = this.chatService.users_info[this.chatService.openedUserProfile]?.logo
    }

    close() {
        this.chatService.openingUserProfile.set(false)
    }
}
