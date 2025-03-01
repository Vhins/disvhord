import { Component, inject } from '@angular/core';
import { NotificationsService, NotificationType } from '../../notifications.service';
import { ChatService } from '../chat/chat.service';

interface NotificationData {
    type: NotificationType,
    image: string
    name?: string
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {
    notificationData: NotificationData | null = null
    _timeoutId: any = null

    notificationsService: NotificationsService = inject(NotificationsService)
    chatService: ChatService = inject(ChatService)

    constructor() {
        this.notificationsService.showNotification$.subscribe( data => {
            if (!data) return

            this.notificationData = {
                type: data.type,
                image: this.chatService.users_info[data.sender].img,
                name: this.chatService.users_info[data.sender]?.name
            }

            if (this._timeoutId) { clearTimeout(this._timeoutId) }

            this._timeoutId = setTimeout(() => {
                this.notificationData = null
            }, 50000)
        })
    }
}
