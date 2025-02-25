import { Injectable } from "@angular/core";
import { Peer } from 'peerjs'
import { WebSocketService } from "./web-socket.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PeerService {
    peer: Peer | null = null
    permissionObtained: boolean = false
    originalMediaDevices: MediaStream | null = null

    localStream: MediaStream | null = null
    videoEnabled: boolean = false
    audioEnabled: boolean = false
    screenshareEnabled: boolean = false

    callsID: Record<number, string> = {}
    callsID$ = new BehaviorSubject<Record<number, string>>({})
    currentCall: any | null = null
    infoCall: {call_id: string, user_id: number, chat_user_id: number} | null = null

    remoteStream$ = new BehaviorSubject<any>(null)

    constructor(private webSocketService: WebSocketService) {
        this.webSocketService.on("personal_call_started").subscribe(async data => {
            this.addIncomingCall(data.sender, data.call_id)
            //todo: notification
        })
    }

    connectToPeerServer(): boolean {
        try {
            this.peer = new Peer('', { host: 'localhost', port: 3331, path: 'peerjs', secure: false }) // port: 443  secure: true  host: server_ip
            return true
        }
        catch {
            return false
        }
    }


    async requestVideoAudioPermission(): Promise<boolean> {
        try {
            this.originalMediaDevices = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            this.permissionObtained = true
            return true
        } catch {
            this.permissionObtained = false
            return false
        }
    }

    setFakeAudioAndStream() {
        this.localStream = new MediaStream([this.createEmptyAudioTrack(), this.createEmptyVideoTrack({ width: 640, height: 480 })])
    }

    async setAudio() {
        const stream = this.originalMediaDevices
        if (stream) {
            this.localStream = new MediaStream([stream.getAudioTracks()[0], this.createEmptyVideoTrack({ width: 640, height: 480 })])
            this.audioEnabled = true
        }
    }

    async setVideo() {
        const stream = this.originalMediaDevices
        if (stream) {
            this.localStream = this.originalMediaDevices
            this.videoEnabled = true
            if (this.currentCall) {
                this.sendNewVideoTrack()
            }
        }
    }

    async setScreenshare() {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        if (stream) {
            this.localStream = stream
            this.screenshareEnabled = true
            if (this.currentCall) {
                this.sendNewVideoTrack()
            }
        }
    }

    async turnOffCamera() {
        if (!this.localStream) return
        this.localStream = new MediaStream([this.localStream.getAudioTracks()[0], this.createEmptyVideoTrack({ width: 640, height: 480 })])
        this.sendNewVideoTrack()
    }

    async turnOffScreenshare() {
        if (!this.localStream) return
        this.localStream = new MediaStream([this.localStream.getAudioTracks()[0], this.createEmptyVideoTrack({ width: 640, height: 480 })])
        this.sendNewVideoTrack()
    }

    sendNewVideoTrack() {
        if (!this.currentCall || !this.currentCall.peerConnection) return

        this.currentCall.peerConnection.getSenders().forEach((sender: RTCRtpSender) => {
            if (sender.track?.kind === "video" && this.localStream) { 
                sender.replaceTrack(this.localStream.getVideoTracks()[0])
            }
        })
    }

    addIncomingCall(user_id: number, call_id: string) {
        this.callsID[user_id] = call_id
        this.callsID$.next(this.callsID)
        console.debug('chiamata da questo utente!', user_id)
    }

    removeOutgoingCall(user_id: number) {
        delete this.callsID[user_id]
        this.callsID$.next(this.callsID)
        console.debug('rimossa chiamata da utente!', user_id)
    }

    startCall(chat_user_id: number) {
        if (!this.peer) return false

        this.webSocketService.emit('start_personal_call', {receiver: chat_user_id})

        this.setFakeAudioAndStream()

        if (!this.localStream) return false
        
        const call = this.peer.call(chat_user_id.toString(), this.localStream)
        this.currentCall = call

        call.on('stream', (remoteStream) => {
            this.remoteStream$.next(remoteStream)
        })
  
        call.on('close', () => {
            console.debug('chiamata terminata')
        })

        return true
    }

    enterCall(user_id: number): boolean {

        // se gia in un altra chiamata uscire dalla corrente e spostarsi in questa

        const call_id = this.callsID[user_id]
        if(!this.peer || !call_id) return false

        this.setFakeAudioAndStream()

        if (!this.localStream) return false
        
        const call = this.peer.call(call_id, this.localStream)
        this.currentCall = call

        call.on('stream', (remoteStream) => {
            this.remoteStream$.next(remoteStream)
        })
  
        call.on('close', () => {
            console.debug('chiamata terminata')
        })

        return true
    }

    ExitCall() { 
        if (this.currentCall) {
            this.currentCall.close()
            this.currentCall = null
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

    createEmptyAudioTrack() {
        const ctx = new AudioContext()
        const oscillator = ctx.createOscillator()
        const destination = ctx.createMediaStreamDestination()
        oscillator.connect(destination)
        oscillator.start()
    
        const audioTrack = destination.stream.getAudioTracks()[0]
        return Object.assign(audioTrack, { enabled: false })
    }

}
