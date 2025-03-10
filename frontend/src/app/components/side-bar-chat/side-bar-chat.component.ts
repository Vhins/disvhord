import { AfterContentChecked, Component, inject } from '@angular/core';
import { ChatService } from '../chat/chat.service';

@Component({
  selector: 'app-side-bar-chat',
  standalone: true,
  imports: [],
  templateUrl: './side-bar-chat.component.html',
  styleUrl: './side-bar-chat.component.css'
})
export class SideBarChatComponent implements AfterContentChecked{
    user_chat_name!: string
    user_chat_logo!: string

    chatService = inject(ChatService)

    ngAfterContentChecked() {
        this.user_chat_name = this.chatService.users_info[this.chatService.chat_user_id]?.name
        this.user_chat_logo = this.chatService.users_info[this.chatService.chat_user_id]?.img
    }

    async callThisChat() {
        this.chatService.callThisChatNow()
    }
    
}
