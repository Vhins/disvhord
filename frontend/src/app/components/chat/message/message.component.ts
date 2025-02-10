import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { ChatService } from '../chat.service';
import { MessagesService } from '../messages.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
    @Input() messageData: any
    thismessageimg: string = "none"
    @Output() editingMessage = new EventEmitter<any>()

    constructor(public chatService: ChatService, public messagesService: MessagesService) {}
    
    showCorretImgMessageActionButton(event: Event) {
        const target = event.currentTarget as HTMLDivElement

        if (!this.messagesService.messages) { return }
        const message = this.messagesService.messages.find(message => { return message.message_id == Number(target.id) })
        if (!message) return
        if (message.sender != this.chatService.user_id) {
            this.thismessageimg = "none"
            return
        }

        if (Date.now() - Number(message.timestamp)  > 10 * 60 * 1000) {
            this.thismessageimg = "delete"
        } else {
            this.thismessageimg = "edit"
        }
    }

    onEditingMessage(event: any) {
        this.editingMessage.emit(event)
    }

    onDeleteMessage(event: any) {
        this.editingMessage.emit(event)
    }
}
