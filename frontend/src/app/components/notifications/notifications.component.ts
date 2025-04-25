import { Component } from '@angular/core';
import { InitializeAppApiService } from '../../initialize-app-api.service';
import { RelativeTimePipe } from '../../relative-time.pipe';
import { DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [RelativeTimePipe, DatePipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
    friend_request: {user_id: number, user_handle: string, user_logo: string, timestamp: number}[]
    showTooltip = false 
    constructor(public initializeAppService: InitializeAppApiService) {
        const friend_request = this.initializeAppService.user_interface.notifications.friend_request
        if (friend_request !== undefined) {
            this.friend_request = friend_request
        } else {
            this.friend_request = []
        }
    }

    acceptFriendRequest(friend_user_id: number) {
        fetch(`http://${environment.SERVER_IP}/acceptFriendRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify({
                'friend_user_id': friend_user_id
            })
        }).then( res => {
            res.json().then( resjson => {
                this.initializeAppService.user_interface.friends.push(
                    {user_id: resjson.user_id, user_displayName: resjson.displayName, user_logo: resjson.user_logo}
                )
                this.removeFriendRequestNotification(friend_user_id)
            })
        })
    }

    deleteFriendRequest(friend_user_id: number) {
        fetch(`http://${environment.SERVER_IP}/deleteFriendRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify({
                'friend_user_id': friend_user_id
            })
        }).then( () => {
            this.removeFriendRequestNotification(friend_user_id)
        })
    }

    removeFriendRequestNotification(friend_user_id: number) {
        const filtered = this.initializeAppService.user_interface.notifications.friend_request.filter(user => user.user_id !== friend_user_id)
        this.initializeAppService.user_interface.notifications.friend_request = filtered
        this.friend_request = filtered
    }


}
