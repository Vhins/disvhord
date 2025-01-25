import { Component, ElementRef, ViewChild } from '@angular/core';
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
    @ViewChild('input') input!: ElementRef

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

    sendFriendRequest(event: Event | null) {
        event?.preventDefault()

        const input = this.input.nativeElement as HTMLInputElement

        if (String(this.initializeAppApiService.user_interface.user_handle) == input.value) {
            this.statusFriendRequest = 6
            return
        }

        fetch('http://localhost:3333/tryToSendFriendRequest', {
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
                console.log('resjson', resjson.statusFriendRequest)
                this.statusFriendRequest = resjson.statusFriendRequest
            })
        })
    }
}
