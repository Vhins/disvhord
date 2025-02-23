import { Component, effect, ElementRef, OnInit, viewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { FormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';
import { MessagesService } from '../messages.service';

type PxString = `${number}px` | `-${number}px`

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, NgStyle],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.css'
})
export class ChatInputComponent implements OnInit {
    private text_area = viewChild.required<ElementRef<HTMLDivElement>>('text_area')
    private allegatedLink = viewChild<ElementRef<HTMLDivElement>>('allegatedLink')
    newmessage: string[] = ['']
    allegatedLinkHeight: PxString = '0px'

    constructor(public chatService: ChatService, private messagesService: MessagesService) {
        effect(() => {
            this.chatService.allegatingLink()
            if (!this.allegatedLink()) return
            this.adjustAllegatedLinkHeight()
        })
    }

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


    onAddLinkPopup() {
        this.chatService.allegatingLink.set(true)
    }

    adjustAllegatedLinkHeight() { //!
        setTimeout( async ()=> {
        const allegatedLinkHeight = this.allegatedLink()?.nativeElement.clientHeight
            if (allegatedLinkHeight && this.chatService.allegatedLink) {
                fetch(this.chatService.allegatedLink).then(()=>{
                    this.allegatedLinkHeight = `-${allegatedLinkHeight}px`
                })
            }
        })
    }

}
