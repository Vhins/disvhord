import { Component, input, OnInit, output } from '@angular/core';
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
export class MessageComponent implements OnInit {
    messageData = input.required<Messages>()
    islastMessage = input<boolean>()

    message_option: 'none' | 'edit' | 'delete' = "none"
    editingMessage = output<number>()

    constructor(public chatService: ChatService, public messagesService: MessagesService) {}
    
    ngOnInit() {
        if (this.islastMessage()) {
            setTimeout(() => { 
                this.messagesService.scrollDownChat$.next(true)
                this.messagesService.firstRender = false
            })
        }
    }
    
    messageOption() {
        
        if (this.messageData().sender != this.chatService.user_id || this.messageData().content === "[[Questo messaggio è stato eliminato dal creatore]]") {
            this.message_option = "none"
            return
        }

        if (Date.now() - this.messageData().timestamp  > 10 * 60 * 1000) {
            this.message_option = "delete"
        } else {
            this.message_option = "edit"
        }
    }

    onEditingMessage() {
        this.editingMessage.emit(this.messageData().message_id)
    }
    
    onDeleteMessage() {
        this.message_option = "none"
        this.messagesService.deleteMessage(this.messageData().message_id)
    }
      
    openImagePageLink() {
        const link = this.messageData().attachments
        if (!link) return
        window.open(link, '_blank')
    }

    openUserProfile() {
        this.chatService.openingUserProfile.set(true)
    }
}
