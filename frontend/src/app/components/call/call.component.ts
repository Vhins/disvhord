import { Component, ElementRef, Injectable, input, viewChild } from '@angular/core';
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
    private refLocalVideo = viewChild.required<ElementRef<HTMLVideoElement>>('localVideo')
    private refRemoteVideo = viewChild.required<ElementRef<HTMLVideoElement>>('localVideo')
    chat_user_id = input.required<number>()

    constructor(private peerService: PeerService) {}

    other_user_has_connected: boolean = false

    async requestPermission(): Promise<boolean> {
        return await this.peerService.requestVideoAudioPermission()
    }

    async enterCall() {
        this.peerService.enterCall(this.chat_user_id())
    }

    exitCall() {
        this.peerService.ExitCall()
    }

    turnOffCamera() {
        this.peerService.turnOffCamera()
    }

    turnOffVideoStreaming() {
        this.peerService.turnOffScreenshare()
    }
    
}
