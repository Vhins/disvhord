import { Injectable, signal } from "@angular/core";
import { InitializeAppApiService } from "../../initialize-app-api.service";
import { WebSocketService } from "../../web-socket.service";
import { BehaviorSubject } from 'rxjs';
import { environment } from "../../../environments/environment";
import { Messages } from "./chat.model";
import { ApiChatService } from "./api-chat.service";

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    user_id: number //* personal userid
    messages: Messages[] | null = null
    users_info: {[key: number]: {id: number, name: string, img: string}} = {}
    chat_id!: number
    chat_user_id!: number

    editingMessageMode: boolean = false
    allegatingLink = signal<boolean>(false)

    
    scrollDownNow = new BehaviorSubject<Boolean>(false)
    scrollDown(): void {
        this.scrollDownNow.next(false)
    }
    
    callThisChat = new BehaviorSubject<Boolean>(false)
    callThisChatNow(): void {
        this.callThisChat.next(true)
    }

    constructor(private webSocketService: WebSocketService, private InitializeAppApiService: InitializeAppApiService, private apiChatService: ApiChatService) {
        this.InitializeAppApiService = InitializeAppApiService
        this.webSocketService = webSocketService

        this.user_id = this.InitializeAppApiService.user_interface.user_id
        this.users_info[this.user_id] = {id: this.user_id, name: this.InitializeAppApiService.user_interface.user_displayName, img: this.InitializeAppApiService.user_interface.user_logo}

        this.webSocketService.on("personal_message_received").subscribe(data => {
            data.timestamp = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(data.timestamp))
            if (this.messages === null) {return}
            this.messages.push(data)
        })
        this.webSocketService.on("personal_message_deleted").subscribe(data => {
            if (this.messages === null) {return}
            if (data.content) {
                const index = this.messages.findIndex(message => message.message_id === data.message_id)
                this.messages[index].content = data.content
                this.messages[index].attachments = ""
            } else {
                this.messages = this.messages.filter(message => message.message_id != data.message_id)
            }
        })
        this.webSocketService.on("personal_message_edited").subscribe(data => {
            if (data.content) {
                if (this.messages === null) {return}
                const index = this.messages.findIndex(message => message.message_id === data.message_id)
                this.messages[index].content = data.content
            }
        })
    }


    setThisChatID(chat_id: number | string) {
        if (typeof chat_id === "number") {
            this.chat_id = chat_id
            this.chat_user_id = this.InitializeAppApiService.user_interface.chats.find(chat => chat.chat_id == this.chat_id)!.chat_user_id
            this.apiChatService.get_ChatInfoMessages(this.chat_id)
        } else {
            console.log('chat personale')
        }
    }

    sendMessage(content: string) {
        if (!this.editingMessageMode) {
            if (!this.allegatedLink) {
                this.webSocketService.emit("personal_message", { "sender": this.user_id, "receiver": this.chat_user_id, "content": content, "chat_id": this.chat_id })
            } else { 
                this.webSocketService.emit("personal_message", { "sender": this.user_id, "receiver": this.chat_user_id, "content": content, "chat_id": this.chat_id, "attachments": this.allegatedLink })
            }
            this.allegatedLink = ""
        } else {
            this.editingMessageMode = false
        }
    }

    deleteMessage(message_id: number) {
        this.webSocketService.emit("delete_message", { "chat_id": this.chat_id, "message_id": message_id, "sender": this.user_id, "receiver": this.chat_user_id })
    }

    editMessage(message_id: number, content: string) {
        this.webSocketService.emit("edit_message", { "chat_id": this.chat_id, "message_id": message_id, "content": content, "sender": this.user_id, "receiver": this.chat_user_id })
        this.editingMessageMode = false
    }

    editingMessage(bool: boolean) {
        this.editingMessageMode = bool
    }



    allegatedLink: string = ""

    allegateLink(link: string) {
        this.allegatedLink = link
    }
}
