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

    close() {
        this.chatService.openingUserProfile.set(false)
    }
}
