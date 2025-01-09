import { Component, ElementRef, ViewChild } from '@angular/core';
import { WebSocketService } from '../../web-socket.service';
import { ChatService } from '../../chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
    user_id!: number
    messages: {content: string, sender: number, receiver: number, message_id: number, timestamp: string}[] = []
    users_info: {[key: number]: {id: number, name: string, img: string}} = {}
    chat_id!: number
    chat_user_id!: number



    @ViewChild('scrollContainer') scrollContainer!: ElementRef
    @ViewChild('input_container') input_container!: ElementRef
    @ViewChild('input') input!: ElementRef


    webSocketService!: WebSocketService
    chatService: ChatService

    
    constructor (webSocketService: WebSocketService, chatService: ChatService) {
        this.webSocketService = webSocketService
        this.chatService = chatService

        this.user_id = this.chatService.user_id
        this.messages = this.chatService.messages
        this.users_info = this.chatService.users_info
        this.chat_id = this.chatService.chat_id
        this.chat_user_id = this.chatService.chat_user_id




        this.webSocketService.on("personal_message_received").subscribe(data => {
            data.timestamp = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(data.timestamp))
            this.messages.push(data)
        })
    }

    adjustHeight(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement
        textarea.removeAttribute('style')

        textarea.style.height = `${textarea.scrollHeight}px`

        if (textarea.scrollHeight > 102) { 
            textarea.style.lineHeight = "30px"
        } else {
            textarea.style.lineHeight = "60px"
        }
        
        const input_container = this.input_container.nativeElement as HTMLDivElement
        input_container.style.minHeight = `${42 + textarea.scrollHeight}px`
    }

    sendMessage() {
        const input = this.input.nativeElement as HTMLTextAreaElement
        this.webSocketService.emit("personal_message", { "sender": this.user_id, "receiver": this.chat_user_id, "content": input.value.replace(/\n/g, '<br>'), "chat_id": this.chat_id })
        input.value = ""
        input.removeAttribute('style')
    }

    ngAfterViewChecked() {
        const element = this.scrollContainer.nativeElement
        element.scrollTop = element.scrollHeight
    }

    onKeydown(event: KeyboardEvent & Event) {
        this.adjustHeight(event)
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            this.sendMessage()
        }
    }



}
