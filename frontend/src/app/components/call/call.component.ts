import { Component, ElementRef, Injectable, input, OnInit, viewChild } from '@angular/core';
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
export class CallComponent implements OnInit {
    private refLocalVideo = viewChild.required<ElementRef<HTMLVideoElement>>('localVideo')
    private refRemoteVideo = viewChild.required<ElementRef<HTMLVideoElement>>('remoteVideo')
    chat_user_id = input.required<number>()

    constructor(private peerService: PeerService) {}

    other_user_is_connected: boolean = false

    ngOnInit() {
        this.peerService.localStream$.subscribe(localStream => {
            if (!localStream) return

            this.refLocalVideo().nativeElement.srcObject = localStream
            this.refLocalVideo().nativeElement.muted = true
            this.refLocalVideo().nativeElement.play()
        })
        
        let remoteStreamCache: MediaStream
        this.peerService.remoteStream$.subscribe(remoteStream => {
            if (!remoteStream || remoteStreamCache === remoteStream) return
            this.other_user_is_connected = true

            remoteStreamCache = remoteStream
            this.refRemoteVideo().nativeElement.srcObject = remoteStream
            this.refRemoteVideo().nativeElement.muted = false
            this.refRemoteVideo().nativeElement.play()
        })

        this.peerService.closeCall$.subscribe(closeCall => {
            if (!closeCall) return
            this.other_user_is_connected = false
            this.exitCall()
        })
    }

    async enterCall() {
        const status = await this.peerService.requestVideoAudioPermission()
        if (!status) { console.debug('status', status); return }

        const status2 = this.peerService.connectToPeerServer()
        if (!status2) { console.debug('status2', status2); return }

        this.peerService.enterCall(this.chat_user_id())
    }

    toggleCamera(toggle: boolean) {
        this.peerService.toggleCamera(toggle)
    }
    toggleAudio(toggle: boolean) {
        this.peerService.toggleAudio(toggle)
    }
    // toggleScreenshare(toggle: boolean) {
    //     this.peerService.toggleScreenshare(toggle)
    // }
    
    exitCall() {
        this.other_user_is_connected = false
        this.peerService.ExitCall()
    }
}
