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

    localStream!: MediaStream
    videoEnabled: boolean = true
    audioEnabled: boolean = true
    currentCall!: any

    callID!: string

    constructor(private webSocketService: WebSocketService) {}


    async requestAudioPermission(component: CallComponent): Promise<boolean> {
        this.callComponent = component
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        return true
    }

    // this.currentCall.close()
    // this.currentCall.answer(this.localStream)

    async requestVideoPermission() {
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

        this.currentCall.peerConnection.getSenders().forEach((sender: { track: { kind: string }; replaceTrack: (arg0: any) => void }) => {
            if (sender.track.kind == "video") {
                sender.replaceTrack(this.localStream.getTracks()[0])
                this.callComponent.localStreamHTML.srcObject = this.localStream
                // this.currentCall.addTrack() ???????
            }
        })
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

    setupYourStream() {
        if (this.callComponent.localStreamHTML) {
            this.callComponent.localStreamHTML.srcObject = this.localStream
            this.callComponent.localStreamHTML.muted = true
            this.callComponent.localStreamHTML.play()
        }
    }

    startConnectionToPeerServerAndStartCall(user_id: number, chat_user_id: number) {
        if (!this.connectToServer()) return false

        this.peer.on('open', id => {
            this.callID = id

            this.setupYourStream()

            this.webSocketService.emit("start_personal_call", { sender: user_id, receiver: chat_user_id, call_id: id })

            this.peer.on('call', call => {
                this.currentCall = call

                call.on('error', error => { console.error('error', error) })

                call.answer(this.localStream)

                call.on('stream', remoteStream => {
                    this.callComponent.remoteStreamHTML.srcObject = remoteStream
                })


                this.callComponent.other_user_has_connected = true
            })
        })


        return true
    }

    startConnectionToPeerServerAndEnterCall(call_id: string): boolean {
        if (!this.connectToServer()) return false

        this.peer.on('open', () => {
            this.setupYourStream()

            const call = this.peer.call(call_id, this.localStream)
            this.currentCall = call

            call.on('error', error => { console.error('error', error) })

            call.on('stream', remoteStream => {
                this.callComponent.remoteStreamHTML.srcObject = remoteStream
            })
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
