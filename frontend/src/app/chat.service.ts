import { Injectable } from "@angular/core";
import { InitializeAppApiService } from "./initialize-app-api.service";
import { WebSocketService } from "./web-socket.service";

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    IP = "localhost:3333"
    user_id: number
    messages: {content: string, sender: number, receiver: number, message_id: number, timestamp: string, attachments: string | null}[] = []
    users_info: {[key: number]: {id: number, name: string, img: string}} = {}
    chat_id!: number
    chat_user_id!: number


    constructor(private webSocketService: WebSocketService, private InitializeAppApiService: InitializeAppApiService) {
        this.InitializeAppApiService = InitializeAppApiService
        this.webSocketService = webSocketService

        this.user_id = this.InitializeAppApiService.user_interface.user_id
        this.users_info[this.user_id] = {id: this.user_id, name: this.InitializeAppApiService.user_interface.user_displayName, img: this.InitializeAppApiService.user_interface.user_logo}

        this.webSocketService.on("personal_message_received").subscribe(data => {
            data.timestamp = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(data.timestamp))
            this.messages.push(data)
        })
        this.webSocketService.on("personal_message_deleted").subscribe(message_id => {
            this.messages = this.messages.filter(message => message.message_id != message_id)
        })
    }


    setThisChatID(chat_id: number) {
        this.chat_id = chat_id
        this.chat_user_id = this.InitializeAppApiService.user_interface.chats.find(chat => chat.chat_id == this.chat_id)!.chat_user_id
        this.get_ChatInfoMessages()
    }

    sendMessage(content: string) {
        this.webSocketService.emit("personal_message", { "sender": this.user_id, "receiver": this.chat_user_id, "content": content.replace(/\n/g, '<br>'), "chat_id": this.chat_id })
    }

    deleteMessage(message_id: number) {
        this.webSocketService.emit("delete_message", { "chat_id": this.chat_id, "message_id": message_id, "sender": this.user_id, "receiver": this.chat_user_id })
    }

    async initializeChat(): Promise<number> {

        return 3
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
