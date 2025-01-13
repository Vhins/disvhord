import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ChatService } from '../../chat.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
    @ViewChild('scrollContainer') scrollContainer!: ElementRef
    @ViewChild('input_container') input_container!: ElementRef
    @ViewChild('input') input!: ElementRef
    @ViewChild('inputlink') inputlink!: ElementRef
    @ViewChild('text_area') text_area!: ElementRef
    @ViewChildren('messageRef') messageElements!: QueryList<ElementRef>

    newChat: boolean = false

    constructor (public chatService: ChatService, private activatedRoute: ActivatedRoute) {
        this.newChat = true
        this.activatedRoute.paramMap.subscribe(async param => {
            this.newChat = true
            this.chatService.setThisChatID(Number(param.get('chat_id')))
            this.allegatingFiles = false
            this.chatService.allegateFile("")

        })
    }

    currentIDMessageEditing!: number
    inputValueBeforeEditing!: string
    thismessageimg: string = "none"

    ngAfterViewInit() {
        const input = this.input.nativeElement as HTMLInputElement
        input.value = ""
        const inputlink = this.inputlink.nativeElement as HTMLInputElement
        inputlink.value = ""
        this.adjustHeight()

        const suvb = this.messageElements.changes.subscribe(() => {
            if (this.newChat === true ){
                console.log("chat messages number:", this.messageElements.length)
                const element = this.scrollContainer.nativeElement
                element.scrollTop = element.scrollHeight
                this.newChat = false
            }
        })
    }

    adjustHeight(): void {
        const textarea = this.text_area.nativeElement as HTMLTextAreaElement
        textarea.removeAttribute('style')

        textarea.style.height = `${textarea.scrollHeight}px`

        if (textarea.scrollHeight > 102) { 
            textarea.style.lineHeight = "30px"
        } else {
            textarea.style.lineHeight = "60px"
        }
        
        const input_container = this.input_container.nativeElement as HTMLDivElement
        input_container.style.minHeight = `${42 + textarea.scrollHeight}px`
    }

    sendMessage() {
        if ( !this.chatService.editingMessageMode ) {
            const input = this.input.nativeElement as HTMLTextAreaElement
            this.chatService.sendMessage(input.value)
            input.value = ""
            input.removeAttribute('style')
        } else {
            const input = this.input.nativeElement as HTMLTextAreaElement
            this.editMessage(input.value)
            input.value = this.inputValueBeforeEditing
            input.removeAttribute('style')
        }
    }

    deleteMessage(event: Event) {
        const target = event.currentTarget as HTMLButtonElement
        const message_id = Number(target.id)
        this.chatService.deleteMessage(message_id)
    }

    editingMessage(event: Event) {
        const input = this.input.nativeElement as HTMLTextAreaElement
        const target = event.currentTarget as HTMLButtonElement

        const message = this.chatService.messages.find(message => { return message.message_id == Number(target.id) })
        if (!message) return
        if (message.sender != this.chatService.user_id) return

        const currentTimestamp = Date.now()
        if (currentTimestamp - this.parseFormattedDate(message.timestamp)  > 10 * 60 * 1000) return

        this.inputValueBeforeEditing = String(input.value)
        input.value = message.content

        this.currentIDMessageEditing = Number(target.id)

        this.chatService.editingMessage(true)
    }

    showCorretImgMessageActionButton(event: Event) {
        const target =event.currentTarget as HTMLDivElement

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

    editMessage(inputValue: string) {
        this.chatService.editMessage(this.currentIDMessageEditing, inputValue)
    }

    stopEditMessage() {
        const input = this.input.nativeElement as HTMLTextAreaElement
        input.value = this.inputValueBeforeEditing
        this.chatService.editingMessage(false)
    }

    onKeydown(event: KeyboardEvent) {
        this.adjustHeight()
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            this.sendMessage()
        }
    }

    parseFormattedDate(formattedDate: string): number {
        const [datePart, timePart] = formattedDate.split(', ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
      
        return new Date(year, month - 1, day, hours, minutes).getTime();
    }

    allegatingFiles: boolean = false

    allegateFile() {
        this.allegatingFiles = true
    }

    confirmAllegateFile(event: Event) {
        event.preventDefault()
        const input = this.inputlink.nativeElement as HTMLInputElement
        this.chatService.allegateFile(input.value)
        this.allegatingFiles = false
    }

    deleteAllegatedFile() {
        this.chatService.allegateFile("")
    }

    exitAllegatinFileUI() {
        const input = this.inputlink.nativeElement as HTMLInputElement
        input.value = ""
        this.allegatingFiles = false
    }

    // ngOnDestroy() {
    //     this.allegatingFiles = false
    // }
}
