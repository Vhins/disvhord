import { Component, inject } from '@angular/core';
import { NotificationsService, NotificationType } from '../../notifications.service';
import { ChatService } from '../chat/chat.service';
import { Router } from '@angular/router';
import { InitializeAppApiService } from '../../initialize-app-api.service';

interface NotificationData {
    type: NotificationType
    name?: string
    image?: string
    sender?: number
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
    router: Router = inject(Router)
    initializeAppApiService: InitializeAppApiService = inject(InitializeAppApiService)

    ngOnInit() {
        this.notificationsService.showNotification$.subscribe( data => {
            if (!data) return
            if (!this.showNotificationOrNot(data.type, data.sender)) return

            this.notificationData = {
                type: data.type,
                image: data.image,
                name: data.name
            }

            if (this._timeoutId) { clearTimeout(this._timeoutId) }

            this._timeoutId = setTimeout(() => {
                this.notificationData = null
            }, 5000)
        })
    }

    closeNotification() {
        this.notificationData = null
    }

    showNotificationOrNot(type: NotificationType, sender: number | undefined): boolean {
        const fullPath = this.router.url
        console.log(fullPath)
        
        if (type === 'message' && sender !== undefined || type === 'call' && sender !== undefined) {
            const chatID = this.initializeAppApiService.user_interface.chats.find( chat => chat.chat_user_id === sender )?.chat_id
            if (fullPath.startsWith('/app/home/chat') && fullPath.endsWith(`/${chatID}`)) return false

            return true
        }

        return true
    }
}
