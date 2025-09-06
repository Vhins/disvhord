import { inject, Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Messages } from './components/chat/chat.model';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = "call" | "message" | "friend_req" | "server_invite"

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
    readonly showNotification$ = new BehaviorSubject<{type: NotificationType, sender: number, logo?: string, name?: string} | null>(null)
    readonly incomingCall$ = new BehaviorSubject<any | null>(null)

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
            case 'pending_friend_requests':
                this.showNotification$.next({type: "call", sender: data})
                break
            }
        })
    }
  
}
