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


    async requestVideoAudioPermission(component: CallComponent): Promise<boolean> {
        this.callComponent = component
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

        this.localStream = new MediaStream([stream.getAudioTracks()[0], this.createEmptyVideoTrack({ width: 640, height: 480 })])
        return true
    }

    async requestVideoPermission() {
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        let videoTrack = this.localStream.getVideoTracks()[0];
        videoTrack.onended = () => { this.turnOffCamera() }
        this.sendNewVideoTrack(this.localStream)
    }

    async requestScreenSharePermission() {
        const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
        let videoTrack = stream.getVideoTracks()[0];
        videoTrack.onended = () => { this.turnOffVideoStreaming() }
        this.sendNewVideoTrack(stream)
    }

    sendNewVideoTrack(stream: MediaStream) {
        this.currentCall.peerConnection.getSenders().forEach((sender: { track: { kind: string }; replaceTrack: (arg0: any) => void }) => {
            if (sender.track.kind == "video") {
                sender.replaceTrack(stream.getVideoTracks()[0])
            }
        })

        this.callComponent.localStreamHTML.srcObject = stream
    }

    turnOffVideoStreaming() {
        this.sendNewVideoTrack(this.localStream)
    }

    async turnOffCamera() { //! non funziona, quello sopra si, funziona solo dopo una combinazione
        this.localStream = new MediaStream([this.localStream.getAudioTracks()[0], this.createEmptyVideoTrack({ width: 640, height: 480 })])
        this.sendNewVideoTrack(this.localStream)
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

    createEmptyVideoTrack({ width, height }: { width: number, height: number }) {
        const canvas = Object.assign(document.createElement('canvas'), { width, height })
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        ctx.fillStyle = "violet"
        ctx.fillRect(0, 0, width, height)

        const videoTrack = canvas.captureStream().getVideoTracks()[0]

        return Object.assign(videoTrack, { enabled: false })
    }

}
