import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Messages } from './chat.model';

@Injectable({
  providedIn: 'root'
})
export class ApiChatService {

    async get_ChatInfoMessages(chat_id: number): Promise<[] | null> {
        if (chat_id === undefined) {
            return null
            throw new Error('[chat_id] was not found as an argument in [ApiChatService:get_ChatInfoMessages]')
        }

        const apiURL = `http://${environment.IP}/ChatInfoMessages`
        const request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('privateToken')}`
            },
            body: JSON.stringify( {"chat_id": chat_id} ),
        }

        await fetch(apiURL, request)
        .then(async response =>{
            const responseData = await response.json()
            if(response.ok){
                const messages = responseData.chatMessages

                messages.map( (message: Messages) => {return {...message, timestamp: new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(message.timestamp))}})
                // if (messages != null) {
                //     for(let message of messages) {
                //         message.timestamp =  
                //     }
                // }
                
                // this.users_info[this.chat_user_id] = {id: responseData.chatInfo.user_id, name: responseData.chatInfo.user_displayName, img: responseData.chatInfo.user_logo}
                return messages
            }
        })
        .catch(error =>{
            console.error(error)
            return null
        })

        return null
    }
}
