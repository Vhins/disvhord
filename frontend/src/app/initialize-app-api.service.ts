import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

interface user_interface {
    user_id: number,
    user_handle: number,
    user_displayName: string,
    user_logo: string,
    friends: Array<{user_id: number, user_displayName: string, user_logo: string}>,
    pending_friend_requests: Array<number>,
    chats: Array<{chat_id: number, chat_user_id: number, user_displayName: string, user_logo: string}>,
    servers_joined: Array<{server_id: number, name: string, logo: string}>,
    posts: Array<number>,
    notifications: Array<number>
}

@Injectable({
  providedIn: 'root'
})
export class InitializeAppApiService {
    IP: string

    constructor(private ruoter: Router, private authService: AuthService) {
        this.IP = "localhost:3333"
        this.get_basicUserInterfaceData()
        
    }

    user_interface!: user_interface


    async get_basicUserInterfaceData(): Promise< boolean>{
        const apiURL = `http://${this.IP}/basicUserInterfaceData`
        const request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( {"user_id": localStorage.getItem("user_id")} )
        }

        return fetch(apiURL, request)
        .then(async response =>{
            const responseData = await response.json()
            if(response.ok){
                this.user_interface = responseData.user_interfaceDB
                console.debug('responseData.user_interfaceDB', this.user_interface)
                console.debug('this.user_interface.chats', this.user_interface.chats)

                return true
            }else{
                console.debug(responseData.message)
                this.authService.removeDataLocalStorage()
                this.ruoter.navigate(['/login'])
                return false
            }
        })
        .catch(error =>{
            console.debug('Errore client fetch: ', error)
            return false
        })
    }

}