import { Injectable } from '@angular/core';
import { api_ChatInfoMessages, MessageData, Messages } from './chat.model';
import { WebSocketService } from '../../web-socket.service';
import { ApiChatService } from './api-chat.service';
import { ChatService } from './chat.service';
import { InitializeAppApiService } from '../../initialize-app-api.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
    private _messages: Messages[] | null = null
    get messages () { return this._messages }
    set messages (new_messages) { this._messages = new_messages}

    user_id: number = this.initializeAppApiService.user_interface.user_id //* personal userid
    chat_id!: number
    chat_user_id!: number

    constructor(private webSocketService: WebSocketService, private apiChatService: ApiChatService, private chatService: ChatService, private initializeAppApiService: InitializeAppApiService) {
        this.listenForNewMessages()
        this.listenForMessagesChanges()
        // this.listenForChatChanges()
    }

    
    listenForNewMessages(): void {
        this.webSocketService.on("personal_message_received").subscribe(data => {
            if (this.messages === null) return
            this.messages.push(data)
        })
    }
    listenForMessagesChanges(): void {
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

    listenForChatChanges(): void {}

    async getMessages(chat_id: number) {
        const responseData: api_ChatInfoMessages = await this.apiChatService.get_ChatInfoMessages(chat_id)
        const messages: Messages[] = responseData.chatMessages
        this.messages = messages
        this.chat_id = chat_id
        this.chat_user_id = responseData.chatInfo.user_id
        this.chatService.users_info[responseData.chatInfo.user_id] = {id: responseData.chatInfo.user_id , name: responseData.chatInfo.user_displayName, img: responseData.chatInfo.user_logo}
    }

    sendMessage(content: string) {
        if (!this.chatService.editingMessageMode) {
            const messageData: MessageData = { "sender": this.user_id, "receiver": this.chat_user_id, "content": content, "chat_id": this.chat_id }
            
            if (this.chatService.allegatedLink) { messageData.attachments = this.chatService.allegatedLink }

            this.webSocketService.emit("personal_message", messageData)
            this.chatService.allegatedLink = ""
        } else {
            this.chatService.editingMessageMode = false
        }
    }

    deleteMessage(message_id: number) {
        this.webSocketService.emit("delete_message", { "chat_id": this.chat_id, "message_id": message_id, "sender": this.user_id, "receiver": this.chat_user_id } as MessageData)
    }

    editMessage(message_id: number, content: string) {
        this.webSocketService.emit("edit_message", { "chat_id": this.chat_id, "message_id": message_id, "sender": this.user_id, "receiver": this.chat_user_id, "content": content } as MessageData)
        this.chatService.editingMessageMode = false
    }
}
