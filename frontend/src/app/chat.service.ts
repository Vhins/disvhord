import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { InitializeAppApiService } from "./initialize-app-api.service";

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    IP = "localhost:3333"
    user_id: number
    messages: {content: string, sender: number, receiver: number, message_id: number, timestamp: string}[] = []
    users_info: {[key: number]: {id: number, name: string, img: string}} = {}
    chat_id!: number
    chat_user_id!: number

    
    InitializeAppApiService: InitializeAppApiService
    constructor(private route: ActivatedRoute, InitializeAppApiService: InitializeAppApiService) {
        this.InitializeAppApiService = InitializeAppApiService

        this.user_id = this.InitializeAppApiService.user_interface.user_id

        this.users_info[this.user_id] = {id: this.InitializeAppApiService.user_interface.user_id, name: this.InitializeAppApiService.user_interface.user_displayName, img: this.InitializeAppApiService.user_interface.user_logo}

        this.route.paramMap.subscribe(param => {
            this.chat_id = Number(param.get('chat_id'))

            this.chat_user_id = this.InitializeAppApiService.user_interface.chats.find(chat => chat.chat_id === this.chat_id)!.chat_user_id

            this.get_ChatInfoMessages()
        })
    }

    async get_ChatInfoMessages() {
        const apiURL = `http://${this.IP}/ChatInfoMessages`
        const request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify( {"chat_id": this.chat_id} ),
        }

        return fetch(apiURL, request)
        .then(async response =>{
            const responseData = await response.json()
            if(response.ok){
                this.messages = responseData.chatMessages

                if (this.messages != null) {
                    for(let message of this.messages) {
                        message.timestamp =  new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(message.timestamp))
                    }
                }                
                
                this.users_info[this.chat_user_id] = {id: responseData.chatInfo.user_id, name: responseData.chatInfo.user_displayName, img: responseData.chatInfo.user_logo}
            }
        })
        .catch(error =>{
            console.error(error)
        })
    }
}
