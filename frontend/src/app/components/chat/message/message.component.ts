import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
    @Input() messageData: any
    thismessageimg: string = "none"
    @Output() editingMessage = new EventEmitter<any>()

    constructor(public chatService: ChatService) {}
    
    showCorretImgMessageActionButton(event: Event) {
        const target = event.currentTarget as HTMLDivElement

        if (!this.chatService.messages) { return }
        const message = this.chatService.messages.find(message => { return message.message_id == Number(target.id) })
        if (!message) return
        if (message.sender != this.chatService.user_id) {
            this.thismessageimg = "none"
            return
        }

        if (Date.now() - this.parseFormattedDate(message.timestamp)  > 10 * 60 * 1000) {
            this.thismessageimg = "delete"
        } else {
            this.thismessageimg = "edit"
        }
    }

    parseFormattedDate(formattedDate: string): number {
        const [datePart, timePart] = formattedDate.split(', ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
      
        return new Date(year, month - 1, day, hours, minutes).getTime();
    }

    onEditingMessage(event: any) {
        this.editingMessage.emit(event)
    }

    onDeleteMessage(event: any) {
        this.editingMessage.emit(event)
    }
}
