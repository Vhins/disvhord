import { AfterViewInit, Component, ElementRef, viewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { ActivatedRoute } from '@angular/router';
import { CallComponent } from '../../call/call.component';
import { MessageComponent } from "../message/message.component";
import { AddLinkPopupComponent } from "../add-link-popup/add-link-popup.component";
import { ChatInputComponent } from "../chat-input/chat-input.component";
import { MessagesService } from '../messages.service';
import { PeerService } from '../../../peer.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CallComponent, MessageComponent, AddLinkPopupComponent, ChatInputComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements AfterViewInit {
    private scrollContainer = viewChild.required<ElementRef<HTMLDivElement>>('scrollContainer')
    newChat: boolean = false
    _callsID: Record<number, string> = this.peerService.callsID

    constructor (public chatService: ChatService, private activatedRoute: ActivatedRoute, public messagesService: MessagesService, private peerService: PeerService) {
        this.newChat = true
        this.activatedRoute.paramMap.subscribe(async param => {
            this.newChat = true
            const paramCHAT_ID = param.get('chat_id')
            if (paramCHAT_ID !== "me") {
                this.chatService.setThisChatID(Number(paramCHAT_ID))
            } else {
                this.chatService.setThisChatID(paramCHAT_ID)
            }
            this.messagesService.getMessages(this.chatService.chat_id, 1, paramCHAT_ID === "me")
            this.chatService.allegatingLink.set(false)
            this.chatService.allegatedLink = ""
            this.chatService.editingMessageMode.set(false)
            this.messagesService.firstRender = true
            this._callsID = this.peerService.callsID
            this.loadedAllChatMessage = false
            this.oneTime = false
            if (this._callsID[this.chatService.chat_user_id]) {
                this.aCallHasStarted = true
            } else {
                this.aCallHasStarted = false
            }
            try {
                const element = this.scrollContainer().nativeElement
                this.scrollDownChat(false, element)
            } catch{}
            
        })

        this.chatService.callThisChat$.subscribe((callNow) => {
            if (callNow) {
                this.callThisChat()
            }
        })

        this.peerService.callsID$.subscribe((callsID) => {
            this._callsID = callsID
            if (this._callsID[this.chatService.chat_user_id]) {
                this.aCallHasStarted = true
            }
        })
    }

    times = 1
    oneTime = false
    loadedAllChatMessage = false
    async onScroll() {
        if (this.oneTime || this.loadedAllChatMessage) return
        const container = this.scrollContainer().nativeElement as HTMLDivElement   
        if (container.scrollTop - 300 <= 0) {
            this.oneTime = true
            this.times++
            let before = container.scrollHeight
            const has_loaded_more_msg = await this.messagesService.getMessages(this.chatService.chat_id, this.times)
            if (!has_loaded_more_msg) {
                this.loadedAllChatMessage = true
            } else {
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        container.scrollTop = container.scrollHeight - before + 300
                        this.oneTime = false
                    })
                }, 50)
            }
        }
    }

    async ngAfterViewInit() {
        const element = this.scrollContainer().nativeElement
        
        this.messagesService.scrollDownChat$.subscribe((forceScroll) => {
            this.scrollDownChat(forceScroll, element)
        })

        element.addEventListener('scroll', () => this.onScroll(), {passive: true})
    }

    scrollDownChat(forceScroll: boolean, element: HTMLDivElement) {
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
    }


    editingMessage(message_id: number) {
        this.chatService.allegatedLink = ""
        this.chatService.allegatingLink.set(false)

        const message = this.messagesService.messages!.find(message => { return message.message_id == message_id })
        if (!message) return
        if (message.sender != this.chatService.user_id) return

        if (Date.now() - Number(message.timestamp)  > 10 * 60 * 1000) return

        const processed_message_content = message.content
        this.chatService.currentEditingMessageText$.next(processed_message_content)

        this.chatService.currentIDMessageEditing = message_id

        this.chatService.editingMessageMode.set(true)
    }

    aCallHasStarted: boolean = false

    async callThisChat() {
        this.aCallHasStarted = true
        
        const status = await this.peerService.requestVideoAudioPermission()
        if (!status) { console.debug('status', status); return }

        const status2 = this.peerService.connectToPeerServer()
        if (!status2) { console.debug('status2', status2); return }

        const chat_user_id = this.chatService.chat_user_id
        const status3 = this.peerService.startCall(chat_user_id, this.chatService.users_info[chat_user_id].name, this.chatService.users_info[chat_user_id].logo)
        if (!status3) { console.debug('status3', status3); return }
    }

}
