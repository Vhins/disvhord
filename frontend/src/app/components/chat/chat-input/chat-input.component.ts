import { Component, ElementRef, HostListener, OnInit, Renderer2, viewChild, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { FormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';
import { MessagesService } from '../messages.service';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, NgStyle],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.css'
})
export class ChatInputComponent implements OnInit {
    private input_zone = viewChild.required<ElementRef<HTMLSpanElement>>('input_zone')
    newmessage: string[] = ['test! <br> !tset']

    constructor(public chatService: ChatService, private messagesService: MessagesService, private renderer: Renderer2) {}

    ngOnInit() {
        this.chatService.currentEditingMessageText$.subscribe( value => {
            this.newmessage.pop()
            this.newmessage.push(value)
            if (value !== "") { 
                setTimeout(() => this.adjustHeight())
            }
        })
    }


    onKeydown(event: KeyboardEvent) {
        console.log('KeyboardEvent', event)

        if (event.key === 'Enter' && !event.shiftKey) {
            this.onSendMessage()
        }
    }

    onSendMessage() {
        if (this.newmessage[0] === "") return
        const message = this.convertMessageToDatabaseFormat(this.newmessage[0])        

        if (!this.chatService.editingMessageMode()) {
            this.messagesService.sendMessage(message)
        } else {
            this.sendEditedMessage(message)
        }

        this.resetInput()
        this.adjustHeight()
    }

    sendEditedMessage(inputValue: string) {
        if (this.chatService.currentIDMessageEditing === null) return
        this.messagesService.editMessage(this.chatService.currentIDMessageEditing, inputValue)
        this.resetInput()
        this.adjustHeight()
    }

    onDeleteAllegatedLink() {
        this.chatService.allegatedLink = ""
        this.adjustHeight()
    }

    onStopEditMessage() {
        this.newmessage.pop()
        this.resetInput()
        this.chatService.editingMessageMode.set(false)
        this.adjustHeight()
    }


    resetInput() {
        this.newmessage.pop()
        this.newmessage.push('')
    }


    onAddLinkPopup() {
        this.chatService.allegatingLink.set(true)
    }

    linkType(url: string | null | undefined): string {
        if (!!url && ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.bmp'].some(ext => url.endsWith(ext))) {
            return 'image'
        } else if(!!url && ['.mp3', '.ogg', '.wav', '.aac', '.flac'].some(ext => url.endsWith(ext))) {
            return 'audio'
        } else if(!!url && ['.mp4', '.webm', '.mov', '.mkv'].some(ext => url.endsWith(ext))) {
            return 'video'
        } else {
            return 'link'
        }
    }

    convertMessageToDatabaseFormat(content: string): string {
        return content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\r\n|\r|\n/g, '<br>')
            .replace(/ /g, '&nbsp;')
            // .replace(/https?:\/\/[^\s<>()\[\]{}]+(?=\s|[^\w-]|$)/g, (url) => `<a href="${url}" target="_blank">${url}</a>`)
            .replace(/https?:\/\/[^\s<>()\[\]{}]+(?=\s|[^\w-]|$)/g, (url) => `<a href="${url}" target="_blank">${url}</a>`)
            .replace(/https?:\/\/[^\s<>()\[\]{}]*(?=(?!.*&nbsp;)[\s|[^\w-]|$])/g, (url) => `<a href="${url}" target="_blank">${url}</a>`)
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
    }
    
    adjustHeight(): void {

    }
}
