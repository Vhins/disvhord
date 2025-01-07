import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { WebSocketService } from '../../web-socket.service';
import { InitializeAppApiService } from '../../initialize-app-api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
    user_id: number
    IP = "localhost:3333"

    @ViewChild('scrollContainer') scrollContainer!: ElementRef
    @ViewChild('input_container') input_container!: ElementRef
    @ViewChild('input') input!: ElementRef

    users_info: {id: number, name: string, img: string}[] = []

    webSocketService!: WebSocketService
    InitializeAppApiService: InitializeAppApiService

    chat_id!: number
    chat_user_id!: number
    messages: {content: string, sender: number, receiver: number, message_id: number, timestamp: number}[] = []
    
    constructor (webSocketService: WebSocketService, InitializeAppApiService: InitializeAppApiService, private route: ActivatedRoute) {
        this.InitializeAppApiService = InitializeAppApiService
        this.webSocketService = webSocketService

        
        this.user_id = this.InitializeAppApiService.user_interface.user_id
        this.chat_id = Number(this.route.snapshot.paramMap.get('chat_id'))
        
        this.users_info[this.user_id] = {id: this.InitializeAppApiService.user_interface.user_id, name: this.InitializeAppApiService.user_interface.user_displayName, img: this.InitializeAppApiService.user_interface.user_logo}


        // for (let chat of this.InitializeAppApiService.user_interface.chats) {
        //     if (chat.chat_id === this.chat_id) {
        //         this.chat_user_id = chat.user_id
        //     }
        // }

        this.chat_user_id = this.InitializeAppApiService.user_interface.chats.find(chat => chat.chat_id === this.chat_id)!.chat_user_id
        console.log('chat_user_id', this.chat_user_id)

        this.get_ChatInfoMessages()

        this.webSocketService.on("personal_message_received").subscribe(data => {
            this.messages.push(data)
            console.log('emssage', this.messages)
            const element = this.scrollContainer.nativeElement
            element.scrollTop = element.scrollHeight
        })
    }

    ngOnInit() {
    }

    adjustHeight(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement
        textarea.style.height = `${textarea.scrollHeight}px`

        if (textarea.scrollHeight > 102) { 
            textarea.style.lineHeight = "30px"
        } else {
            textarea.style.lineHeight = "60px"
        }
        
        const input_container = this.input_container.nativeElement as HTMLDivElement
        input_container.style.minHeight = `${42 + textarea.scrollHeight}px`

        const element = this.scrollContainer.nativeElement
        element.scrollTop = element.scrollHeight
    }

    sendMessage() {
        const input = this.input.nativeElement as HTMLTextAreaElement
        console.log('!', input.value)
        this.webSocketService.emit("personal_message", { "sender": this.user_id, "receiver": this.chat_user_id, "content": input.value })
        const element = this.scrollContainer.nativeElement
        element.scrollTop = element.scrollHeight
    }

    async get_ChatInfoMessages() {
        const apiURL = `http://${this.IP}/ChatInfoMessages`
        const request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( {"chat_id": this.chat_id} )
        }

        return fetch(apiURL, request)
        .then(async response =>{
            const responseData = await response.json()
            if(response.ok){
                console.log('responseData.chatInfo', responseData.chatInfo)
                console.log('responseData.chatMessages', responseData.chatMessages)
                this.messages = responseData.chatMessages

                console.log('dolore', this.chat_user_id, this.chat_user_id, responseData.chatInfo.user_displayName, responseData.chatInfo.user_logo)

                if (this.user_id == responseData.chatInfo.user_id){
                    this.users_info[this.user_id] = {id: this.chat_user_id, name: responseData.chatInfo.user_displayName, img: responseData.chatInfo.user_logo}
                    this.users_info[this.chat_user_id] = {id: this.chat_user_id, name: responseData.chatInfo2.user_displayName, img: responseData.chatInfo2.user_logo}
                } else {
                    this.users_info[this.chat_user_id] = {id: this.chat_user_id, name: responseData.chatInfo.user_displayName, img: responseData.chatInfo.user_logo}
                    this.users_info[this.user_id] = {id: this.chat_user_id, name: responseData.chatInfo2.user_displayName, img: responseData.chatInfo2.user_logo}
                }


                const element = this.scrollContainer.nativeElement
                element.scrollTop = element.scrollHeight
            }
        })
        .catch(error =>{
            console.debug('Errore client fetch: ', error)
        })
    }
}
