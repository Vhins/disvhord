import { Component, ElementRef, viewChild } from '@angular/core';
import { InitializeAppApiService } from '../../initialize-app-api.service';
import { Router } from '@angular/router';
import { ChatService } from '../chat/chat.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-friend-list',
  standalone: true,
  imports: [],
  templateUrl: './friend-list.component.html',
  styleUrl: './friend-list.component.css'
})
export class FriendListComponent {
    input = viewChild.required<ElementRef<HTMLInputElement>>('input')

    constructor(private initializeAppApiService: InitializeAppApiService, private router: Router, private chatService: ChatService) {}

    statusFriendRequest: number = 0

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

    sendFriendRequest(event?: Event) {
        event?.preventDefault()

        const input = this.input().nativeElement as HTMLInputElement

        if (String(this.initializeAppApiService.user_interface.user_handle) == input.value || input.value === "") {
            this.statusFriendRequest = 0
            return
        }

        fetch(`http://${environment.SERVER_IP}/tryToSendFriendRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify({
                'friend_user_handle': input.value
            })
        }).then( res => {
            res.json().then( resjson => {
                this.statusFriendRequest = resjson.statusFriendRequest
            })
        })
    }
    
}
