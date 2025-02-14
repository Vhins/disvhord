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
    private text_area = viewChild.required<ElementRef<HTMLTextAreaElement>>('text_area')
    text_area_innerHTML: string = ''

    constructor(public chatService: ChatService, private messagesService: MessagesService, private renderer: Renderer2) {}

    ngOnInit() {
        this.chatService.currentEditingMessageText$.subscribe( value => {
            console.log('valuevaluevaluevalue', value)
            this.createNewTextArea(value)
            if (value !== "") { 
                setTimeout(() => this.adjustHeight())
            }
        })
    }


    onKeydown(event: KeyboardEvent) {
        console.log('KeyboardEvent', event)
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            this.onSendMessage()
        } else {
            const allowedKeys = /^[a-zA-Z0-9\s.,?!]+$/
            if (event.key.length === 1 && allowedKeys.test(event.key)) {
                this.text_area_innerHTML = this.text_area_innerHTML + event.key
                this.adjustHeight()
            }
        }
    }

    onSendMessage() {
        if (this.text_area_innerHTML === "") return
        const message = this.convertMessageToDatabaseFormat(this.text_area_innerHTML)        

        if (!this.chatService.editingMessageMode()) {
            this.messagesService.sendMessage(message)
            this.text_area_innerHTML = ""
        } else {
            this.sendEditedMessage(message)
        }

        ;(this.text_area().nativeElement as HTMLTextAreaElement).removeAttribute('style')
        this.createNewTextArea()
        this.adjustHeight()
    }

    sendEditedMessage(inputValue: string) {
        if (this.chatService.currentIDMessageEditing === null) return
        this.messagesService.editMessage(this.chatService.currentIDMessageEditing, inputValue)
        this.text_area_innerHTML = ""
        this.adjustHeight()
    }

    onDeleteAllegatedLink() {
        this.chatService.allegatedLink = ""
        this.adjustHeight()
    }

    onStopEditMessage() {
        this.text_area_innerHTML = ""
        this.chatService.editingMessageMode.set(false)
        this.adjustHeight()
    }

    last_textarea!: any

    createNewTextArea(content?: string) {
        console.log('createNewTextArea value:', content)

        let ppalle_span = this.input_zone().nativeElement as HTMLSpanElement

        if (this.last_textarea) {
            let bo = this.renderer.removeChild(ppalle_span, this.last_textarea)
        }

        const textarea = this.renderer.createElement('textarea');

        // this.text_area().nativeElement.hidden = true

        this.renderer.setAttribute(textarea, 'contenteditable', 'true');
        this.renderer.setAttribute(textarea, 'placeholder', 'Scrivi un messaggio.......');
        this.renderer.setAttribute(textarea, 'name', 'text');
        this.renderer.setAttribute(textarea, 'rows', '14');
        this.renderer.setAttribute(textarea, 'cols', '10');
        this.renderer.setAttribute(textarea, 'wrap', 'soft');
        this.renderer.setAttribute(textarea, 'maxlength', '1000');
        this.renderer.addClass(textarea, 'input');

        this.renderer.listen(textarea, 'keydown', (event: KeyboardEvent) => { 
            this.onKeydown(event)
        })

        if (content) {
            // this.renderer.setValue(textarea, content)
            this.renderer.setProperty(textarea, 'innerHTML', content);
        }
        textarea.innerHTML = this.text_area_innerHTML;

        let rendered = this.renderer.appendChild(ppalle_span, textarea);
        this.last_textarea = textarea
        console.log('redereddd', rendered)
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
        ;(this.text_area().nativeElement as HTMLTextAreaElement).removeAttribute('style')

        //! console.debug('adjustHeight:', Number(this.textarea_scrollHeight.replace("px", "")), " : _ : ", this.textarea_scrollHeight)
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
