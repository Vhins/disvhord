import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ChatService } from '../../chat.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
    @ViewChild('scrollContainer') scrollContainer!: ElementRef
    @ViewChild('input_container') input_container!: ElementRef
    @ViewChild('input') input!: ElementRef
    @ViewChild('inputlink') inputlink!: ElementRef
    @ViewChild('text_area') text_area!: ElementRef
    @ViewChild('input_box') input_box!: ElementRef
    @ViewChildren('messageRef') messageElements!: QueryList<ElementRef>

    private scrollDownNowSubscription!: Subscription;
    newChat: boolean = false

    constructor (public chatService: ChatService, private activatedRoute: ActivatedRoute) {
        this.newChat = true
        this.activatedRoute.paramMap.subscribe(async param => {
            this.newChat = true
            this.chatService.setThisChatID(Number(param.get('chat_id')))
            this.allegatingFiles = false
            this.chatService.allegateFile("")
            this.chatService.editingMessage(false)
        })

        this.scrollDownNowSubscription = this.chatService.scrollDownNow.asObservable().subscribe(value => {
            const element = this.scrollContainer.nativeElement
            element.scrollTop = element.scrollHeight
            console.log('scroll down')  
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
        const element = this.scrollContainer.nativeElement
        element.scrollTop = element.scrollHeight
        const suvb = this.messageElements.changes.subscribe(() => {
            if (this.newChat === true ){
                const element = this.scrollContainer.nativeElement
                element.scrollTop = element.scrollHeight
                this.newChat = false

                const input = this.input.nativeElement as HTMLInputElement
                input.value = ""
                const inputlink = this.inputlink.nativeElement as HTMLInputElement
                inputlink.value = ""
                this.adjustHeight()
                this.chatService.editingMessage(false)
            } else {
                const element = this.scrollContainer.nativeElement as HTMLDivElement
                console.log('aggiungere condizioni', element.scrollHeight, 'g:', element.clientHeight)
                element.scrollTop = element.scrollHeight
            }
        })
    }

    heightWidgetEdit_Attachment: string = "80"

    adjustHeight(): void {
        const textarea = this.text_area.nativeElement as HTMLTextAreaElement
        textarea.removeAttribute('style')


        if (textarea.scrollHeight > 102) { 
            textarea.style.lineHeight = "30px"
            textarea.style.height = `${textarea.scrollHeight}px`
        } else {
            textarea.style.lineHeight = "60px"
            textarea.style.height = `${textarea.scrollHeight}px`
        }

        const input_box = this.input_box.nativeElement as HTMLDivElement
        this.heightWidgetEdit_Attachment = String(window.getComputedStyle(input_box).height)

        const input_container = this.input_container.nativeElement as HTMLDivElement
        input_container.style.minHeight = `${42 + textarea.scrollHeight}px`

        const element = this.scrollContainer.nativeElement
        element.scrollTop = element.scrollHeight
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
        this.exAllegatedFile = this.chatService.allegatedFile
        this.chatService.allegateFile("")
        this.exitAllegatinFileUI()

        const input = this.input.nativeElement as HTMLTextAreaElement //todo: convert input textarea to a div
        const target = event.currentTarget as HTMLButtonElement

        const message = this.chatService.messages.find(message => { return message.message_id == Number(target.id) })
        if (!message) return
        if (message.sender != this.chatService.user_id) return

        const currentTimestamp = Date.now()
        if (currentTimestamp - this.parseFormattedDate(message.timestamp)  > 10 * 60 * 1000) return

        this.inputValueBeforeEditing = String(input.value)
        input.value = message.content

        this.currentIDMessageEditing = Number(target.id)

        this.adjustHeight()

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

    exAllegatedFile: string = ''

    editMessage(inputValue: string) {
        this.chatService.editMessage(this.currentIDMessageEditing, inputValue)
        this.chatService.allegateFile(this.exAllegatedFile)
    }

    stopEditMessage() {
        const input = this.input.nativeElement as HTMLTextAreaElement
        input.value = this.inputValueBeforeEditing
        this.chatService.editingMessage(false)
        this.chatService.allegateFile(this.exAllegatedFile)
        this.adjustHeight()
    }

    onKeydown(event: KeyboardEvent) {
        this.adjustHeight()
        console.log('bro ;)')
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
        if (!this.chatService.editingMessageMode) {
            this.allegatingFiles = true
        }
    }

    confirmAllegateFile(event: Event) {
        event.preventDefault()
        if (!this.chatService.editingMessageMode) {
            const input = this.inputlink.nativeElement as HTMLInputElement
            this.chatService.allegateFile(input.value)
            this.allegatingFiles = false
        }
    }

    deleteAllegatedFile() {
        this.chatService.allegateFile("")
    }

    exitAllegatinFileUI() {
        const input = this.inputlink.nativeElement as HTMLInputElement
        input.value = ""
        this.allegatingFiles = false
    }

    ngOnDestroy(): void {
        this.scrollDownNowSubscription.unsubscribe()
        this.allegatingFiles = false
    }
}
