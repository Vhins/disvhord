import { AfterViewInit, Component, ElementRef, Signal, viewChild, ViewChild, viewChildren } from '@angular/core';
import { ChatService } from './chat.service';
import { ActivatedRoute } from '@angular/router';
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
export class ChatComponent implements AfterViewInit {
    private scrollContainer = viewChild.required<ElementRef>('scrollContainer')
    // private callComponent = viewChildren<Signal<CallComponent>>('callComponent')
    @ViewChild(CallComponent) callComponent!: CallComponent
    newChat: boolean = false


    constructor (public chatService: ChatService, private activatedRoute: ActivatedRoute, private webSocketService: WebSocketService, public messagesService: MessagesService) {
        this.newChat = true
        this.activatedRoute.paramMap.subscribe(async param => {
            this.newChat = true
            this.chatService.setThisChatID(Number(param.get('chat_id')))
            this.messagesService.getMessages(Number(param.get('chat_id')))
            this.chatService.allegatingLink.set(false)
            this.chatService.allegatedLink = ""
            this.chatService.editingMessageMode.set(false)
            this.messagesService.firstRender = true
        })

        this.webSocketService.on("personal_call_started").subscribe(async data => {
            console.log('giuasto??')
            this.aCallHasStarted = true
            this.callComponent.infoCall = {call_id: data.call_id, user_id: data.sender, chat_user_id: data.receiver}
            this.callComponent.callid = data.call_id

            const status = await this.callComponent.requestPermission()
            if (!status) { console.debug('status', status); return }
        })

        this.chatService.callThisChat$.subscribe((callNow)=> {
            if (callNow) {
                this.callThisChat()
            }
        })
    }

    async ngAfterViewInit() {
        const element = this.scrollContainer().nativeElement

        this.messagesService.scrollDownChat$.subscribe((forceScroll) => {
            const firstRender = this.messagesService.firstRender
            if (firstRender && !forceScroll) return

            if (forceScroll || element.scrollTop + element.clientHeight >= element.scrollHeight - 190) {
                setTimeout(() => {
                    if (!firstRender) {
                        element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' })
                    } else {
                        element.scrollTop = element.scrollHeight
                    }
                })
            }
        })
    }


    editingMessage(message_id: number) {
        this.chatService.allegatedLink = ""
        this.chatService.allegatingLink.set(false)

        const message = this.messagesService.messages!.find(message => { return message.message_id == message_id })
        if (!message) return
        if (message.sender != this.chatService.user_id) return

        if (Date.now() - Number(message.timestamp)  > 10 * 60 * 1000) return

        const processed_message_content = this.messagesService.convertMessageToBrowserFormat(message.content)
        this.chatService.currentEditingMessageText$.next(processed_message_content)

        this.chatService.currentIDMessageEditing = message_id

        this.chatService.editingMessageMode.set(true)
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
