import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ChatService } from './chat.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../web-socket.service';
import { CallComponent } from '../call/call.component';
import { MessageComponent } from "./message/message.component";
import { AddLinkPopupComponent } from "./add-link-popup/add-link-popup.component";
import { ChatInputComponent } from "./chat-input/chat-input.component";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CallComponent, MessageComponent, AddLinkPopupComponent, ChatInputComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
    @ViewChild('scrollContainer') scrollContainer!: ElementRef
    @ViewChild('input_container') input_container!: ElementRef
    @ViewChildren('messageRef') messageElements!: QueryList<ElementRef>


    private scrollDownNowSubscription!: Subscription;
    newChat: boolean = false

    @ViewChild(CallComponent) callComponent!: CallComponent;

    constructor (public chatService: ChatService, private activatedRoute: ActivatedRoute, private webSocketService: WebSocketService) {
        this.newChat = true
        this.activatedRoute.paramMap.subscribe(async param => {
            this.newChat = true
            this.chatService.setThisChatID(Number(param.get('chat_id')))
            this.chatService.allegatingLink = false
            this.chatService.allegateLink("")
            this.chatService.editingMessage(false)
        })

        this.webSocketService.on("personal_call_started").subscribe(async data => {
            this.aCallHasStarted = true
            this.callComponent.infoCall = {call_id: data.call_id, user_id: data.sender, chat_user_id: data.receiver}
            this.callComponent.callid = data.call_id

            const status = await this.callComponent.requestPermission()
            if (!status) { console.log('status', status); return }
        })
    }

    currentIDMessageEditing!: number
    inputValueBeforeEditing!: string

    ngAfterViewInit() {
        this.scrollDownNowSubscription = this.chatService.scrollDownNow.asObservable().subscribe(value => {
            const element = this.scrollContainer.nativeElement
            element.scrollTop = element.scrollHeight
        })

        const input = this.input.nativeElement as HTMLInputElement
        input.value = ""
        // this.inputlinkValue = ""
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
                // this.inputlinkValue = ""
                this.adjustHeight()
                this.chatService.editingMessage(false)
            } else {
                const element = this.scrollContainer.nativeElement as HTMLDivElement
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

        this.heightWidgetEdit_Attachment = String(Number(window.getComputedStyle(input_box).height.slice(0, -2)) + 10) + "px"

        const input_container = this.input_container.nativeElement as HTMLDivElement
        input_container.style.minHeight = `${42 + textarea.scrollHeight}px`

        const element = this.scrollContainer.nativeElement
        element.scrollTop = element.scrollHeight
    }



    deleteMessage(event: Event) {
        const target = event.currentTarget as HTMLButtonElement
        const message_id = Number(target.id)
        this.chatService.deleteMessage(message_id)
    }

    editingMessage(event: Event) {
        this.exAllegatedFile = this.chatService.allegatedLink
        this.chatService.allegateLink("")
        // this.exitAllegatinFileUI()

        const input = this.input.nativeElement as HTMLTextAreaElement
        const target = event.currentTarget as HTMLButtonElement

        if (!this.chatService.messages) {
            this.stopEditMessage()
            return
        }
        const message = this.chatService.messages.find(message => { return message.message_id == Number(target.id) })
        if (!message) return
        if (message.sender != this.chatService.user_id) return

        const currentTimestamp = Date.now()
        if (currentTimestamp - this.parseFormattedDate(message.timestamp)  > 10 * 60 * 1000) return

        this.inputValueBeforeEditing = String(input.value)
        const processed_message_content = message.content.
        replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/&nbsp;/g, ' ')
        .replace(/<a\s+href="([^"]+)"[^>]*>[^<]*<\/a>/gi, '$1')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        input.value = processed_message_content

        this.currentIDMessageEditing = Number(target.id)

        this.adjustHeight()

        this.chatService.editingMessage(true)
    }

    exAllegatedFile: string = ''

    stopEditMessage() {
        const input = this.input.nativeElement as HTMLTextAreaElement
        input.value = this.inputValueBeforeEditing
        this.chatService.editingMessage(false)
        this.chatService.allegateLink(this.exAllegatedFile)
        this.adjustHeight()
    }

    typing: boolean = true
    startTyping() {
        this.typing = true
    }
    stopTyping() {
        this.typing = false
    }

    onKeydown(event: KeyboardEvent) {
        this.adjustHeight()
        const textarea = this.text_area.nativeElement as HTMLDivElement
        textarea.innerHTML = "textarea.innerHTML" + String.fromCharCode(event.keyCode)
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

    ngOnDestroy(): void {
        this.scrollDownNowSubscription.unsubscribe()
        this.chatService.allegatingLink = false
    }

    aCallHasStarted: boolean = false

    async callThisChat() {
        console.log('suco')
        this.aCallHasStarted = true
        
        const status = await this.callComponent.requestPermission()
        if (!status) { console.log('status', status); return }

        const status2 = await this.callComponent.startConnectionToPeerServerAndStartCall(this.chatService.user_id, this.chatService.chat_user_id)
        if (!status2) { console.log('status2', status2); return }
    }






    onOpenAddLinkPopup() {
        this.chatService.allegatingLink = true
    }

    deleteAllegatedLink() {
        this.chatService.allegatingLink = false
        this.chatService.allegateLink("")
    }

}
