import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { api_ChatInfoMessages } from './chat.model';

@Injectable({
  providedIn: 'root'
})
export class ApiChatService {
    chat_messages_length!: number

    async get_ChatInfoMessages(chat_id: number , loadMessage: number): Promise<api_ChatInfoMessages | "max_loaded" > {
        if (chat_id == null) throw new Error('[chat_id] was not found as an argument in [ApiChatService:get_ChatInfoMessages]')
            try {
            const apiURL = `http://${environment.SERVER_IP}/ChatInfoMessages`
            const request = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('privateToken') || ''}`
                },
                body: JSON.stringify( {"chat_id": chat_id, "loadMessage": loadMessage} )
            }

            const response = await fetch(apiURL, request)
            const responseData = await response.json()

            if (!response.ok) {
                throw new Error(responseData?.message || `Request error, ${response.status}`)
            }

            if (responseData.chatMessages?.length === this.chat_messages_length) return "max_loaded"
            this.chat_messages_length = responseData.chatMessages.length

            return responseData
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Unknown error')
        }
    }
    
}
