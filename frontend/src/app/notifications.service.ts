import { inject, Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Messages } from './components/chat/chat.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
    readonly showNotification$ = new BehaviorSubject<"call" | "message" | null>(null)
    readonly incomingCall$ = new BehaviorSubject<any | null>(null)

    private webSocketService = inject(WebSocketService)

    listenForNotifications() {
        this.webSocketService.on("personal_message_received").subscribe((data: Messages) => {
            this.showNotification$.next("message")
        })
        this.webSocketService.on("personal_call_started").subscribe(data => {
            this.incomingCall$.next(data)
        })
    }
  
}
