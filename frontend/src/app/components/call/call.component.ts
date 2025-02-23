import { Component, ElementRef, Injectable, ViewChild } from '@angular/core';
import { PeerService } from '../../peer.service';

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
    @ViewChild('localVideo', {static: true}) refLocalVideo!: ElementRef
    @ViewChild('remoteVideo',{static: true}) refRemoteVideo!: ElementRef

    ngAfterViewInit() {
        this.localStreamHTML = this.refLocalVideo.nativeElement as HTMLVideoElement
        this.remoteStreamHTML = this.refRemoteVideo.nativeElement as HTMLVideoElement
    }

    callid!: string

    constructor(private peerService: PeerService) {}

    localStreamHTML!: HTMLVideoElement
    remoteStreamHTML!: HTMLVideoElement

    other_user_has_connected: boolean = false

    async requestPermission(): Promise<boolean> {
        return await this.peerService.requestVideoAudioPermission(this)
    }

    async requestVideoPermission() {
        this.peerService.requestVideoPermission()
    }

    async requestScreenSharePermission() {
        this.peerService.requestScreenSharePermission()
    }

    turnOffCamera() {
        this.peerService.turnOffCamera()
    }

    turnOffVideoStreaming() {
        this.peerService.turnOffVideoStreaming()
    }

    async startConnectionToPeerServerAndStartCall(user_id: number, chat_user_id: number): Promise<boolean> {
        return this.peerService.startConnectionToPeerServerAndStartCall(user_id,chat_user_id)
    }

    async enterCall(): Promise<boolean> {
        if (this.callid) {
            return this.peerService.startConnectionToPeerServerAndEnterCall(this.callid)
        } else {
            return false
        }
    }

    infoCall!: {call_id: string, user_id: number, chat_user_id: number}

    exitCall() {
        this.peerService.ExitCall()
    }

}
