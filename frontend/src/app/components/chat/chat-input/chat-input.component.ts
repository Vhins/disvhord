import { AfterViewInit, Component, effect, ElementRef, OnInit, viewChild } from '@angular/core';
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
export class ChatInputComponent implements OnInit, AfterViewInit {
    private text_area = viewChild.required<ElementRef<HTMLDivElement>>('text_area')
    private allegatedLink = viewChild<ElementRef<HTMLDivElement>>('allegatedLink')
    newmessage: string[] = ['']

    constructor(public chatService: ChatService, private messagesService: MessagesService) {
        effect(() => {
            this.chatService.allegatingLink()
            if (!this.allegatedLink()) return
            setTimeout(()=> {
                this.allegatedLinkHeight = `-${this.allegatedLink()?.nativeElement.clientHeight}px`
            })
        })
    }

    ngOnInit() {
        this.chatService.currentEditingMessageText$.subscribe( value => {
            this.newmessage.pop()
            this.newmessage.push(value)
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
        const message = this.convertMessageToDatabaseFormat(text)  

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


    onAddLinkPopup() {
        this.chatService.allegatingLink.set(true)
    }
    

    convertMessageToDatabaseFormat(content: string): string {
        return content
            .replace(/&/g, '&amp;')
            // .replace(/</g, '&lt;')
            // .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            // .replace(/\r\n|\r|\n/g, '<br>')
            .replace(/ /g, '&nbsp;')
            // .replace(/https?:\/\/[^\s<>()\[\]{}]+(?=\s|[^\w-]|$)/g, (url) => `<a href="${url}" target="_blank">${url}</a>`)
            .replace(/https?:\/\/[^\s<>()\[\]{}]+(?=\s|[^\w-]|$)/g, (url) => `<a href="${url}" target="_blank">${url}</a>`)
            .replace(/https?:\/\/[^\s<>()\[\]{}]*(?=(?!.*&nbsp;)[\s|[^\w-]|$])/g, (url) => `<a href="${url}" target="_blank">${url}</a>`)
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
    }

    allegatedLinkHeight: string = '0px'
    ngAfterViewInit() {

    }

}
