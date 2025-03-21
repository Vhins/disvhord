import { Injectable } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { environment } from '../environments/environment';

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

    constructor(private authService: AuthService) {}

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

}
