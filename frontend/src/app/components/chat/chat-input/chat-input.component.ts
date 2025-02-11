import { Component, ElementRef, OnInit, viewChild, ViewChild } from '@angular/core';
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
    private text_area = viewChild.required<ElementRef<HTMLTextAreaElement>>('text_area')
    text_area_innerHTML: string = ''

    constructor(public chatService: ChatService, private messagesService: MessagesService) {}

    ngOnInit() {
        this.chatService.currentEditingMessageText$.subscribe( value => {
            ;(this.text_area().nativeElement as HTMLTextAreaElement).innerHTML = value
            if (value !== "") { this.adjustHeight() }
        } )
    }

    private moveCursorToEnd(element: HTMLElement) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false); // Sposta il cursore alla fine
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    onKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            this.onSendMessage()
        } else {
            this.adjustHeight()
        }
    }

    onSendMessage() {
        const textarea = this.text_area().nativeElement as HTMLTextAreaElement
        if (textarea.value === "") return
        const message = this.convertMessageToDatabaseFormat(textarea.value)        

        if (!this.chatService.editingMessageMode()) {
            this.messagesService.sendMessage(message)
            textarea.value = ""
        } else {
            this.sendEditedMessage(message)
        }

        textarea.removeAttribute('style')
        this.adjustHeight()
    }


    sendEditedMessage(inputValue: string) {
        if (this.chatService.currentIDMessageEditing === null) return
        this.messagesService.editMessage(this.chatService.currentIDMessageEditing, inputValue)
        ;(this.text_area().nativeElement as HTMLTextAreaElement).value = ""
        this.adjustHeight()
    }

    onDeleteAllegatedLink() {
        this.chatService.allegatedLink = ""
        this.adjustHeight()
    }

    onStopEditMessage() {
        ;(this.text_area().nativeElement as HTMLTextAreaElement).value = ""
        this.chatService.editingMessageMode.set(false)
        this.adjustHeight()
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


    @ViewChild('input_box') input_box!: ElementRef
    @ViewChild('input_container') input_container!: ElementRef

    textarea_scrollHeight: string = "0px"
    textarea_lineHeight: string = "0px"
    textarea_height: string = "0px"
    heightWidgetEdit_Attachment: string = "80"

    // aggiungere un observer/signal per ascoltare il agiustare altezzza
    adjustHeight(): void {
        const textarea = this.text_area().nativeElement as HTMLTextAreaElement
        textarea.removeAttribute('style')

        console.debug('adjustHeight:', Number(this.textarea_scrollHeight.replace("px", "")), " : _ : ", this.textarea_scrollHeight)
        if (Number(this.textarea_scrollHeight.replace("px", "")) > 102) { 
            this.textarea_lineHeight = "30px"
            this.textarea_height = `${this.textarea_scrollHeight}px`
        } else {
            this.textarea_lineHeight = "60px"
            this.textarea_height = `${this.textarea_scrollHeight}px`
        }

        const input_box = this.input_box.nativeElement as HTMLDivElement

        this.heightWidgetEdit_Attachment = String(Number(window.getComputedStyle(input_box).height.slice(0, -2)) + 10) + "px"

        const input_container = this.input_container.nativeElement as HTMLDivElement
        input_container.style.minHeight = `${42 + this.textarea_scrollHeight}px`

        // const element = this.scrollContainer.nativeElement
        // element.scrollTop = element.scrollHeight
    }
}
