import { AfterContentChecked, Component, inject } from '@angular/core';
import { ChatService } from '../chat/chat.service';
import { environment } from '../../../environments/environment';

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

    ngAfterContentChecked() {
        this.user_chat_name = this.chatService.users_info[this.chatService.chat_user_id]?.name
        this.user_chat_logo = this.chatService.users_info[this.chatService.chat_user_id]?.logo
        this.user_id = this.chatService.users_info[this.chatService.chat_user_id]?.id
    }

    async callThisChat() {
        this.chatService.callThisChatNow()
    }

    removeFriend() {
        fetch(`http://${environment.SERVER_IP}/removeFriend`, {
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
        fetch(`http://${environment.SERVER_IP}/tryToSendFriendRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify({
                'friend_user_handle': this.user_chat_name
            })
        }).then( res => {
            this.chatService.chat_user_friendRequestSend = true
        })
    }

    acceptFriendRequest() {
        fetch(`http://${environment.SERVER_IP}/acceptFriendRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify({
                'friend_user_id': this.user_id
            })
        })
    }

    refuseFriendRequest() {
        fetch(`http://${environment.SERVER_IP}/deleteFriendRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify({
                'friend_user_id': this.user_id, 'refusing': true
            })
        })
    }

    removeFriendRequest() {
        this.chatService.chat_user_friendRequestSend = false
        fetch(`http://${environment.SERVER_IP}/deleteFriendRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify({
                'friend_user_id': this.user_id, 'refusing': false
            })
        })
    }

    blockUser() {
        fetch(`http://${environment.SERVER_IP}/blockUser`, {
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
        fetch(`http://${environment.SERVER_IP}/removeBlockFromUser`, {
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
    
}
