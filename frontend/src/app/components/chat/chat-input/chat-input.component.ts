import { Component, ElementRef, OnInit, viewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgStyle } from '@angular/common';
import { MessagesService } from '../messages.service';


@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, NgStyle, NgClass],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.css'
})
export class ChatInputComponent implements OnInit {
    private text_area = viewChild.required<ElementRef<HTMLDivElement>>('text_area')
    newmessage: string[] = ['']

    constructor(public chatService: ChatService, private messagesService: MessagesService) {}

    ngOnInit() {
        this.chatService.currentEditingMessageText$.subscribe( value => {
            this.newmessage.pop()
            this.newmessage.push(value.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1'))
        })
    }


    onKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            this.onSendMessage()
        }
    }

    onSendMessage() {
        const text = this.text_area().nativeElement.innerHTML
        if (text === "") return
        const message = this.messagesService.convertMessageToDatabaseFormat(text)  

        if (!this.chatService.editingMessageMode()) {
            this.messagesService.sendMessage(message)
        } else {
            this.sendEditedMessage(message)
        }

        this.resetInput()
    }

    sendEditedMessage(inputValue: string) {
        if (this.chatService.currentIDMessageEditing === null) return
        this.messagesService.editMessage(this.chatService.currentIDMessageEditing, inputValue)
        this.resetInput()
    }

    onDeleteAllegatedLink() {
        this.chatService.allegatedLink = ""
    }

    onStopEditMessage() {
        this.newmessage.pop()
        this.resetInput()
        this.chatService.editingMessageMode.set(false)
    }


    nosense = true
    resetInput() {
        this.newmessage.pop()
        this.newmessage.push(this.nosense ? '\0' : '')
        this.nosense = !this.nosense
    }


    onOpenAddLinkPopup() {
        this.chatService.allegatingLink.set(true)
    }

}
