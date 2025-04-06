import { inject, Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Messages } from './components/chat/chat.model';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = "call" | "message" | "friend_req" | "server_invite"

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
    readonly showNotification$ = new BehaviorSubject<{type: NotificationType, sender: number} | null>(null)
    readonly incomingCall$ = new BehaviorSubject<any | null>(null)
    readonly FriendAdded$ = new BehaviorSubject<number | null>(null)
    readonly FriendRemoved$ = new BehaviorSubject<number | null>(null)
    readonly NewFriendRequest$ = new BehaviorSubject<number | null>(null)

    private webSocketService = inject(WebSocketService)
    user_id = Number(localStorage.getItem("user_id"))

    listenForNotifications() {
        this.webSocketService.on("personal_message_received").subscribe((data: Messages) => {
            if (data.sender !== this.user_id) {
                this.showNotification$.next({type: "message", sender: data.sender})
            }
        })
        this.webSocketService.on("personal_call_started").subscribe(data => {
            this.incomingCall$.next(data)
            this.showNotification$.next({type: "call", sender: data.sender})
        })
        this.webSocketService.on("userInterface").subscribe(data => {
            switch(data.type) {
                case 'add_friend':
                    this.FriendAdded$.next(data.user_id)
                    break
                case 'removed_friend':
                    this.FriendRemoved$.next(data.user_id)
                    break
                case 'pending_friend_requests':
                    this.NewFriendRequest$.next(data.user_handle)
                    this.showNotification$.next({type: "call", sender: data.sender})
                    break
            }
        })
    }
  
}
