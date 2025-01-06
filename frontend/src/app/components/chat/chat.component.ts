import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { WebSocketService } from '../../web-socket.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
    @ViewChild('scrollContainer') scrollContainer!: ElementRef
    @ViewChild('input_container') input_container!: ElementRef
    @ViewChild('input') input!: ElementRef

    webSocketService!: WebSocketService
    messages: {content: string, sender: number, receiver: number}[] = []

    
    constructor (webSocketService: WebSocketService) {
        this.webSocketService = webSocketService
        this.webSocketService.on("personal_message_received").subscribe(data => {
            this.messages.push(data)
            console.log('emssage', this.messages)
        })
    }

    ngAfterViewInit() {
        const element = this.scrollContainer.nativeElement
        element.scrollTop = element.scrollHeight
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
        this.webSocketService.emit("personal_message", { "sender": 0, "receiver": 1, "content": input.value })
    }
}
