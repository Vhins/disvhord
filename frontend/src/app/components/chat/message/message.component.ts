import { Component, Input, output } from '@angular/core';
import { ChatService } from '../chat.service';
import { MessagesService } from '../messages.service';
import { DatePipe } from '@angular/common';
import { Messages } from '../chat.model';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
    @Input({required: true}) messageData!: Messages
    message_option: string = "none"
    editingMessage = output<number>()

    constructor(public chatService: ChatService, public messagesService: MessagesService) {}
    
    messageOption() {
        if (this.messageData.sender != this.chatService.user_id || this.messageData.content === "[[Questo messaggio è stato eliminato dal creatore]]") {
            this.message_option = "none"
            return
        }

        if (Date.now() - this.messageData.timestamp  > 10 * 60 * 1000) {
            this.message_option = "delete"
        } else {
            this.message_option = "edit"
        }
    }

    onEditingMessage() {
        this.editingMessage.emit(this.messageData.message_id)
    }
    
    onDeleteMessage() {
        this.message_option = 'none'
        this.messagesService.deleteMessage(this.messageData.message_id)
    }

    
    linkType(url: string | null | undefined): string {
        let type

        if (!!url && ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.bmp'].some(ext => url.endsWith(ext))) {
            type = 'image'
        } else if(!!url && ['.mp3', '.ogg', '.wav', '.aac', '.flac'].some(ext => url.endsWith(ext))) {
            type = 'audio'
        } else if(!!url && ['.mp4', '.webm', '.mov', '.mkv'].some(ext => url.endsWith(ext))) {
            type = 'video'
        } else {
            type = 'link'
        }

        return type
    }
      
}
