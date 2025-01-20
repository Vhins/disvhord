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

    callID!: any

    constructor(private webSocketService: WebSocketService) {}


    async requestPermission(component: CallComponent): Promise<boolean> {
        this.callComponent = component

        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        
        if (this.callComponent.localStreamHTML) {
            this.callComponent.localStreamHTML.srcObject = this.localStream
            // this.callComponent.localStreamHTML.muted = true
            //this.stream.play()
            return true
        }
        return false
    }

    connectToServer(): boolean {
        try {
            this.peer = new Peer('', { host: 'localhost', port: 3331, path: 'peerjs', secure: false }) // port: 443  secure: true  host: server_ip
            return true
        }
        catch {
            return false
        }
    }

    startConnectionToPeerServerAndStartCall(user_id: number, chat_user_id: number) {
        if (!this.connectToServer()) return false

        this.peer.on('open', id => {
            this.callID = id
            this.webSocketService.emit("start_personal_call", { sender: user_id, receiver: chat_user_id, call_id: id })

            this.peer.on('call', call => {
                // this.callComponent.localStreamHTML.muted = false

                call.answer(this.localStream)
                this.currentCall = call
    
                call.on('stream', remoteStream => {
                    this.callComponent.remoteStreamHTML.srcObject = remoteStream
                })
            })
        })


        return true
    }

    startConnectionToPeerServerAndEnterCall(call_id: string): boolean {
        if (!this.connectToServer()) return false

        this.peer.on('open', () => {
            this.peer.on('call', call => {
                // this.callComponent.localStreamHTML.muted = false

                call.answer(this.localStream)
                this.currentCall = call
    
                call.on('stream', remoteStream => {
                    this.callComponent.remoteStreamHTML.srcObject = remoteStream
                })
            })
    
            const call = this.peer.call(call_id, this.localStream)
            this.currentCall = call
        })

        return true
    }

    ExitCall() {
        if (this.currentCall) {
            this.currentCall.close()
            this.currentCall = null
            this.callComponent.remoteStreamHTML.srcObject = null
            this.callComponent.localStreamHTML.srcObject = null
        }
    }

}
