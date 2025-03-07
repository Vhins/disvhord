import { Component } from '@angular/core';
import { InitializeAppApiService } from '../../initialize-app-api.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
    friend_request: {user_id: number, user_handle: string, user_logo: string, timestamp: string}[]

    constructor(public initializeAppService: InitializeAppApiService) {
        const friend_request = this.initializeAppService.user_interface.notifications.friend_request
        if (friend_request !== undefined) {
            this.friend_request = friend_request.map( ({timestamp, ...arr}) => ({...arr, timestamp: this.formatRelativeTime(timestamp)}) )
        } else {
            this.friend_request = []
        }
    }

    acceptFriendRequest(friend_user_id: number) {
        fetch('http://localhost:3333/acceptFriendRequest', {
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
                    {user_id: resjson.friendInfo.user_id, user_displayName: resjson.friendInfo.displayName, user_logo: resjson.friendInfo.user_logo}
                )
            })
        })
    }

    deleteFriendRequest(friend_user_id: number) {
        fetch('http://localhost:3333/deleteFriendRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify({
                'friend_user_id': friend_user_id
            })
        }).then( () => {
            console.debug('tolta richiesta amicizia!')
        })
    }

    formatRelativeTime(timestamp: string | number) {
        const now: number = new Date().getTime()
        const then: number = new Date(timestamp).getTime()
    
        const diffInSeconds = Math.floor((now - then) / 1000)
        const rtf = new Intl.RelativeTimeFormat('it', { numeric: 'auto' })
    
        if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second')
    
        const diffInMinutes = Math.floor(diffInSeconds / 60)
        if (diffInMinutes < 60) return rtf.format(-diffInMinutes, 'minute')
    
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return rtf.format(-diffInHours, 'hour')
    
        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 30) return rtf.format(-diffInDays, 'day')
    
        const diffInMonths = Math.floor(diffInDays / 30)
        if (diffInMonths < 12) return rtf.format(-diffInMonths, 'month')
    
        const diffInYears = Math.floor(diffInMonths / 12)
        return rtf.format(-diffInYears, 'year')
    }

}
