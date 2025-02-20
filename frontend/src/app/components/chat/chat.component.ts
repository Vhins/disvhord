import { Component, ElementRef, QueryList, viewChild, ViewChild, ViewChildren } from '@angular/core';
import { ChatService } from './chat.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../web-socket.service';
import { CallComponent } from '../call/call.component';
import { MessageComponent } from "./message/message.component";
import { AddLinkPopupComponent } from "./add-link-popup/add-link-popup.component";
import { ChatInputComponent } from "./chat-input/chat-input.component";
import { MessagesService } from './messages.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CallComponent, MessageComponent, AddLinkPopupComponent, ChatInputComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
    // @ViewChild('scrollContainer') scrollContainer!: ElementRef
    private scrollContainer = viewChild.required<ElementRef>('scrollContainer')
    @ViewChild('input_container') input_container!: ElementRef
    @ViewChildren('messageRef') messageElements!: QueryList<ElementRef>


    private scrollDownNowSubscription!: Subscription;
    newChat: boolean = false

    @ViewChild(CallComponent) callComponent!: CallComponent;

    constructor (public chatService: ChatService, private activatedRoute: ActivatedRoute, private webSocketService: WebSocketService, public messagesService: MessagesService) {
        this.newChat = true
        this.activatedRoute.paramMap.subscribe(async param => {
            this.newChat = true
            this.chatService.setThisChatID(Number(param.get('chat_id')))
            this.messagesService.getMessages(Number(param.get('chat_id')))
            this.chatService.allegatingLink.set(false)
            this.chatService.allegatedLink = ""
            this.chatService.editingMessageMode.set(false)
        })

        this.webSocketService.on("personal_call_started").subscribe(async data => {
            this.aCallHasStarted = true
            this.callComponent.infoCall = {call_id: data.call_id, user_id: data.sender, chat_user_id: data.receiver}
            this.callComponent.callid = data.call_id

            const status = await this.callComponent.requestPermission()
            if (!status) { console.debug('status', status); return }
        })
    }

    ngAfterViewInit() {
        this.scrollDownNowSubscription = this.chatService.scrollDownNow.asObservable().subscribe(value => {
            const element = this.scrollContainer().nativeElement
            element.scrollTop = element.scrollHeight
        })

        // const input = this.input.nativeElement as HTMLInputElement
        // input.value = ""
        // this.inputlinkValue = ""
        // this.adjustHeight()
        const element = this.scrollContainer().nativeElement
        element.scrollTop = element.scrollHeight
        const suvb = this.messageElements.changes.subscribe(() => {
            if (this.newChat === true ){
                const element = this.scrollContainer().nativeElement
                element.scrollTop = element.scrollHeight
                this.newChat = false

                // const input = this.input.nativeElement as HTMLInputElement
                // input.value = ""
                // this.inputlinkValue = ""
                // this.adjustHeight()
                this.chatService.editingMessageMode.set(false)
            } else {
                const element = this.scrollContainer().nativeElement as HTMLDivElement
                element.scrollTop = element.scrollHeight
            }
        })
    }

    heightWidgetEdit_Attachment: string = "80"

    editingMessage(message_id: number) {
        this.chatService.allegatedLink = ""
        this.chatService.allegatingLink.set(false)

        const message = this.messagesService.messages!.find(message => { return message.message_id == message_id })
        console.log('messagemessage', message)
        if (!message) return
        if (message.sender != this.chatService.user_id) return

        if (Date.now() - Number(message.timestamp)  > 10 * 60 * 1000) return

        const processed_message_content = this.convertMessageToBrowserFormat(message.content)
        this.chatService.currentEditingMessageText$.next(processed_message_content)

        this.chatService.currentIDMessageEditing = message_id

        // this.adjustHeight()

        this.chatService.editingMessageMode.set(true)
    }

    typing: boolean = true
    startTyping() {
        this.typing = true
    }
    stopTyping() {
        this.typing = false
    }

    convertMessageToBrowserFormat(content: string): string {
        return content
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
            // .replace(/<br\s*\/?>/gi, '\n')
            .replace(/&nbsp;/g, ' ')
            //?  .replace(/<a\s+href="([^"]+)"[^>]*>[^<]*<\/a>/gi, '$1')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
    }
    

    ngOnDestroy(): void {
        this.scrollDownNowSubscription.unsubscribe()
    }

    aCallHasStarted: boolean = false

    async callThisChat() {
        console.debug('callThisChat')
        this.aCallHasStarted = true
        
        const status = await this.callComponent.requestPermission()
        if (!status) { console.debug('status', status); return }

        const status2 = await this.callComponent.startConnectionToPeerServerAndStartCall(this.chatService.user_id, this.chatService.chat_user_id)
        if (!status2) { console.debug('status2', status2); return }
    }










}
