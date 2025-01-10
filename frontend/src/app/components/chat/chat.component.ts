import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../../chat.service';
import { ActivatedRoute } from '@angular/router';

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

    
    constructor (public chatService: ChatService, private activatedRoute: ActivatedRoute) {

        this.activatedRoute.paramMap.subscribe(param => {
            this.chatService.setThisChatID(Number(param.get('chat_id')))
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
        this.chatService.sendMessage(input.value)
        input.value = ""
        input.removeAttribute('style')
    }

    deleteMessage(event: Event) {
        const target = event.currentTarget as HTMLButtonElement
        const message_id = Number(target.id)
        this.chatService.deleteMessage(message_id)
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
