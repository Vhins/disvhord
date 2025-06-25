import { Injectable } from '@angular/core';
import { api_ChatInfoMessages, MessageData, Messages } from './chat.model';
import { WebSocketService } from '../../web-socket.service';
import { ApiChatService } from './api-chat.service';
import { ChatService } from './chat.service';
import { InitializeAppApiService } from '../../initialize-app-api.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
    private _messages: Messages[] | null = null
    get messages () { return this._messages }
    set messages (new_messages) { this._messages = new_messages}

    user_id: number = this.initializeAppApiService.user_interface.user_id
    chat_id!: number
    chat_user_id!: number

    scrollDownChat$ = new BehaviorSubject<boolean>(false)
    firstRender: boolean = true

    constructor(private webSocketService: WebSocketService, private apiChatService: ApiChatService, private chatService: ChatService, private initializeAppApiService: InitializeAppApiService) {
        this.listenForNewMessages()
        this.listenForMessagesChanges()
    }

    
    listenForNewMessages(): void {
        this.webSocketService.on("personal_message_received").subscribe((data: Messages) => {
            if (this.messages === null) return
            data.content = this.convertMessageToBrowserFormat(data.content)
            this.messages.push(data)
            if (data.sender === this.user_id) {
                this.scrollDownChat$.next(true)
            } else {
                this.scrollDownChat$.next(false)
            }
        })
    }
    listenForMessagesChanges(): void {
        this.webSocketService.on("personal_message_deleted").subscribe((data: {message_id: number, content: string}) => {
            if (this.messages === null) return
            if (data.content) {
                const index = this.messages.findIndex(message => message.message_id === data.message_id)
                this.messages[index].content = data.content
                this.messages[index].attachments = ""
            } else {
                this.messages = this.messages.filter(message => message.message_id !== data.message_id)
            }
        })

        this.webSocketService.on("personal_message_edited").subscribe(data => {
            if (data.content) {
                if (this.messages === null) {return}
                const index = this.messages.findIndex(message => message.message_id === data.message_id)
                this.messages[index].content = this.convertMessageToBrowserFormat(data.content)

                this.scrollDownChat$.next(false)
            }
        })
    }

    listenForChatChanges(): void {}

    async getMessages(chat_id: number, loadMessage: number): Promise<boolean> {
        const responseData: api_ChatInfoMessages | "max_loaded" = await this.apiChatService.get_ChatInfoMessages(chat_id, loadMessage)

        if (responseData === "max_loaded") return false

        const messages: Messages[] = responseData.chatMessages

        messages.map(message => {
            message.content = this.convertMessageToBrowserFormat(message.content)
        })

        this.messages = messages
        this.chat_id = chat_id
        this.chat_user_id = responseData.chatInfo.user_id
        this.chatService.users_info[responseData.chatInfo.user_id] = {id: responseData.chatInfo.user_id , name: responseData.chatInfo.user_displayName, img: responseData.chatInfo.user_logo}
        return true
    }

    sendMessage(content: string) {
        if (!this.chatService.editingMessageMode()) {
            const messageData: MessageData = { "sender": this.user_id, "receiver": this.chat_user_id, "content": content, "chat_id": this.chat_id }
            
            if (this.chatService.allegatedLink) { messageData.attachments = this.chatService.allegatedLink }

            this.webSocketService.emit("personal_message", messageData)
            this.chatService.allegatedLink = ""
        } else {
            this.chatService.editingMessageMode.set(false)
        }
    }

    deleteMessage(message_id: number) {
        this.webSocketService.emit("delete_message", { "chat_id": this.chat_id, "message_id": message_id, "sender": this.user_id, "receiver": this.chat_user_id } as MessageData)
    }

    editMessage(message_id: number, content: string) {
        this.webSocketService.emit("edit_message", { "chat_id": this.chat_id, "message_id": message_id, "sender": this.user_id, "receiver": this.chat_user_id, "content": content } as MessageData)
        this.chatService.editingMessageMode.set(false)
    }

    convertMessageToBrowserFormat(content: string): string {
        return content
            .replace(/&amp;/g, '&')
            .replace(/&lt;br&gt;/gi, '<br>')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/https?:\/\/[^\s<>()\[\]{}&]+(?=\s|[^\w-]|$|&nbsp;)/g, (url) => `<a class="prova" href="${url}" target="_blank">${url}</a>`)
            .replace(/on\w+="[^"]*"/g, '')
    }

}
