import { Component, ViewChild, ViewChildren } from '@angular/core';
import { ChatService } from '../../chat.service';
import { ChatComponent } from '../chat/chat.component';
import { CallComponent } from '../call/call.component';

@Component({
  selector: 'app-side-bar-chat',
  standalone: true,
  imports: [],
  templateUrl: './side-bar-chat.component.html',
  styleUrl: './side-bar-chat.component.css'
})
export class SideBarChatComponent {
    user_chat_name!: string
    user_chat_logo!: string

    constructor(private chatService: ChatService){}

    ngAfterContentChecked() {
        this.user_chat_name = this.chatService.users_info[this.chatService.chat_user_id]?.name
        this.user_chat_logo = this.chatService.users_info[this.chatService.chat_user_id]?.img
    }

    callThisCha() {
        console.log('cry')
    }
    
}
