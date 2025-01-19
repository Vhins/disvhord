import { Component, ElementRef, Injectable, Input, ViewChild, ViewRef } from '@angular/core';
import { PeerService } from '../../peer.service';
import { ChatService } from '../../chat.service';

@Injectable({
    providedIn: 'root'
})
@Component({
  selector: 'app-call',
  standalone: true,
  imports: [],
  templateUrl: './call.component.html',
  styleUrl: './call.component.css'
})
export class CallComponent {
    @ViewChild('localVideo') refLocalVideo!: ElementRef
    @ViewChild('remoteVideo') refRemoteVideo!: ElementRef

    @Input() callid!: any

    constructor(private peerService: PeerService) {}

    localStream!: HTMLVideoElement
    remoteStream!: HTMLVideoElement

    loaded: boolean = false

    ngAfterViewInit() {
        this.localStream = this.refLocalVideo.nativeElement as HTMLVideoElement
        this.remoteStream = this.refRemoteVideo.nativeElement as HTMLVideoElement
        this.loaded = true
        console.log('ngAfterViewInit eseguito, loaded:', this.loaded);
    }

    async startConnectionToPeerServer() {
        console.log('cool')
        await this.waitForViewInit()
        console.log('cool2')
        this.peerService.startConnectionToPeerServer(this)
    }

    private waitForViewInit(): Promise<void> {
        return new Promise((resolve) => {
            const checkLoaded = () => {
                console.log('this.loaded', this.loaded)
                if (this.loaded) {
                    resolve()
                } else {
                    console.log('la')
                    setTimeout(checkLoaded, 50)
                }
            }
            checkLoaded()
        })
    }

    startCall(user_id: number, chat_user_id: number) {
        this.peerService.startCall(user_id, chat_user_id)
    }

    enterCall(callid: string, user_id: number, chat_user_id: number) {
        this.peerService.enterCall(callid, user_id, chat_user_id)
    }

    exitCall() {

    }

}
