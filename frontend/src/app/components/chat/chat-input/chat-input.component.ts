import { Component, ElementRef, viewChild, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { FormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, NgStyle],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.css'
})
export class ChatInputComponent {
    constructor(public chatService: ChatService) {}
    // input: string = ""
    private text_area = viewChild.required<ElementRef<HTMLTextAreaElement>>('text_area')
    @ViewChild('input_box') input_box!: ElementRef
    @ViewChild('input_container') input_container!: ElementRef

    inputValueBeforeEditing!: string

    onSendMessage() {
        const input = this.text_area().nativeElement as HTMLTextAreaElement
        if (input.value === "") return
        const message = input.value.replace(/&/g, '&amp;')
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

        console.log('messaggio inviato:', message)
        if (!this.chatService.editingMessageMode) {
            this.chatService.sendMessage(message)
            input.value = ""
        } else {
            this.editMessage(message)
            input.value = this.inputValueBeforeEditing
        }
        // this.input.removeAttribute('style')
        this.adjustHeight()
    }

    textarea_scrollHeight: string = "0px"
    textarea_lineHeight: string = "0px"
    textarea_height: string = "0px"
    heightWidgetEdit_Attachment: string = "80"

    adjustHeight(): void {
        // textarea.removeAttribute('style')

        console.log('aaa', Number(this.textarea_scrollHeight.replace("px", "")), " : _ : ", this.textarea_scrollHeight)
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

    exAllegatedFile: string = ''
    currentIDMessageEditing!: number

    editMessage(inputValue: string) {
        this.chatService.editMessage(this.currentIDMessageEditing, inputValue)
        this.chatService.allegateLink(this.exAllegatedFile)
    }

    deleteAllegatedLink() {
        this.chatService.allegateLink("")
    }

    stopEditMessage() {
        const input = this.text_area().nativeElement as HTMLTextAreaElement
        input.value = this.inputValueBeforeEditing
        this.chatService.editingMessage(false)
        this.chatService.allegateLink(this.exAllegatedFile)
        this.adjustHeight()
    }

    onOpenAddLinkPopup() {
        this.chatService.allegatingLink.set(true)
    }

    onKeydown(event: KeyboardEvent) {
        this.adjustHeight()
        const textarea = this.text_area().nativeElement as HTMLTextAreaElement
        textarea.innerHTML = "textarea.innerHTML" + String.fromCharCode(event.keyCode)
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            this.onSendMessage()
        }
    }

    /*adjustHeight(): void {
        const textarea = this.text_area().nativeElement as HTMLDivElement
        textarea.removeAttribute('style')


        if (textarea.scrollHeight > 102) { 
            textarea.style.lineHeight = "30px"
            textarea.style.height = `${textarea.scrollHeight}px`
        } else {
            textarea.style.lineHeight = "60px"
            textarea.style.height = `${textarea.scrollHeight}px`
        }

        const input_box = this.input_box.nativeElement as HTMLDivElement

        this.heightWidgetEdit_Attachment = String(Number(window.getComputedStyle(input_box).height.slice(0, -2)) + 10) + "px"

        const input_container = this.input_container.nativeElement as HTMLDivElement
        input_container.style.minHeight = `${42 + textarea.scrollHeight}px`

        const element = this.scrollContainer.nativeElement
        element.scrollTop = element.scrollHeight
    }*/

    ngAfterViewInit() {
        (this.text_area().nativeElement as HTMLTextAreaElement).value = ""
        this.adjustHeight()
        this.chatService.editingMessage(false)
    }

}
