import { Injectable } from "@angular/core";
import { Peer } from 'peerjs'
import { CallComponent } from "./components/call/call.component";
import { WebSocketService } from "./web-socket.service";

@Injectable({
    providedIn: 'root'
})
export class PeerService {
    peer!: Peer
    callComponent!: CallComponent

    localStream!: any
    videoEnabled: any = true
    audioEnabled: any = true
    currentCall!: any
    stream!: any


    constructor(private webSocketService: WebSocketService) {}


    async startConnectionToPeerServer(component: CallComponent) {
        this.peer = new Peer('', { host: 'localhost', port: 3331, path: 'peerjs', secure: false }) // port: 443  secure: true  host: server_ip

        this.callComponent = component
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        this.localStream = this.stream
        
        if (this.callComponent.refLocalVideo?.nativeElement) {
            this.callComponent.refLocalVideo.nativeElement.srcObject = this.stream
        }
    }


    startCall(user_id: number, chat_user_id: number) {
        this.peer.on('open', id => {
            console.log('id peer:', id)

            this.webSocketService.emit("start_personal_call", { "sender": user_id, "receiver": chat_user_id, "call_id": id })
            const call = this.peer.call(id, this.stream)
            this.currentCall = call
            call.on('stream', remoteStream => {
                this.callComponent.remoteStream.srcObject = remoteStream
            })
        })
    }


    enterCall(callid: string, user_id: number, chat_user_id: number) {
        this.peer.on('call', call => {
            call.answer(this.stream)
            this.currentCall = call
    
            call.on('stream', remoteStream => {
                this.callComponent.remoteStream.srcObject = remoteStream
            })
        })
    }

}
