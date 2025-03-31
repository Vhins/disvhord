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
    user_id!: number
    
    chatService = inject(ChatService)

    friendRequestSend = false

    ngAfterContentChecked() {
        this.user_chat_name = this.chatService.users_info[this.chatService.chat_user_id]?.name
        this.user_chat_logo = this.chatService.users_info[this.chatService.chat_user_id]?.img
        this.user_id = this.chatService.users_info[this.chatService.chat_user_id]?.id
    }

    async callThisChat() {
        this.chatService.callThisChatNow()
    }
    
    blockUser() {
        fetch('http://localhost:3333/blockUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify({
                'user_id': this.user_id
            })
        }).then( res => {
            this.chatService.chat_user_isBlocked = true
        })
    }

    removeBlockFromUser() {
        fetch('http://localhost:3333/removeBlockFromUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify({
                'user_id': this.user_id
            })
        }).then( res => {
            this.chatService.chat_user_isBlocked = false
        })
    }

    removeFriend() {
        fetch('http://localhost:3333/removeFriend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify({
                'friend_user_handle': this.user_id
            })
        }).then( res => {
            this.chatService.chat_user_isFriend.set(false)
        })
    }

    sendFriendRequest() {
        fetch('http://localhost:3333/tryToSendFriendRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify({
                'friend_user_handle': this.user_chat_name
            })
        }).then( res => {
            this.friendRequestSend = true
        })
    }

    removeFriendRequest() {
        this.friendRequestSend = false
    }
}
