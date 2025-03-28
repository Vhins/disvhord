import { Injectable } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { environment } from '../environments/environment';
import { WebSocketService } from './web-socket.service';

interface user_interface {
    user_id: number,
    user_handle: string,
    user_displayName: string,
    user_logo: string,
    friends: Array<{user_id: number, user_displayName: string, user_logo: string}>,
    pending_friend_requests: Array<number>,
    blocked: Array<number>,
    chats: Array<{chat_id: number, chat_user_id: number, user_displayName: string, user_logo: string}>,
    servers_joined: Array<{server_id: number, name: string, logo: string}>,
    posts: Array<number>,
    notifications: {friend_request: Array<{user_id: number, user_handle: string, user_logo: string, timestamp: number}>}
}

@Injectable({
  providedIn: 'root'
})
export class InitializeAppApiService {
    IP: string = "localhost:3333"  

    constructor(private authService: AuthService, private webSocketService: WebSocketService) {}

    private _user_interface!: user_interface
    get user_interface(): user_interface { return this._user_interface }


    async get_basicUserInterfaceData(): Promise<boolean>{
        const apiURL = `http://${environment.IP}/basicUserInterfaceData`
        const request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("privateToken")}`
            },
            body: JSON.stringify( {"user_id": localStorage.getItem("user_id")} )
        }

        return fetch(apiURL, request)
        .then(async response =>{
            const responseData = await response.json()
            if(response.ok){
                this._user_interface = responseData.user_interfaceDB
                return true
            }else{
                this.authService.removeDataLocalStorage()
                return false
            }
        })
        .catch(error =>{
            console.error(error)
            return false
        })
    }

    listenForUserInterfaceChanges() {
        this.webSocketService.on("userInterface").subscribe(data => {
            console.debug('userInterface', data)
            switch(data.type) {
                case 'add_friend':
                    this._user_interface.friends.push({user_id: data.user_id, user_displayName: data.user_displayName, user_logo: data.user_logo})
                    break
                case 'removed_friend':
                    this._user_interface.friends = this._user_interface.friends.filter(user_id => user_id.user_id !== Number(data.user_id))
                    break
                case 'pending_friend_requests':
                    const friend_requests = { user_id: data.user_id, user_handle: data.user_handle, user_logo: data.user_logo, timestamp: data.timestamp }
                    this._user_interface.notifications.friend_request.push(friend_requests)
                    break
                case 'blocked_user':
                    this._user_interface.blocked.push(data.user_id)
                    break
                case 'unblocked_user':
                    this._user_interface.blocked = this._user_interface.blocked.filter(user_id => user_id !== Number(data.user_id))
                    break
            }
        })
    }

}
