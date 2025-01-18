import { Component, ElementRef, Input, ViewChild, ViewRef } from '@angular/core';
import { PeerService } from '../../peer.service';

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

    constructor(private peerService: PeerService) {

    }

    localStream!: HTMLVideoElement
    remoteStream!: HTMLVideoElement

    ngAfterViewInit() {
        this.localStream = this.refLocalVideo.nativeElement as HTMLVideoElement
        this.remoteStream = this.refRemoteVideo.nativeElement as HTMLVideoElement

        this.peerService.setCallComponent(this)
        this.peerService.requestPermission()
    }

    ngOnDestroy() {
        this.peerService.stopCall()
    }

    startCall() {
        this.peerService.startCall(this.callid)
    }
}
