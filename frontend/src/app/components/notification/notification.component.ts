import { Component, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationsService } from '../../notifications.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {
    notificationType: "call" | "message" | null = null
    _timeoutId: any = null

    notificationsService: NotificationsService = inject(NotificationsService)

    constructor() {
        this.notificationsService.showNotification$.subscribe( type => {
            this.notificationType = type

            if (this._timeoutId) { clearTimeout(this._timeoutId) }

            this._timeoutId = setTimeout(() => {
                this.notificationType = null
            }, 5000)
        })
    }
}
