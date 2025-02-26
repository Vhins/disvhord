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

    other_user_has_connected: boolean = false

    tezt() {
        this.peerService.setAudioVideo()
    }

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

            remoteStreamCache = remoteStream
            this.refRemoteVideo().nativeElement.srcObject = remoteStream
            this.refRemoteVideo().nativeElement.muted = false
            this.refRemoteVideo().nativeElement.play()
        })
    }

    async enterCall() {
        const status = await this.peerService.requestVideoAudioPermission()
        if (!status) { console.debug('status', status); return }

        const status2 = this.peerService.connectToPeerServer()
        if (!status2) { console.debug('status2', status2); return }

        this.peerService.enterCall(this.chat_user_id())
    }

    exitCall() {
        this.peerService.ExitCall()
    }

    turnOnCamera() {
        this.peerService.setVideo()
    }

    turnOffCamera() {
        this.peerService.turnOffCamera()
    }

    turnOffVideoStreaming() {
        this.peerService.turnOffScreenshare()
    }

    turnOnScreenshare() {
        this.peerService.setScreenshare()
    }
    
}
